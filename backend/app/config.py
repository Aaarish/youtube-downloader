import os
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
CLIENTS = os.getenv("HOSTS", "http://localhost:5173,http://127.0.0.1:5173")

# CORS origins from environment variable (comma-separated)
_raw_origins = os.getenv("CORS_WHITELISTED_CLIENTS", "")
CORS_WHITELISTED_CLIENTS = [
    origin.strip()
    for origin in _raw_origins.split(",")
    if origin.strip()
]

if not CORS_WHITELISTED_CLIENTS:
    raise RuntimeError(
        "CORS_WHITELISTED_CLIENTS is not set or empty"
    )

DOWNLOAD_DIR = "./downloads"
FREE_MAX_RES = 480
PRICE_RUPEES = 2
