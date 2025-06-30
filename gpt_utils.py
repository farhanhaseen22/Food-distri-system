from openai import OpenAI
from dotenv import load_dotenv
import os
import json


load_dotenv()  # Load .env file into environment
openai_api_key = os.getenv("OPENAI_API_KEY")


client = OpenAI(api_key=os.getenv(openai_api_key))

async def extract_filters(user_query: str) -> dict:
    prompt = f"""Extract JSON filters from this query: '{user_query}'\n
Return JSON with keys: category, location, target_audience."""
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(resp.choices[0].message.content)


