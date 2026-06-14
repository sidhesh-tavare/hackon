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

# Load environment variables
load_dotenv(dotenv_path="../.env")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AWS Bedrock client
try:
    bedrock_client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
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

@app.post("/api/grade")
async def grade_item(
    images: List[UploadFile] = File(...),
    product_name: str = Form(...),
    category: str = Form(...),
    sub_category: str = Form(""),
    expected_color: str = Form("Unknown"),
    reason: Optional[str] = Form(None),
    customer_notes: Optional[str] = Form(None)
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
        
        # Add the reason if provided (for returns)
        if reason:
            formatted_prompt += f"\n\nUSER REPORTED ISSUE: {reason}"
            
        if customer_notes:
            formatted_prompt += f"\n\nCUSTOMER NOTES: {customer_notes}"

        # Prepare the content payload for Amazon Nova
        content_payload = []
        
        # Add all images to the payload
        for img in images:
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
            return parsed_json
        except json.JSONDecodeError:
            print("Failed to parse JSON. Raw response:", response_text)
            return {"error": "Invalid JSON from model", "raw_response": response_text}
            
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
