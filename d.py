from dotenv import load_dotenv
import boto3
import json
import os

# Load environment variables
load_dotenv()

# Create Bedrock Runtime client
bedrock = boto3.client(
    "bedrock-runtime",
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# Request payload for Nova
body = {
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "text": "Explain Amazon Bedrock in one sentence."
                }
            ]
        }
    ],
    "inferenceConfig": {
        "maxTokens": 200,
        "temperature": 0.7
    }
}

response = bedrock.invoke_model(
    modelId="amazon.nova-pro-v1:0",
    body=json.dumps(body),
    contentType="application/json",
    accept="application/json"
)

result = json.loads(response["body"].read())

print(result["output"]["message"]["content"][0]["text"])