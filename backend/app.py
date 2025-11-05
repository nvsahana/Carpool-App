from typing import List, Optional
import os
from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()
db = Prisma()

# Adjust this origin to your React dev server
app.add_middleware(
    CORSMiddleware,
    # Allow both localhost forms that browsers may use during development
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/")
async def root():
    return {"ok": True}


@app.post("/signup")
async def signup(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    officeName: Optional[str] = Form(None),
    companyStreet: Optional[str] = Form(None),
    companyCity: Optional[str] = Form(None),
    companyZip: Optional[str] = Form(None),
    homeStreet: Optional[str] = Form(None),
    homeCity: Optional[str] = Form(None),
    homeZip: Optional[str] = Form(None),
    role: str = Form(...),
    willingToTake: Optional[List[int]] = Form(None),
    hasDriversLicense: Optional[bool] = Form(None),
    profile: Optional[UploadFile] = File(None),
):
    # Basic validation
    if not firstName or not lastName or not email:
        raise HTTPException(status_code=400, detail="firstName, lastName and email are required")

    # Save profile file if present
    profile_path = None
    if profile:
        filename = f"{int(__import__('time').time())}_{profile.filename}"
        dest = os.path.join(UPLOAD_DIR, filename)
        with open(dest, "wb") as f:
            content = await profile.read()
            f.write(content)
        profile_path = dest

    # Build nested create dicts only if values provided
    company_data = None
    if officeName or companyStreet or companyCity or companyZip:
        company_data = {
            "create": {
                "officeName": officeName,
                "street": companyStreet,
                "city": companyCity,
                "zipcode": companyZip,
            }
        }

    home_data = None
    if homeStreet or homeCity or homeZip:
        home_data = {"create": {"street": homeStreet, "city": homeCity, "zipcode": homeZip}}

    user_payload = {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "phone": phone,
        "profilePath": profile_path,
        "role": role,
        "willingToTake": willingToTake or [],
        "hasDriversLicense": hasDriversLicense,
    }

    if company_data:
        user_payload["companyAddress"] = company_data
    if home_data:
        user_payload["homeAddress"] = home_data

    # Check for existing user with same email and return 409 Conflict
    existing = await db.user.find_first(where={"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Account already exists")

    try:
        user = await db.user.create(user_payload)
    except Exception as e:
        # Return a clear JSON error (will still include CORS headers from middleware)
        raise HTTPException(status_code=500, detail=str(e))

    return {"id": user.id}