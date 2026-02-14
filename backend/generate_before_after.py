"""
Generate improved Before/After images for ASAP Fence & Gates.
Before: Nice well-maintained Florida yard with OLD/DATED fence (not destroyed)
After: Same yard, brand new premium fence
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')

from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

API_KEY = os.environ.get('EMERGENT_LLM_KEY')
OUTPUT_DIR = Path("/app/frontend/public/images/fences")

PROMPTS = {
    "before_2": (
        "Photorealistic image of a well-maintained large Central Florida backyard with lush green grass, "
        "palm trees, and tropical landscaping. The yard looks beautiful and well-cared-for. "
        "However, the fence is old and dated — weathered grey wood planks, faded and aged but still standing. "
        "Not broken or destroyed, just clearly old and due for replacement. "
        "Afternoon sunlight, residential suburban setting. The yard itself is pristine, only the fence shows its age. "
        "Wide angle from patio perspective showing the full backyard."
    ),
    "after_2": (
        "Photorealistic image of the exact same well-maintained large Central Florida backyard with lush green grass, "
        "palm trees, and tropical landscaping. Everything about the yard is identical. "
        "But now there is a brand new beautiful white vinyl privacy fence installed perfectly — clean, bright, modern rails. "
        "Same afternoon sunlight, same residential suburban setting. Same patio perspective wide angle. "
        "The only difference is the stunning new fence replacing the old one. Professional installation."
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
