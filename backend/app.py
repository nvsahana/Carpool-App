
import os
from dotenv import load_dotenv

# Only load .env file in local development, not on Render
if not os.getenv("RENDER"):
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Debug: Print DATABASE_URL (masked) to verify it's set correctly
db_url = os.getenv("DATABASE_URL", "NOT_SET")
if db_url != "NOT_SET":
    # Mask the password in logs
    print(f"[DEBUG] DATABASE_URL starts with: {db_url[:30]}...")
else:
    print("[ERROR] DATABASE_URL is not set!")

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Form, UploadFile, File, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from passlib.context import CryptContext
from jose import jwt, JWTError
from storage import storage_service
from geocoding import geocode_address

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
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        # Deployed frontend URL
        "https://carpoolconnect.netlify.app",
        os.getenv("FRONTEND_URL", "https://carpoolconnect.netlify.app"),
    ],
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
        content = await profile.read()
        profile_path = await storage_service.save_file(content, filename)

    # Build nested create dicts only if values provided
    # Geocode addresses for spatial search (runs in background, non-blocking on failure)
    company_data = None
    if officeName or companyStreet or companyCity or companyZip:
        company_coords = await geocode_address(
            street=companyStreet,
            city=companyCity,
            zipcode=companyZip
        )
        company_data = {
            "create": {
                "officeName": officeName,
                "street": companyStreet,
                "city": companyCity,
                "zipcode": companyZip,
                "latitude": company_coords[0] if company_coords else None,
                "longitude": company_coords[1] if company_coords else None,
            }
        }

    home_data = None
    if homeStreet or homeCity or homeZip:
        home_coords = await geocode_address(
            street=homeStreet,
            city=homeCity,
            zipcode=homeZip
        )
        home_data = {
            "create": {
                "street": homeStreet,
                "city": homeCity,
                "zipcode": homeZip,
                "latitude": home_coords[0] if home_coords else None,
                "longitude": home_coords[1] if home_coords else None,
            }
        }

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
    
    if type == "all":
        # Use PostGIS geospatial search for "top matches" when coordinates available
        # This finds users within ~10 miles of your work location, ranked by distance + match criteria
        if current_user.companyAddress.latitude and current_user.companyAddress.longitude:
            lat = current_user.companyAddress.latitude
            lng = current_user.companyAddress.longitude
            radius_meters = 16093.4  # ~10 miles
            
            try:
                # PostGIS spatial query - find nearby users at work
                nearby_users = await db.query_raw(
                    '''
                    SELECT 
                        u.id,
                        u."firstName",
                        u."lastName",
                        u.email,
                        u.phone,
                        u.role,
                        u."willingToTake",
                        u."hasDriversLicense",
                        u."profilePath",
                        ca."officeName" as company_office,
                        ca.street as company_street,
                        ca.city as company_city,
                        ca.zipcode as company_zipcode,
                        ha.city as home_city,
                        ha.zipcode as home_zipcode,
                        ST_Distance(
                            ca.location,
                            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                        ) as work_distance_meters,
                        CASE WHEN ha.location IS NOT NULL THEN
                            ST_Distance(
                                ha.location,
                                (SELECT location FROM "HomeAddress" WHERE "userId" = $3)
                            )
                        ELSE NULL END as home_distance_meters
                    FROM "User" u
                    JOIN "CompanyAddress" ca ON ca."userId" = u.id
                    LEFT JOIN "HomeAddress" ha ON ha."userId" = u.id
                    WHERE u.id != $3
                      AND ca.location IS NOT NULL
                      AND ST_DWithin(
                          ca.location,
                          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                          $4
                      )
                    ORDER BY work_distance_meters ASC
                    LIMIT 20
                    ''',
                    lng, lat, current_user_id, radius_meters
                )
                
                # Format and score the PostGIS results
                results = []
                for user in nearby_users:
                    work_dist_miles = round(user["work_distance_meters"] / 1609.34, 1) if user["work_distance_meters"] else None
                    home_dist_miles = round(user["home_distance_meters"] / 1609.34, 1) if user.get("home_distance_meters") else None
                    
                    # Calculate match score for sorting
                    score = 0
                    match_info = {
                        "sameHomeCity": False,
                        "sameHomeZipcode": False,
                        "sameOffice": False,
                        "sameWorkCity": False,
                        "workDistanceMiles": work_dist_miles,
                        "homeDistanceMiles": home_dist_miles
                    }
                    
                    # Bonus for same office
                    if user["company_office"] and current_user.companyAddress.officeName:
                        if user["company_office"].lower() == current_user.companyAddress.officeName.lower():
                            score += 2000
                            match_info["sameOffice"] = True
                    
                    # Bonus for same work city
                    if user["company_city"] and current_user.companyAddress.city:
                        if user["company_city"].lower() == current_user.companyAddress.city.lower():
                            score += 100
                            match_info["sameWorkCity"] = True
                    
                    # Bonus for same home city
                    if user["home_city"] and current_user.homeAddress and current_user.homeAddress.city:
                        if user["home_city"].lower() == current_user.homeAddress.city.lower():
                            score += 1000
                            match_info["sameHomeCity"] = True
                    
                    # Bonus for same home zipcode
                    if user["home_zipcode"] and current_user.homeAddress and current_user.homeAddress.zipcode:
                        if user["home_zipcode"] == current_user.homeAddress.zipcode:
                            score += 500
                            match_info["sameHomeZipcode"] = True
                    
                    # Closer distance = higher score (inverse relationship)
                    if work_dist_miles is not None:
                        score += max(0, 200 - (work_dist_miles * 20))  # Up to 200 points for being close
                    
                    results.append({
                        "id": user["id"],
                        "firstName": user["firstName"],
                        "lastName": user["lastName"],
                        "email": user["email"],
                        "phone": user["phone"],
                        "role": user["role"],
                        "willingToTake": user["willingToTake"],
                        "hasDriversLicense": user["hasDriversLicense"],
                        "profilePath": user["profilePath"],
                        "companyAddress": {
                            "officeName": user["company_office"],
                            "street": user["company_street"],
                            "city": user["company_city"],
                            "zipcode": user["company_zipcode"]
                        } if user["company_city"] else None,
                        "homeAddress": {
                            "city": user["home_city"],
                            "zipcode": user["home_zipcode"]
                        } if user["home_city"] else None,
                        "matchScore": match_info,
                        "_score": score
                    })
                
                # Sort by score and return top 6
                results.sort(key=lambda x: x["_score"], reverse=True)
                top_results = results[:6]
                for r in top_results:
                    del r["_score"]
                return top_results
                
            except Exception as e:
                # PostGIS not available - fall back to string matching
                error_str = str(e).lower()
                if "st_dwithin" not in error_str and "postgis" not in error_str:
                    raise  # Re-raise if it's not a PostGIS error
                # Fall through to string matching below
        
        # Fallback: string matching on city (when no coordinates or PostGIS unavailable)
        if current_user.companyAddress.city:
            where_clause = {
                "companyAddress": {
                    "is": {
                        "city": {"equals": current_user.companyAddress.city, "mode": "insensitive"}
                    }
                }
            }
        else:
            where_clause = {
                "companyAddress": {
                    "isNot": None
                }
            }
    elif type == "office":
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
        raise HTTPException(status_code=400, detail="Invalid search type. Must be 'all', 'office', 'street', or 'city'")
    
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
            "sameHomeZipcode": False,
            "sameOffice": False,
            "sameWorkStreet": False,
            "sameWorkCity": False
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
            # Same office name (for "all" or "office" types)
            if type in ["all", "office"] and user.companyAddress.officeName and current_user.companyAddress.officeName:
                if user.companyAddress.officeName.lower() == current_user.companyAddress.officeName.lower():
                    score += 2000  # Highest priority - same office
                    match_info["sameOffice"] = True
            
            # Same work street (for "all", "office", or "street" types)
            if type in ["all", "office", "street"] and user.companyAddress.street and current_user.companyAddress.street:
                if user.companyAddress.street.lower() == current_user.companyAddress.street.lower():
                    score += 150
                    match_info["sameWorkStreet"] = True
            
            # Same work city (always applicable)
            if user.companyAddress.city and current_user.companyAddress.city:
                if user.companyAddress.city.lower() == current_user.companyAddress.city.lower():
                    score += 50
                    match_info["sameWorkCity"] = True
        
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


