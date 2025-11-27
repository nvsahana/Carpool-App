import os
import boto3

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
bucket_name = os.getenv("AWS_S3_BUCKET")
endpoint_url = os.getenv("R2_ENDPOINT")
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
region_name = os.getenv("AWS_REGION", "auto")

s3_client = boto3.client(
    "s3",
    endpoint_url=endpoint_url,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=region_name
)

for filename in os.listdir(uploads_dir):
    file_path = os.path.join(uploads_dir, filename)
    if os.path.isfile(file_path):
        key = f"profiles/{filename}"
        print(f"Uploading {filename} to {bucket_name}/{key} ...")
        s3_client.upload_file(file_path, bucket_name, key)
print("All files uploaded.")