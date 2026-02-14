"""
Regenerate fence images for ASAP Fence & Gates landing page.

This script writes into:
  frontend/public/images/fences/*.png
and mirrors into:
  frontend/build/images/fences/*.png (if the build folder exists)

It uses the OpenAI Images API (model: gpt-image-1) and is designed to overwrite
existing files when run with --force, keeping the same filenames.
"""

import argparse
import asyncio
import base64
import os
from pathlib import Path
from typing import Dict, Iterable, Tuple

import httpx

ROOT_DIR = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT_DIR / "frontend/public/images/fences"
BUILD_DIR = ROOT_DIR / "frontend/build/images/fences"

OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations"
DEFAULT_MODEL = "gpt-image-1"
DEFAULT_SIZE = "1536x1024"


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


def _load_env() -> None:
    # Optional local secrets file (not checked in).
    _load_env_file(Path(__file__).parent / ".env")


def _api_key() -> str:
    # Prefer the standard OpenAI env var; fall back to legacy EMERGENT key if you use it.
    key = os.getenv("OPENAI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
    if not key:
        raise SystemExit(
            "Missing API key. Set OPENAI_API_KEY (recommended) or EMERGENT_LLM_KEY in "
            "backend/.env or your shell environment."
        )
    return key


PHOTO_STYLE = (
    "Ultra photorealistic real-world DSLR photograph (NOT a render, NOT CGI, NOT 3D, NOT illustration). "
    "Natural lighting, realistic shadows, subtle imperfections, true-to-life colors, crisp detail on materials. "
    "Professional real estate photography. 35mm lens perspective, f/5.6, shallow-to-moderate depth of field. "
)

PROMPTS: Dict[str, str] = {
    "white_vinyl": (
        PHOTO_STYLE
        + "A beautiful 6-foot-tall white vinyl privacy fence with modern horizontal rails, professionally installed "
        "in a spacious Central Florida backyard. Lush but realistic green grass, palm trees, and tropical landscaping. "
        "Bright sunny day with deep blue sky and a few natural clouds. "
        "Shot from a slight angle showing the fence line receding into the distance; realistic perspective and scale. "
        "Vinyl surface shows subtle texture, mild sheen, and small real-world variation (no perfect plastic look)."
    ),
    "black_aluminum": (
        PHOTO_STYLE
        + "An elegant three-rail black ornamental aluminum fence, about 4 feet tall, with flat-top pickets and "
        "a decorative rake bottom. Installed in a large Central Florida backyard with sunlit green lawn and palm trees. "
        "Warm late-afternoon light, realistic specular highlights on powder-coated metal, and natural background bokeh. "
        "No warped geometry; straight posts and level rails like a real installation."
    ),
    "cedar": (
        PHOTO_STYLE
        + "A premium natural cedar wood privacy fence installed in a large Central Florida backyard. "
        "Cedar has warm reddish-brown tones, visible grain, knots, and slight variations between boards. "
        "Golden hour sunlight, subtle shadows between pickets, clean straight lines and proper post spacing. "
        "Tropical landscaping and palm trees in the background; suburban residential context."
    ),
    "pressure_treated_pine": (
        PHOTO_STYLE
        + "A pressure-treated pine wood privacy fence in a large Florida backyard. "
        "Fresh treated wood color (yellowish-tan with a slight green cast), visible grain and saw marks, "
        "realistic fasteners and slight board variation. "
        "Bright daylight, blue sky, palm trees, and clean professional installation along a long side yard."
    ),
    "chain_link": (
        PHOTO_STYLE
        + "A black vinyl-coated chain link fence installed in a large Central Florida backyard. "
        "Taut mesh, realistic diamond pattern, straight posts with caps, and tension bands visible. "
        "Sunny Florida day with palm trees and tropical plants; green grass lawn. "
        "Camera placed low and angled along the fence line for depth and realism."
    ),
    "durafence": (
        PHOTO_STYLE
        + "A modern composite privacy fence (wood-look composite panels) in dark brown/walnut color, "
        "professionally installed in a large Central Florida backyard. "
        "Composite panels show realistic wood-grain embossing and subtle matte finish (not plastic). "
        "Sunny day with blue sky, palm trees, and realistic landscaping; fence line receding in perspective."
    ),
}


def _iter_targets(names: Iterable[str] = ()) -> Iterable[Tuple[str, str]]:
    if names:
        for n in names:
            if n not in PROMPTS:
                raise SystemExit(f"Unknown name: {n}. Valid: {', '.join(sorted(PROMPTS.keys()))}")
        for n in names:
            yield n, PROMPTS[n]
        return
    for n, p in PROMPTS.items():
        yield n, p


async def _generate_png(prompt: str, api_key: str, model: str, size: str) -> bytes:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": "high",
        "output_format": "png",
    }

    async with httpx.AsyncClient(timeout=180.0) as client:
        resp = await client.post(OPENAI_IMAGES_URL, headers=headers, json=payload)
        resp.raise_for_status()
        body = resp.json()
        b64 = body["data"][0]["b64_json"]
        return base64.b64decode(b64)


def _write_bytes_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_bytes(data)
    tmp.replace(path)


async def generate_images(force: bool, names: Iterable[str], model: str, size: str) -> None:
    _load_env()
    key = _api_key()

    public_dir = PUBLIC_DIR
    build_dir = BUILD_DIR if BUILD_DIR.exists() else None

    for name, prompt in _iter_targets(names):
        out_public = public_dir / f"{name}.png"
        if out_public.exists() and not force:
            print(f"[SKIP] {name}.png already exists (use --force to overwrite)")
            continue

        print(f"[GENERATING] {name} ({size}, {model})...")
        try:
            png = await _generate_png(prompt=prompt, api_key=key, model=model, size=size)
            _write_bytes_atomic(out_public, png)
            if build_dir is not None:
                _write_bytes_atomic(build_dir / f"{name}.png", png)
            print(f"[SUCCESS] {name}.png saved ({len(png)} bytes)")
        except Exception as e:
            print(f"[ERROR] Failed to generate {name}: {e}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Regenerate fence images (photoreal) with same filenames.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing PNGs.")
    parser.add_argument(
        "--names",
        nargs="*",
        default=[],
        help=f"Optional list of image names to generate: {', '.join(sorted(PROMPTS.keys()))}",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"OpenAI image model (default: {DEFAULT_MODEL})")
    parser.add_argument("--size", default=DEFAULT_SIZE, help=f"Image size (default: {DEFAULT_SIZE})")
    args = parser.parse_args()

    asyncio.run(generate_images(force=args.force, names=args.names, model=args.model, size=args.size))


if __name__ == "__main__":
    main()
