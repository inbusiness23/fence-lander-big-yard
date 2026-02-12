"""
Generate AI images for ASAP Fence & Gates landing page.
Uses OpenAI gpt-image-1 via emergentintegrations.
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')

from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

API_KEY = os.environ.get('EMERGENT_LLM_KEY')
OUTPUT_DIR = Path("/app/frontend/public/images/fences")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PROMPTS = {
    "white_vinyl": (
        "Photorealistic image of a beautiful white vinyl privacy fence, 6 feet tall with modern horizontal rails, "
        "installed in a spacious Central Florida backyard. Lush green grass, palm trees and tropical landscaping visible. "
        "Bright sunny day with blue sky. The fence runs along a large residential property. Professional installation, clean lines. "
        "Shot from a slight angle showing the length of the fence receding into the distance. Warm Florida sunlight."
    ),
    "black_aluminum": (
        "Photorealistic image of an elegant three-rail black ornamental aluminum fence, approximately 4 feet tall, "
        "with flat top pickets and decorative rake bottom design. Installed in a large Central Florida backyard "
        "with green grass and palm trees. Sunny day, the black metal fence contrasts beautifully against the green lawn. "
        "Residential property with Florida-style landscaping. Professional photography style, warm lighting."
    ),
    "cedar": (
        "Photorealistic image of a premium natural cedar wood fence installed in a large Central Florida backyard. "
        "The cedar shows beautiful warm reddish-brown wood grain. Tall privacy fence style. Lush tropical Florida "
        "landscaping with palm trees in background. Golden afternoon light. Large spacious yard, professional "
        "fence installation with clean straight lines. Residential suburban setting."
    ),
    "pressure_treated_pine": (
        "Photorealistic image of a pressure-treated pine wood fence in a large Florida backyard. "
        "The pine has a fresh yellowish-green treated wood color. Privacy fence height. "
        "Central Florida residential setting with palm trees, green grass, and blue sky. "
        "Spacious side yard showing a long run of the fence. Bright daylight, professional installation."
    ),
    "chain_link": (
        "Photorealistic image of a black vinyl-coated chain link fence installed in a large Central Florida backyard. "
        "The black coating gives a clean modern look. Residential property with palm trees and tropical plants. "
        "Green grass lawn. Sunny Florida day. The fence runs along a spacious property boundary. "
        "Professional installation, taut mesh, clean post alignment."
    ),
    "durafence": (
        "Photorealistic image of a modern composite privacy fence panel (wood-look composite material) "
        "in a dark brown/walnut color, installed in a large Central Florida backyard. "
        "The composite has a realistic wood grain texture but looks engineered and modern. "
        "Palm trees and tropical Florida landscaping. Sunny day with blue sky. "
        "Large residential property, clean professional installation."
    ),
    "before_1": (
        "Photorealistic image of a neglected Central Florida backyard with an old, broken, deteriorating wooden fence. "
        "Some fence boards are missing, others are leaning. Overgrown weeds around the fence line. "
        "The yard is large but unkempt near the fence. Florida-style property with palm trees in background. "
        "Overcast morning light. Wide angle showing the full backyard from the patio perspective."
    ),
    "after_1": (
        "Photorealistic image of the same Central Florida backyard, now beautifully transformed with a brand new "
        "white vinyl privacy fence installed perfectly. Clean, straight lines. The yard is well-maintained with "
        "green grass. Florida palm trees in background. Same wide angle from patio perspective. "
        "Beautiful sunny morning light. Professional fence installation, complete property transformation."
    ),
}

async def generate_images():
    image_gen = OpenAIImageGeneration(api_key=API_KEY)
    
    for name, prompt in PROMPTS.items():
        output_path = OUTPUT_DIR / f"{name}.png"
        if output_path.exists():
            print(f"[SKIP] {name}.png already exists")
            continue
            
        print(f"[GENERATING] {name}...")
        try:
            images = await image_gen.generate_images(
                prompt=prompt,
                model="gpt-image-1",
                number_of_images=1
            )
            if images and len(images) > 0:
                with open(output_path, "wb") as f:
                    f.write(images[0])
                print(f"[SUCCESS] {name}.png saved ({len(images[0])} bytes)")
            else:
                print(f"[ERROR] No image generated for {name}")
        except Exception as e:
            print(f"[ERROR] Failed to generate {name}: {e}")

if __name__ == "__main__":
    asyncio.run(generate_images())
