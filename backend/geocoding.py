"""
Geocoding utility for converting addresses to coordinates.
Uses OpenStreetMap Nominatim API (free, no API key required).
"""

import httpx
import asyncio
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Rate limiting: Nominatim requires max 1 request per second
_last_request_time = 0
_rate_limit_lock = asyncio.Lock()

async def geocode_address(
    street: Optional[str] = None,
    city: Optional[str] = None,
    zipcode: Optional[str] = None,
    country: str = "USA"
) -> Optional[Tuple[float, float]]:
    """
    Convert an address to latitude/longitude coordinates.
    
    Uses OpenStreetMap Nominatim API which is free but rate-limited to 1 req/sec.
    
    Args:
        street: Street address (e.g., "123 Main St")
        city: City name (e.g., "Mountain View")
        zipcode: ZIP/postal code (e.g., "94043")
        country: Country name (default: "USA")
    
    Returns:
        Tuple of (latitude, longitude) or None if geocoding fails
    
    Example:
        >>> coords = await geocode_address(city="Mountain View", zipcode="94043")
        >>> print(coords)  # (37.3861, -122.0839)
    """
    global _last_request_time
    
    # Build address components (skip empty values)
    parts = [p for p in [street, city, zipcode, country] if p]
    if not parts:
        return None
    
    address = ", ".join(parts)
    
    # Rate limiting - ensure at least 1 second between requests
    async with _rate_limit_lock:
        import time
        current_time = time.time()
        time_since_last = current_time - _last_request_time
        if time_since_last < 1.0:
            await asyncio.sleep(1.0 - time_since_last)
        _last_request_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": address,
                    "format": "json",
                    "limit": 1,
                    "addressdetails": 0
                },
                headers={
                    # Nominatim requires a User-Agent identifying your app
                    "User-Agent": "CarpoolConnectApp/1.0 (https://carpoolconnect.netlify.app)"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if data and len(data) > 0:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                logger.info(f"Geocoded '{address}' -> ({lat}, {lon})")
                return (lat, lon)
            else:
                logger.warning(f"No results found for address: {address}")
                return None
                
    except httpx.TimeoutException:
        logger.error(f"Timeout geocoding address: {address}")
        return None
    except httpx.HTTPError as e:
        logger.error(f"HTTP error geocoding address: {address} - {e}")
        return None
    except (KeyError, ValueError, IndexError) as e:
        logger.error(f"Error parsing geocoding response for {address}: {e}")
        return None


async def geocode_addresses_batch(
    addresses: list[dict]
) -> list[Optional[Tuple[float, float]]]:
    """
    Geocode multiple addresses sequentially (respecting rate limits).
    
    Args:
        addresses: List of dicts with keys: street, city, zipcode
    
    Returns:
        List of (lat, lng) tuples or None for each address
    """
    results = []
    for addr in addresses:
        result = await geocode_address(
            street=addr.get("street"),
            city=addr.get("city"),
            zipcode=addr.get("zipcode")
        )
        results.append(result)
    return results
