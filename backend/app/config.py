import os
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

FREE_MAX_RES = 480
PRICE_RUPEES = 2
DOWNLOAD_DIR = "./downloads"

# 🔑 CORS CONFIG (from .env)
_raw_origins = os.getenv("CORS_WHITELISTED_CLIENTS", "")

if _raw_origins.strip():
    CORS_WHITELISTED_CLIENTS = [
        origin.strip() for origin in _raw_origins.split(",")
    ]
else:
    # Safe default (important for Railway, preview deploys, etc.)
    CORS_WHITELISTED_CLIENTS = ["*"]
