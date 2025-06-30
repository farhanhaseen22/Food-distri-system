import requests
import os

MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")

async def get_coordinates(location: str) -> dict:
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{location}.json?access_token={MAPBOX_TOKEN}"
    resp = requests.get(url)
    data = resp.json()
    coords = data['features'][0]['center']  # [lon, lat]
    return {"lon": coords[0], "lat": coords[1]}
