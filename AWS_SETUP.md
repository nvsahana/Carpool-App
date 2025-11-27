# Cloud Storage Setup Guide for Carpool App

## Recommended Options for Personal Projects

### Option 1: Cloudflare R2 (BEST - Free Forever)

**Why Cloudflare R2:**
- ✅ **10 GB free storage forever** (not just 12 months)
- ✅ **No egress fees** (AWS charges for downloads)
- ✅ S3-compatible API (works with boto3)
- ✅ Fast global CDN
- ✅ Free tier doesn't expire

**Setup Steps:**

1. Go to [cloudflare.com](https://cloudflare.com) and create account
2. Navigate to R2 Object Storage in dashboard
3. Click "Create bucket"
   - Name: `carpool-app-images`
   - Location: Auto
   - Click "Create bucket"

4. **Important: Do NOT enable "Public Development URL"** 
   - It's rate-limited and not production-ready
   - We'll use signed URLs or custom domain instead

5. Get API credentials:
   - Go back to R2 main page → "Manage R2 API Tokens"
   - Click "Create API Token"
   - Name it: `carpool-app-token`
   - Permissions: Select "Object Read & Write"
   - Click "Create API Token"
   - Save the **Access Key ID** and **Secret Access Key** (you won't see them again!)
   - Note your **Account ID** (shown in the R2 dashboard URL or at top of page)

**Update `backend/.env`:**
```env
STORAGE_TYPE="s3"
AWS_ACCESS_KEY_ID="your-r2-access-key-id"
AWS_SECRET_ACCESS_KEY="your-r2-secret-access-key"
AWS_REGION="auto"
AWS_S3_BUCKET="carpool-app-images"
R2_ACCOUNT_ID="your-account-id"
R2_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
```

**Limits:**
- 10 GB storage (good for ~20,000 profile pictures)
- 10 million Class A operations/month
- 100 million Class B operations/month

---

### Option 2: Backblaze B2 (Great Alternative)

**Why Backblaze B2:**
- ✅ **10 GB free storage forever**
- ✅ **1 GB daily free egress** (downloads)
- ✅ S3-compatible API
- ✅ Very cheap after free tier ($0.005/GB/month)

**Setup Steps:**

1. Go to [backblaze.com/b2](https://backblaze.com/b2) and sign up
2. Create bucket:
   - Name: `carpool-app-images`
   - Files: Public
3. Go to App Keys → Add New Application Key
   - Save **keyID** and **applicationKey**
4. Note your **endpoint** (e.g., `s3.us-west-001.backblazeb2.com`)

**Update `backend/.env`:**
```env
STORAGE_TYPE="s3"
AWS_ACCESS_KEY_ID="your-b2-key-id"
AWS_SECRET_ACCESS_KEY="your-b2-application-key"
AWS_REGION="us-west-001"
AWS_S3_BUCKET="carpool-app-images"
B2_ENDPOINT="https://s3.us-west-001.backblazeb2.com"
```

---

### Option 3: Supabase Storage (Good for Full-Stack)

**Why Supabase:**
- ✅ **1 GB free forever**
- ✅ Integrated with PostgreSQL
- ✅ Built-in auth, CDN
- ✅ Easy to use

**Setup:**
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Go to Storage → Create bucket: `profiles` (public)
4. Get credentials from Settings → API

**Note:** Requires different integration (not S3-compatible)

---

### Option 4: ImgBB / Imgur (Image-Specific)

**Why ImgBB:**
- ✅ Free forever for images
- ✅ Direct image hosting
- ✅ Simple API

**Limitations:**
- Image-only (no other files)
- Rate limits
- Less control

---

## Comparison Table

| Service | Free Storage | Free Forever? | Monthly Cost After | S3 Compatible |
|---------|--------------|---------------|-------------------|---------------|
| **Cloudflare R2** | 10 GB | ✅ Yes | $0.015/GB | ✅ Yes |
| **Backblaze B2** | 10 GB | ✅ Yes | $0.005/GB | ✅ Yes |
| AWS S3 | 5 GB | ❌ 12 months | $0.023/GB | ✅ Yes |
| Supabase | 1 GB | ✅ Yes | $0.021/GB | ❌ No |
| ImgBB | Unlimited* | ✅ Yes | Free | ❌ No |

*Rate limited

---

## My Recommendation: Cloudflare R2

**For your personal project, use Cloudflare R2 because:**

1. **10 GB free forever** - enough for ~20,000 users with profile pics
2. **No egress fees** - visitors can view images for free (AWS charges for this)
3. **Fast global CDN** - images load quickly worldwide
4. **S3-compatible** - minimal code changes (just endpoint URL)
5. **Cloudflare's reliability** - enterprise-grade infrastructure

---

## Quick Setup for Cloudflare R2

### Step 1: Update storage.py

1. Log into AWS Console
2. Search for "S3" and open S3 service
3. Click "Create bucket"
4. Configure:
   - **Bucket name**: `carpool-app-images` (must be globally unique, change if needed)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Block Public Access**: Uncheck "Block all public access" (we need public read for images)
   - Check the acknowledgment box
   - Click "Create bucket"

## Step 3: Configure Bucket Policy

1. Click on your newly created bucket
2. Go to "Permissions" tab
3. Scroll to "Bucket policy" and click "Edit"
4. Paste this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/profiles/*"
        }
    ]
}
```

5. Click "Save changes"

## Step 4: Create IAM User

1. Search for "IAM" in AWS Console
2. Click "Users" → "Add users"
3. Configure:
   - **User name**: `carpool-app-uploader`
   - **Access type**: Check "Access key - Programmatic access"
   - Click "Next: Permissions"

4. Set Permissions:
   - Click "Attach existing policies directly"
   - Search for and select `AmazonS3FullAccess` (or create custom policy below)
   - Click "Next: Tags" → "Next: Review" → "Create user"

5. **IMPORTANT**: Save the credentials shown:
   - **Access key ID**
   - **Secret access key**
   - You won't be able to see the secret again!

### Custom Policy (More Secure - Recommended)

Instead of `AmazonS3FullAccess`, create a custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/profiles/*"
        }
    ]
}
```

## Step 5: Configure Backend

1. Install boto3 (AWS SDK for Python):
```bash
cd backend
source .venv/bin/activate
pip install boto3
```

2. Update `backend/.env` file:
```env
# Storage Configuration
STORAGE_TYPE="s3"
AWS_ACCESS_KEY_ID="your-access-key-id-here"
AWS_SECRET_ACCESS_KEY="your-secret-access-key-here"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="carpool-app-images"
```

3. Restart the backend server

## Step 6: Test Upload

1. Try signing up a new user with a profile picture
2. Check your S3 bucket → `profiles/` folder
3. The image should appear there and be accessible via URL

## Cost Estimation

**AWS S3 Free Tier (12 months):**
- 5 GB of standard storage
- 20,000 GET requests
- 2,000 PUT requests

**After Free Tier:**
- Storage: ~$0.023 per GB per month
- PUT requests: ~$0.005 per 1,000 requests
- GET requests: ~$0.0004 per 1,000 requests

**Example Cost for 1000 users:**
- Average 500 KB per profile picture = 500 MB total
- Monthly cost: ~$0.01 (practically free)

## Switching Back to Local Storage

If you want to switch back to local storage:

1. Update `backend/.env`:
```env
STORAGE_TYPE="local"
```

2. Restart backend - images will be saved locally again

## Troubleshooting

### Images not loading?
- Check bucket policy allows public read
- Verify CORS is not blocking requests
- Check AWS credentials are correct in `.env`

### Upload failing?
- Verify IAM user has PutObject permission
- Check AWS credentials in `.env`
- Ensure bucket name matches exactly

### Need CORS for direct browser uploads?
Add this CORS policy to your S3 bucket (Permissions → CORS):

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "ExposeHeaders": []
    }
]
```
