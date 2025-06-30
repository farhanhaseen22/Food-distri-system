from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app import gpt_utils, db, map_utils

app = FastAPI()
templates = Jinja2Templates(directory="app/templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/search")
async def search_food(request: Request, query: str = Form(...)):
    filters = await gpt_utils.extract_filters(query)
    coords = await map_utils.get_coordinates(filters["location"])
    food_items = db.search_food(filters)
    return templates.TemplateResponse("index.html", {
        "request": request,
        "filters": filters,
        "food_items": food_items,
        "map_coords": coords
    })