@app.get("/search/nearby")
async def search_nearby_carpools(
    request: Request,
    radius_miles: float = 5.0,
    search_type: str = "home"  # "home" or "work"
):
    """
    High-performance geospatial search using PostGIS.
    
    Finds users within a specified radius using spatial indexing (GiST).
    This is much faster and more accurate than string matching.
    
    Args:
        radius_miles: Search radius in miles (default: 5.0)
        search_type: "home" to search near your home, "work" to search near your workplace
    
    Returns:
        List of nearby users with distance in miles, sorted by proximity
    """
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    current_user_id = payload.get("user_id")
    if not current_user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Validate search type
    if search_type not in ["home", "work"]:
        raise HTTPException(status_code=400, detail="search_type must be 'home' or 'work'")
    
    # Convert miles to meters for PostGIS
    radius_meters = radius_miles * 1609.34
    
    # Determine which table to search
    if search_type == "home":
        table = "HomeAddress"
        relation = "homeAddress"
    else:
        table = "CompanyAddress"
        relation = "companyAddress"
    
    # Get current user's coordinates
    current_user = await db.user.find_unique(
        where={"id": current_user_id},
        include={
            "companyAddress": True,
            "homeAddress": True
        }
    )
    
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get the relevant address
    user_address = current_user.homeAddress if search_type == "home" else current_user.companyAddress
    
    if not user_address:
        raise HTTPException(
            status_code=400, 
            detail=f"Please set your {search_type} address in your profile first"
        )
    
    if not user_address.latitude or not user_address.longitude:
        raise HTTPException(
            status_code=400, 
            detail=f"Your {search_type} address could not be geocoded. Please update your address with a valid location."
        )
    
    lat = user_address.latitude
    lng = user_address.longitude
    
    # PostGIS spatial query using ST_DWithin for efficient radius search
    # ST_DWithin uses the GiST index for sub-100ms performance
    try:
        nearby_users = await db.query_raw(
            f'''
            SELECT 
                u.id,
                u."firstName",
                u."lastName",
                u.email,
                u.phone,
                u.role,
                u."willingToTake",
                u."hasDriversLicense",
                u."profilePath",
                a.city,
                a.zipcode,
                ST_Distance(
                    a.location,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distance_meters
            FROM "User" u
            JOIN "{table}" a ON a."userId" = u.id
            WHERE u.id != $3
              AND a.location IS NOT NULL
              AND ST_DWithin(
                  a.location,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                  $4
              )
            ORDER BY distance_meters ASC
            LIMIT 20
            ''',
            lng,  # $1 - longitude comes first in ST_MakePoint
            lat,  # $2 - latitude
            current_user_id,  # $3 - exclude current user
            radius_meters  # $4 - search radius in meters
        )
    except Exception as e:
        # If PostGIS isn't available, fall back to a helpful error
        error_str = str(e).lower()
        if "st_dwithin" in error_str or "postgis" in error_str or "geography" in error_str:
            raise HTTPException(
                status_code=503,
                detail="Geospatial search is not available. PostGIS extension may not be enabled on the database."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # Format results with distance in miles
    results = []
    for user in nearby_users:
        distance_miles = round(user["distance_meters"] / 1609.34, 1)
        results.append({
            "id": user["id"],
            "firstName": user["firstName"],
            "lastName": user["lastName"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"],
            "willingToTake": user["willingToTake"],
            "hasDriversLicense": user["hasDriversLicense"],
            "profilePath": user["profilePath"],
            f"{search_type}Address": {
                "city": user["city"],
                "zipcode": user["zipcode"]
            },
            "distanceMiles": distance_miles,
            "distanceText": f"{distance_miles} mi away"
        })
    
    return {
        "searchType": search_type,
        "radiusMiles": radius_miles,
        "resultsCount": len(results),
        "users": results
    }


@app.post("/connection-requests")
async def send_connection_request(
    request: Request,
    receiverId: int = Form(...)
):
    """Send a connection request to another user"""
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    sender_id = payload.get("user_id")
    if not sender_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Validate: can't send request to yourself
    if sender_id == receiverId:
        raise HTTPException(status_code=400, detail="Cannot send connection request to yourself")
    
    # Check if receiver exists
    receiver = await db.user.find_unique(where={"id": receiverId})
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Check if request already exists
    existing = await db.connectionrequest.find_first(
        where={
            "senderId": sender_id,
            "receiverId": receiverId
        }
    )
    if existing:
        raise HTTPException(status_code=409, detail="Connection request already sent")
    
    # Create connection request
    connection_request = await db.connectionrequest.create({
        "senderId": sender_id,
        "receiverId": receiverId,
        "status": "pending"
    })
    
    return {
        "id": connection_request.id,
        "senderId": connection_request.senderId,
        "receiverId": connection_request.receiverId,
        "status": connection_request.status,
        "createdAt": connection_request.createdAt.isoformat()
    }


@app.get("/connection-requests")
async def get_connection_requests(request: Request):
    """Get all connection requests for the current user (sent and received)"""
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Get received requests (pending)
    received_requests = await db.connectionrequest.find_many(
        where={
            "receiverId": user_id,
            "status": "pending"
        },
        include={
            "sender": {
                "include": {
                    "companyAddress": True,
                    "homeAddress": True
                }
            }
        },
        order={"createdAt": "desc"}
    )
    
    # Get sent requests
    sent_requests = await db.connectionrequest.find_many(
        where={
            "senderId": user_id
        },
        include={
            "receiver": {
                "include": {
                    "companyAddress": True,
                    "homeAddress": True
                }
            }
        },
        order={"createdAt": "desc"}
    )
    
    # Format received requests
    received = []
    for req in received_requests:
        received.append({
            "id": req.id,
            "status": req.status,
            "createdAt": req.createdAt.isoformat(),
            "sender": {
                "id": req.sender.id,
                "firstName": req.sender.firstName,
                "lastName": req.sender.lastName,
                "email": req.sender.email,
                "phone": req.sender.phone,
                "role": req.sender.role,
                "profilePath": req.sender.profilePath,
                "companyAddress": {
                    "officeName": req.sender.companyAddress.officeName if req.sender.companyAddress else None,
                    "city": req.sender.companyAddress.city if req.sender.companyAddress else None
                } if req.sender.companyAddress else None,
                "homeAddress": {
                    "city": req.sender.homeAddress.city if req.sender.homeAddress else None
                } if req.sender.homeAddress else None
            }
        })
    
    # Format sent requests
    sent = []
    for req in sent_requests:
        sent.append({
            "id": req.id,
            "status": req.status,
            "createdAt": req.createdAt.isoformat(),
            "receiver": {
                "id": req.receiver.id,
                "firstName": req.receiver.firstName,
                "lastName": req.receiver.lastName,
                "email": req.receiver.email,
                "phone": req.receiver.phone,
                "role": req.receiver.role,
                "profilePath": req.receiver.profilePath,
                "companyAddress": {
                    "officeName": req.receiver.companyAddress.officeName if req.receiver.companyAddress else None,
                    "city": req.receiver.companyAddress.city if req.receiver.companyAddress else None
                } if req.receiver.companyAddress else None,
                "homeAddress": {
                    "city": req.receiver.homeAddress.city if req.receiver.homeAddress else None
                } if req.receiver.homeAddress else None
            }
        })
    
    return {
        "received": received,
        "sent": sent
    }


@app.patch("/connection-requests/{request_id}/accept")
async def accept_connection_request(
    request: Request,
    request_id: int
):
    """Accept a connection request"""
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Find the connection request
    conn_request = await db.connectionrequest.find_unique(where={"id": request_id})
    if not conn_request:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    # Verify that the current user is the receiver
    if conn_request.receiverId != user_id:
        raise HTTPException(status_code=403, detail="You can only accept requests sent to you")
    
    # Verify request is still pending
    if conn_request.status != "pending":
        raise HTTPException(status_code=400, detail="This request has already been processed")
    
    # Update status to accepted
    updated_request = await db.connectionrequest.update(
        where={"id": request_id},
        data={"status": "accepted"}
    )
    
    return {
        "id": updated_request.id,
        "status": updated_request.status,
        "message": "Connection request accepted"
    }


@app.patch("/connection-requests/{request_id}/reject")
async def reject_connection_request(
    request: Request,
    request_id: int
):
    """Reject a connection request"""
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Find the connection request
    conn_request = await db.connectionrequest.find_unique(where={"id": request_id})
    if not conn_request:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    # Verify that the current user is the receiver
    if conn_request.receiverId != user_id:
        raise HTTPException(status_code=403, detail="You can only reject requests sent to you")
    
    # Verify request is still pending
    if conn_request.status != "pending":
        raise HTTPException(status_code=400, detail="This request has already been processed")
    
    # Delete the rejected request
    await db.connectionrequest.delete(where={"id": request_id})
    
    return {
        "message": "Connection request rejected and removed"
    }


@app.get("/connected-users")
async def get_connected_users(request: Request):
    """Get all users connected to the current user (accepted connections)"""
    # Verify authentication
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Get all accepted connections where user is sender or receiver
    connections = await db.connectionrequest.find_many(
        where={
            "OR": [
                {"senderId": user_id},
                {"receiverId": user_id}
            ],
            "status": "accepted"
        },
        include={
            "sender": {
                "include": {
                    "companyAddress": True,
                    "homeAddress": True
                }
            },
            "receiver": {
                "include": {
                    "companyAddress": True,
                    "homeAddress": True
                }
            }
        },
        order={"updatedAt": "desc"}
    )
    
    # Extract the connected users (exclude current user)
    connected_users = []
    for conn in connections:
        # Determine which user is the connected one (not the current user)
        other_user = conn.receiver if conn.senderId == user_id else conn.sender
        
        connected_users.append({
            "id": other_user.id,
            "firstName": other_user.firstName,
            "lastName": other_user.lastName,
            "email": other_user.email,
            "phone": other_user.phone,
            "role": other_user.role,
            "willingToTake": other_user.willingToTake,
            "hasDriversLicense": other_user.hasDriversLicense,
            "profilePath": other_user.profilePath,
            "companyAddress": {
                "officeName": other_user.companyAddress.officeName if other_user.companyAddress else None,
                "street": other_user.companyAddress.street if other_user.companyAddress else None,
                "city": other_user.companyAddress.city if other_user.companyAddress else None,
                "zipcode": other_user.companyAddress.zipcode if other_user.companyAddress else None
            } if other_user.companyAddress else None,
            "homeAddress": {
                "city": other_user.homeAddress.city if other_user.homeAddress else None,
                "zipcode": other_user.homeAddress.zipcode if other_user.homeAddress else None
            } if other_user.homeAddress else None,
            "connectedAt": conn.updatedAt.isoformat()
        })
    
    return connected_users


@app.get("/conversations")
async def get_conversations(request: Request):
    """Get all conversations for the current user with last message"""
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Get all conversations where user is participant
    conversations = await db.conversation.find_many(
        where={
            "OR": [
                {"user1Id": user_id},
                {"user2Id": user_id}
            ]
        },
        include={
            "user1": {
                "include": {
                    "companyAddress": True
                }
            },
            "user2": {
                "include": {
                    "companyAddress": True
                }
            }
        },
        order={"updatedAt": "desc"}
    )
    
    result = []
    for conv in conversations:
        # Determine the other user
        other_user = conv.user2 if conv.user1Id == user_id else conv.user1
        
        # Get the last message for this conversation
        last_message = await db.message.find_first(
            where={"conversationId": conv.id},
            order={"createdAt": "desc"}
        )
        
        # Count unread messages from other user
        unread_count = await db.message.count(
            where={
                "conversationId": conv.id,
                "senderId": other_user.id,
                "isRead": False
            }
        )
        
        result.append({
            "id": conv.id,
            "otherUser": {
                "id": other_user.id,
                "firstName": other_user.firstName,
                "lastName": other_user.lastName,
                "profilePath": other_user.profilePath,
                "role": other_user.role,
                "companyAddress": {
                    "city": other_user.companyAddress.city if other_user.companyAddress else None
                } if other_user.companyAddress else None
            },
            "lastMessage": {
                "content": last_message.content,
                "createdAt": last_message.createdAt.isoformat(),
                "senderId": last_message.senderId
            } if last_message else None,
            "unreadCount": unread_count,
            "updatedAt": conv.updatedAt.isoformat()
        })
    
    return result


@app.get("/conversations/{other_user_id}/messages")
async def get_messages(
    request: Request,
    other_user_id: int
):
    """Get all messages in a conversation with another user"""
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Find or create conversation
    conversation = await db.conversation.find_first(
        where={
            "OR": [
                {"user1Id": user_id, "user2Id": other_user_id},
                {"user1Id": other_user_id, "user2Id": user_id}
            ]
        }
    )
    
    if not conversation:
        # Create new conversation
        conversation = await db.conversation.create({
            "user1Id": min(user_id, other_user_id),
            "user2Id": max(user_id, other_user_id)
        })
    
    # Get messages
    messages = await db.message.find_many(
        where={"conversationId": conversation.id},
        order={"createdAt": "asc"}
    )
    
    # Mark messages from other user as read
    await db.message.update_many(
        where={
            "conversationId": conversation.id,
            "senderId": other_user_id,
            "isRead": False
        },
        data={"isRead": True}
    )
    
    return {
        "conversationId": conversation.id,
        "messages": [
            {
                "id": msg.id,
                "senderId": msg.senderId,
                "content": msg.content,
                "isRead": msg.isRead,
                "createdAt": msg.createdAt.isoformat()
            }
            for msg in messages
        ]
    }


@app.post("/conversations/{other_user_id}/messages")
async def send_message(
    request: Request,
    other_user_id: int,
    content: str = Form(...)
):
    """Send a message to another user"""
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Malformed token payload")
    
    # Validate content
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")
    
    # Check if users are connected
    connection = await db.connectionrequest.find_first(
        where={
            "OR": [
                {"senderId": user_id, "receiverId": other_user_id},
                {"senderId": other_user_id, "receiverId": user_id}
            ],
            "status": "accepted"
        }
    )
    
    if not connection:
        raise HTTPException(status_code=403, detail="You can only message connected users")
    
    # Find or create conversation
    conversation = await db.conversation.find_first(
        where={
            "OR": [
                {"user1Id": user_id, "user2Id": other_user_id},
                {"user1Id": other_user_id, "user2Id": user_id}
            ]
        }
    )
    
    if not conversation:
        conversation = await db.conversation.create({
            "user1Id": min(user_id, other_user_id),
            "user2Id": max(user_id, other_user_id)
        })
    
    # Create message
    message = await db.message.create({
        "conversationId": conversation.id,
        "senderId": user_id,
        "content": content.strip()
    })
    
    # Update conversation timestamp
    await db.conversation.update(
        where={"id": conversation.id},
        data={"updatedAt": datetime.utcnow()}
    )
    
    return {
        "id": message.id,
        "conversationId": message.conversationId,
        "senderId": message.senderId,
        "content": message.content,
        "isRead": message.isRead,
        "createdAt": message.createdAt.isoformat()
    }
