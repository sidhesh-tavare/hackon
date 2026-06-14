import boto3
import os
from dotenv import load_dotenv

# Force load the .env file
load_dotenv(dotenv_path=".env", override=True)

def test_nova_model():
    print("Initializing Bedrock Client...")
    try:
        client = boto3.client(
            "bedrock-runtime",
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        print("Client initialized!")
    except Exception as e:
        print(f"Failed to initialize client: {e}")
        return

    # The models you can test
    models_to_test = [
        "us.amazon.nova-2-lite-v1:0",
        "amazon.nova-pro-v1:0"
    ]

    for model_id in models_to_test:
        print(f"\n--- Testing Model: {model_id} ---")
        try:
            response = client.converse(
                modelId=model_id,
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": "Say 'Connection Successful!' if you can read this."}]
                    }
                ]
            )
            response_text = response['output']['message']['content'][0]['text']
            print(f"SUCCESS! Model responded with: {response_text}")
        except Exception as e:
            print(f"FAILED! Error: {e}")

if __name__ == "__main__":
    test_nova_model()
