from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import boto3
from dotenv import load_dotenv
import json
import os
import traceback

# Import the prompt templates
from prompts import CATEGORY_PROMPTS

# Load environment variables with override=True so it ignores old cached terminal env vars
load_dotenv(dotenv_path="../.env", override=True)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AWS Bedrock client explicitly with the new keys
try:
    bedrock_client = boto3.client(
        "bedrock-runtime", 
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
except Exception as e:
    print(f"Failed to initialize boto3 client: {e}")
    bedrock_client = None

def get_image_format(filename: str) -> str:
    """Extract format for Nova API based on extension."""
    ext = filename.split(".")[-1].lower()
    if ext in ["jpg", "jpeg"]:
        return "jpeg"
    elif ext == "png":
        return "png"
    elif ext == "webp":
        return "webp"
    elif ext == "gif":
        return "gif"
    return "jpeg" # fallback

@app.get("/health")
def health_check():
    key = os.getenv("AWS_ACCESS_KEY_ID", "")
    return {"status": "ok", "key_prefix": key[:5]}

@app.post("/api/grade")
async def grade_item(
    files: List[UploadFile] = File(...),
    product_name: str = Form(...),
    category: str = Form(...),
    sub_category: str = Form(...),
    expected_color: str = Form(...),
    reason: str = Form(...),
    sub_reason: str = Form(""),
    customer_notes: str = Form(""),
    price: float = Form(0.0)
):
    if not bedrock_client:
        raise HTTPException(status_code=500, detail="AWS Bedrock client not initialized. Check credentials.")

    try:
        # Determine the prompt template based on category
        cat_lower = category.lower()
        if "apparel" in cat_lower or "footwear" in cat_lower:
            prompt_key = "apparel"
        elif "appliance" in cat_lower or "kitchen" in cat_lower:
            prompt_key = "appliances"
        elif "electronic" in cat_lower or "smart home" in cat_lower:
            prompt_key = "electronics"
        elif "accessories" in cat_lower:
            prompt_key = "accessories"
        else:
            prompt_key = "electronics" # Default fallback
            
        template = CATEGORY_PROMPTS.get(prompt_key, CATEGORY_PROMPTS["electronics"])
        
        # Format the prompt with product metadata using string replace
        # to avoid KeyErrors from the JSON schema brackets
        formatted_prompt = template.replace("{product_name}", product_name)
        formatted_prompt = formatted_prompt.replace("{category}", category)
        formatted_prompt = formatted_prompt.replace("{subcategory}", sub_category)
        formatted_prompt = formatted_prompt.replace("{expected_color}", expected_color)
        
        # Construct the full customer reason combining dropdown reason, sub-reason, and notes
        full_reason_parts = [reason]
        if sub_reason:
            full_reason_parts.append(sub_reason)
        if customer_notes:
            full_reason_parts.append(f"Notes: {customer_notes}")
        full_customer_reason = " | ".join(full_reason_parts)
            
        formatted_prompt = formatted_prompt.replace("{customer_reason}", full_customer_reason)

        # Prepare the content payload for Amazon Nova
        content_payload = []
        
        # Bypass rules for categories that cannot have cosmetic cashback
        if category == "Consumables":
            return {
                "analysis": {"bypass": "Consumables are strictly returned/refunded. No cosmetic cashback allowed."},
                "routing": {
                    "state_id": "ST-STANDARD",
                    "action": "STANDARD_RETURN",
                    "cashback_amount": 0.0,
                    "severity": "None"
                }
            }
        
        if category == "Apparel" and reason in ["Size is too small/large", "Fit is not as expected", "Color/style does not match description"]:
            return {
                "analysis": {"bypass": "Apparel size/fit issues are strictly returned/refunded."},
                "routing": {
                    "state_id": "ST-STANDARD",
                    "action": "STANDARD_RETURN",
                    "cashback_amount": 0.0,
                    "severity": "None"
                }
            }

        # Add all images to the payload
        for img in files:
            img_bytes = await img.read()
            img_format = get_image_format(img.filename)
            
            content_payload.append({
                "image": {
                    "format": img_format,
                    "source": {
                        "bytes": img_bytes
                    }
                }
            })
            
        # Add the text prompt at the end
        content_payload.append({
            "text": formatted_prompt
        })
        
        print(f"Calling Bedrock Nova Pro for {product_name}...")
        try:
            response = bedrock_client.converse(
                modelId="amazon.nova-pro-v1:0",
                messages=[
                    {
                        "role": "user",
                        "content": content_payload
                    }
                ]
            )
        except Exception as e:
            print(f"Nova Pro failed: {e}. Falling back to Nova Lite...")
            response = bedrock_client.converse(
                modelId="us.amazon.nova-2-lite-v1:0",
                messages=[
                    {
                        "role": "user",
                        "content": content_payload
                    }
                ]
            )
        
        # Extract the text response
        response_text = response['output']['message']['content'][0]['text']
        
        # Parse it as JSON (Nova should return JSON based on prompt instructions)
        try:
            # Strip markdown code blocks if Nova added them
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            clean_text = clean_text.strip()
                
            parsed_json = json.loads(clean_text)
            
            # Intelligent Routing Engine Logic (Simplified: 2 Outcomes)
            routing_decision = "ST-STANDARD"
            routing_action = "STANDARD_RETURN"
            cashback_amount = 0.0
            max_severity = None
            multiplier_used = 0.0
            
            product_id = parsed_json.get("product_identification", {})
            struct = parsed_json.get("structural_inspection", {})
            cosmetic = parsed_json.get("cosmetic_inspection", {})
            
            if product_id.get("appears_correct_product") == False:
                routing_decision = "ST-MISMATCH"
                routing_action = "ITEM_MISMATCH"
            elif struct.get("structural_damage_detected") == True:
                routing_action = "STANDARD_RETURN"
            elif cosmetic.get("cosmetic_damage_detected") == True:
                routing_decision = "ST-CASHBACK"
                routing_action = "INSTANT_CASHBACK"
                
                # Calculate dynamic cashback amount based on highest severity
                issues = cosmetic.get("issues", [])
                max_severity = "Low"
                for issue in issues:
                    sev = issue.get("severity", "Low")
                    if sev.lower() == "high":
                        max_severity = "High"
                        break
                    elif sev.lower() == "medium":
                        max_severity = "Medium"
                
                multiplier_used = 0.10 # default 10% for Low
                if max_severity == "High":
                    multiplier_used = 0.35
                elif max_severity == "Medium":
                    multiplier_used = 0.20
                    
                cashback_amount = round(price * multiplier_used, 2)
            else:
                # Pristine / Open Box
                routing_action = "STANDARD_RETURN"
                multiplier_used = 0.0

            ai_response = {
                "analysis": parsed_json,
                "routing": {
                    "state_id": routing_decision,
                    "action": routing_action,
                    "cashback_amount": cashback_amount,
                    "severity": max_severity,
                    "calculation": {
                        "item_price": price,
                        "multiplier_applied": multiplier_used
                    },
                    "justification": parsed_json.get("reasoning") or parsed_json.get("overall_observations", {}).get("analysis") or "Rufus determined this item is eligible for this return path."
                }
            }
            
            # Log to telemetry
            try:
                import os
                telemetry_path = os.path.join(os.path.dirname(__file__), "..", "database", "telemetry.json")
                if os.path.exists(telemetry_path):
                    with open(telemetry_path, "r") as f:
                        data = json.load(f)
                else:
                    data = []
                data.append(ai_response)
                with open(telemetry_path, "w") as f:
                    json.dump(data, f, indent=2)
            except Exception as e:
                print("Failed to write telemetry:", e)

            return ai_response

        except json.JSONDecodeError:
            print("Failed to parse JSON. Raw response:", response_text)
            return {"error": "Invalid JSON from model", "raw_response": response_text}
            
    except Exception as e:
        print(f"CRITICAL ERROR IN GRADE_ITEM: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resale-verify")
async def resale_verify(
    files: List[UploadFile] = File(...),
    product_name: str = Form(...),
    original_price: float = Form(...),
    age_days: int = Form(...),
    declared_condition: str = Form(...),
    functionality: str = Form(...),
    warranty: str = Form(...),
    packaging: str = Form(...),
    missing_items: str = Form("")
):
    if not bedrock_client:
        raise HTTPException(status_code=500, detail="AWS Bedrock client not initialized.")
        
    try:
        from prompts import RESALE_PROMPTS
        template = RESALE_PROMPTS.get("default", "")
        
        # Format the prompt
        formatted_prompt = template.replace("{product_name}", product_name)
        formatted_prompt = formatted_prompt.replace("{original_price}", str(original_price))
        formatted_prompt = formatted_prompt.replace("{age_days}", str(age_days))
        formatted_prompt = formatted_prompt.replace("{declared_condition}", declared_condition)
        formatted_prompt = formatted_prompt.replace("{functionality}", functionality)
        formatted_prompt = formatted_prompt.replace("{warranty}", warranty)
        formatted_prompt = formatted_prompt.replace("{packaging}", packaging)
        formatted_prompt = formatted_prompt.replace("{missing_items}", missing_items if missing_items else "None")
        
        content_payload = []
        for img in files:
            img_bytes = await img.read()
            img_format = get_image_format(img.filename)
            content_payload.append({
                "image": {
                    "format": img_format,
                    "source": {"bytes": img_bytes}
                }
            })
            
        content_payload.append({"text": formatted_prompt})
        
        print(f"Calling Nova Pro for Resale Verification: {product_name}")
        try:
            response = bedrock_client.converse(
                modelId="amazon.nova-pro-v1:0",
                messages=[{"role": "user", "content": content_payload}]
            )
        except Exception as e:
            print(f"Nova Pro failed: {e}. Falling back to Nova Lite...")
            response = bedrock_client.converse(
                modelId="us.amazon.nova-2-lite-v1:0",
                messages=[{"role": "user", "content": content_payload}]
            )
            
        response_text = response['output']['message']['content'][0]['text']
        
        # Parse JSON
        clean_text = response_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()
            
        parsed_json = json.loads(clean_text)
        
        multiplier = parsed_json.get("pricing_analysis", {}).get("final_multiplier_factor", 0.5)
        recommended_price = round(original_price * float(multiplier), 2)
        
        return {
            "analysis": parsed_json,
            "recommended_price": recommended_price
        }
        
    except json.JSONDecodeError:
        print("Failed to parse JSON for resale verify.")
        return {"error": "Invalid JSON from model"}
    except Exception as e:
        print(f"CRITICAL ERROR IN RESALE_VERIFY: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
