from typing import List, Optional
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Form, UploadFile, File, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from passlib.context import CryptContext
from jose import jwt, JWTError

BASE_DIR = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Authentication configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from fastapi.staticfiles import StaticFiles

app = FastAPI()
db = Prisma()

# Serve uploaded profile images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


@app.get("/")
async def root():
    return {"ok": True}

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@app.get("/me")
async def get_me(request: Request):
    """Return current user info based on Authorization: Bearer <token> header"""
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    user = await db.user.find_unique(
        where={"id": user_id},
        include={
            "companyAddress": True,
            "homeAddress": True
        }
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = {
        "id": user.id,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "willingToTake": user.willingToTake,
        "hasDriversLicense": user.hasDriversLicense,
        "profilePath": user.profilePath,
        "companyAddress": None,
        "homeAddress": None
    }
    
    if user.companyAddress:
        user_data["companyAddress"] = {
            "officeName": user.companyAddress.officeName,
            "street": user.companyAddress.street,
            "city": user.companyAddress.city,
            "zipcode": user.companyAddress.zipcode
        }
    
    if user.homeAddress:
        user_data["homeAddress"] = {
            "street": user.homeAddress.street,
            "city": user.homeAddress.city,
            "zipcode": user.homeAddress.zipcode
        }
    
    return user_data


@app.post("/signup")
async def signup(
    firstName: str = Form(...),
    lastName: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
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
    if not firstName or not lastName or not email or not password:
        raise HTTPException(status_code=400, detail="firstName, lastName, email and password are required")
    
    # Validate password strength
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

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

    # Hash the password
    hashed_password = pwd_context.hash(password)

    user_payload = {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "passwordHash": hashed_password,
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

    # Create JWT token
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})

    return {
        "id": user.id,
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint - accepts email/password and returns JWT token"""
    # Find user by email (username field contains email)
    user = await db.user.find_first(where={"email": form_data.username})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if password hash exists
    if not user.passwordHash:
        raise HTTPException(status_code=401, detail="Password not set for this account")
    
    # Verify password
    if not pwd_context.verify(form_data.password, user.passwordHash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create JWT token
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id
    }


@app.get("/search")
async def search_carpools(
    request: Request,
    type: str
):
    """Search for carpool matches based on current user's office location"""
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    current_user_id = payload.get("user_id")
    if not current_user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Get current user's addresses for matching
    current_user = await db.user.find_unique(
        where={"id": current_user_id},
        include={
            "companyAddress": True,
            "homeAddress": True
        }
    )
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not current_user.companyAddress:
        raise HTTPException(status_code=400, detail="Please complete your company address in your profile first")
    
    # Build search query based on type using current user's company address
    where_clause = {}
    
    if type == "office":
        # Match same office name (exact match)
        if not current_user.companyAddress.officeName:
            raise HTTPException(status_code=400, detail="Office name not set in your profile")
        where_clause = {
            "companyAddress": {
                "is": {
                    "officeName": {"equals": current_user.companyAddress.officeName, "mode": "insensitive"}
                }
            }
        }
    elif type == "street":
        # Match same street and city
        if not current_user.companyAddress.street:
            raise HTTPException(status_code=400, detail="Street address not set in your profile")
        where_clause = {
            "companyAddress": {
                "is": {
                    "AND": [
                        {"street": {"equals": current_user.companyAddress.street, "mode": "insensitive"}},
                        {"city": {"equals": current_user.companyAddress.city, "mode": "insensitive"}}
                    ]
                }
            }
        }
    elif type == "city":
        # Match same city
        if not current_user.companyAddress.city:
            raise HTTPException(status_code=400, detail="City not set in your profile")
        where_clause = {
            "companyAddress": {
                "is": {
                    "city": {"equals": current_user.companyAddress.city, "mode": "insensitive"}
                }
            }
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid search type. Must be 'office', 'street', or 'city'")
    
    # Exclude current user from results
    where_clause["id"] = {"not": current_user_id}
    
    # Find matching users
    users = await db.user.find_many(
        where=where_clause,
        include={
            "companyAddress": True,
            "homeAddress": True
        }
    )
    
    # Sort users by home location match priority
    def calculate_match_score(user):
        score = 0
        match_info = {
            "sameHomeCity": False,
            "sameHomeStreet": False,
            "sameHomeZipcode": False
        }
        
        if current_user.homeAddress and user.homeAddress:
            # Check home city match
            if current_user.homeAddress.city and user.homeAddress.city:
                if current_user.homeAddress.city.lower() == user.homeAddress.city.lower():
                    score += 1000  # Highest priority
                    match_info["sameHomeCity"] = True
            
            # Check home zipcode match
            if current_user.homeAddress.zipcode and user.homeAddress.zipcode:
                if current_user.homeAddress.zipcode == user.homeAddress.zipcode:
                    score += 500
                    match_info["sameHomeZipcode"] = True
            
            # Check home street match
            if current_user.homeAddress.street and user.homeAddress.street:
                if current_user.homeAddress.street.lower() == user.homeAddress.street.lower():
                    score += 300
                    match_info["sameHomeStreet"] = True
        
        # Add office match bonus
        if user.companyAddress and current_user.companyAddress:
            # Same office name
            if type == "office" and user.companyAddress.officeName and current_user.companyAddress.officeName:
                if user.companyAddress.officeName.lower() == current_user.companyAddress.officeName.lower():
                    score += 100
            
            # Same street
            if type in ["office", "street"] and user.companyAddress.street and current_user.companyAddress.street:
                if user.companyAddress.street.lower() == current_user.companyAddress.street.lower():
                    score += 75
            
            # Same city (always applicable)
            if user.companyAddress.city and current_user.companyAddress.city:
                if user.companyAddress.city.lower() == current_user.companyAddress.city.lower():
                    score += 50
        
        return score, match_info
    
    # Add match scores and sort
    results = []
    for user in users:
        score, match_info = calculate_match_score(user)
        user_data = {
            "id": user.id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "willingToTake": user.willingToTake,
            "hasDriversLicense": user.hasDriversLicense,
            "profilePath": user.profilePath,
            "companyAddress": None,
            "homeAddress": None,
            "matchScore": match_info,
            "_score": score
        }
        
        if user.companyAddress:
            user_data["companyAddress"] = {
                "officeName": user.companyAddress.officeName,
                "street": user.companyAddress.street,
                "city": user.companyAddress.city,
                "zipcode": user.companyAddress.zipcode
            }
        
        if user.homeAddress:
            # Don't reveal home street for privacy
            user_data["homeAddress"] = {
                "city": user.homeAddress.city,
                "zipcode": user.homeAddress.zipcode
            }
        
        results.append(user_data)
    
    # Sort by match score (highest first)
    results.sort(key=lambda x: x["_score"], reverse=True)
    
    # Return top 6 best matches
    top_results = results[:6]
    
    # Remove internal score field
    for r in top_results:
        del r["_score"]
    
    return top_results
