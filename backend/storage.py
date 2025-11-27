"""
Storage abstraction layer for handling file uploads to local disk or AWS S3
"""
import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional

class StorageService:
    def __init__(self):
        print("[DEBUG] STORAGE_TYPE:", os.getenv("STORAGE_TYPE"))
        self.storage_type = os.getenv("STORAGE_TYPE", "local")
        self.base_dir = os.path.dirname(__file__)
        self.upload_dir = os.path.join(self.base_dir, "uploads")
        
        if self.storage_type == "s3":
            # Support for Cloudflare R2 and other S3-compatible services
            endpoint_url = os.getenv("R2_ENDPOINT") or os.getenv("B2_ENDPOINT")
            
            self.s3_client = boto3.client(
                's3',
                endpoint_url=endpoint_url,  # None for AWS S3, custom for R2/B2
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION", "us-east-1")
            )
            self.bucket_name = os.getenv("AWS_S3_BUCKET")
        else:
            os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_file(self, file_content: bytes, filename: str) -> str:
        """
        Save file to S3/R2/B2 and return the path/URL. Local storage is disabled.
        """
        # Only allow S3/R2/B2 storage
        if self.storage_type == "s3":
            try:
                return await self._save_to_s3(file_content, filename)
            except Exception as e:
                print(f"[ERROR] Failed to upload to cloud storage: {e}")
                raise
        else:
            print("[ERROR] Local storage is disabled. Set STORAGE_TYPE=s3 in your .env file.")
            raise Exception("Local storage is disabled. Set STORAGE_TYPE=s3 in your .env file.")
    
    # def _save_to_local(self, file_content: bytes, filename: str) -> str:
    #     """Save file to local disk (DISABLED)"""
    #     print("[INFO] Local storage is disabled. All files must be saved to cloud storage.")
    #     return None
    
    async def _save_to_s3(self, file_content: bytes, filename: str) -> str:
        """Upload file to S3/R2/B2 and return a presigned URL"""
        try:
            key = f"profiles/{filename}"
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_content,
                ContentType=self._get_content_type(filename)
            )
            
            # For R2 and B2, generate a presigned URL that's valid for 7 days
            # This is secure and doesn't require public bucket access
            if os.getenv("R2_ENDPOINT") or os.getenv("B2_ENDPOINT"):
                presigned_url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': key},
                    ExpiresIn=604800  # 7 days in seconds
                )
                return presigned_url
            else:
                # AWS S3 public URL (if bucket is public)
                region = os.getenv('AWS_REGION', 'us-east-1')
                return f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{key}"
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    def _get_content_type(self, filename: str) -> str:
        """Determine content type based on file extension"""
        ext = filename.lower().split('.')[-1]
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        return content_types.get(ext, 'application/octet-stream')
    
    def get_file_url(self, file_path: str) -> str:
        """
        Convert stored path to accessible URL
        For S3: return the path as-is (it's already a URL)
        For local: return the relative path for the static file server
        """
        if self.storage_type == "s3":
            return file_path
        else:
            # Return just the filename for local static serving
            return os.path.basename(file_path)

storage_service = StorageService()
