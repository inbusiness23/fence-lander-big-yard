"""
Generate improved Before/After images for ASAP Fence & Gates.
Before: Nice well-maintained Florida yard with OLD/DATED fence (not destroyed)
After: Same yard, brand new premium fence
"""
import asyncio
import base64
import os
from pathlib import Path

import httpx

ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "frontend/public/images/fences"
BUILD_DIR = ROOT_DIR / "frontend/build/images/fences"

OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations"
MODEL = "gpt-image-1"
SIZE = "1536x1024"


def _load_env_file(path: Path) -> None:
    """Best-effort .env loader (no external deps). Does not overwrite existing env vars."""
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip("'").strip('"')
        if not k or k in os.environ:
            continue
        os.environ[k] = v


def _api_key() -> str:
    _load_env_file(Path(__file__).parent / ".env")
    key = os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
    if not key:
        raise SystemExit(
            "Missing API key. Set OPENAI_API_KEY (recommended) or EMERGENT_LLM_KEY in backend/.env or your shell."
        )
    return key


def _write_bytes_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_bytes(data)
    tmp.replace(path)


async def _generate_png(prompt: str, api_key: str) -> bytes:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"model": MODEL, "prompt": prompt, "size": SIZE, "quality": "high", "output_format": "png"}
    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(OPENAI_IMAGES_URL, headers=headers, json=payload)
        resp.raise_for_status()
        body = resp.json()
        return base64.b64decode(body["data"][0]["b64_json"])

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

async def generate_images(force: bool = False):
    api_key = _api_key()
    
    for name, prompt in PROMPTS.items():
        output_path = OUTPUT_DIR / f"{name}.png"
        if output_path.exists() and not force:
            print(f"[SKIP] {name}.png already exists")
            continue
            
        print(f"[GENERATING] {name}...")
        try:
            png = await _generate_png(prompt=prompt, api_key=api_key)
            _write_bytes_atomic(output_path, png)
            if BUILD_DIR.exists():
                _write_bytes_atomic(BUILD_DIR / f"{name}.png", png)
            print(f"[SUCCESS] {name}.png saved ({len(png)} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed to generate {name}: {e}")

if __name__ == "__main__":
    # Use FORCE=1 to overwrite existing files.
    force = os.getenv("FORCE", "").strip().lower() in {"1", "true", "yes", "y", "on"}
    asyncio.run(generate_images(force=force))
