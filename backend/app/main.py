from fastapi import FastAPI, BackgroundTasks, HTTPException
from pytubefix import YouTube
from app.models import ResolutionResponse, Resolution
from app.utils import resolution_to_int
from app.downloader import download_video
from app.payments import create_order, verify_payment
from app.config import FREE_MAX_RES, DOWNLOAD_DIR, CORS_WHITELISTED_CLIENTS
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import mimetypes
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_WHITELISTED_CLIENTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(DOWNLOAD_DIR, exist_ok=True)


@app.post("/api/resolutions", response_model=ResolutionResponse)
def fetch_resolutions(url: str):
    yt = YouTube(url)
    res_set = set()

    streams = yt.streams.filter(file_extension="mp4", res=True)
    resolutions = []

    for s in streams:
        if not s.resolution:
            continue

        if s.resolution not in res_set:
            res_set.add(s.resolution)
            res_val = resolution_to_int(s.resolution)
            paid = res_val > FREE_MAX_RES
            resolutions.append(
                Resolution(
                    label=s.resolution,
                    paid=paid,
                    price=2 if paid else None
                )
            )

    return ResolutionResponse(title=yt.title, resolutions=resolutions)


@app.post("/api/payment/create")
def create_payment():
    return create_order()


@app.post("/api/payment/verify")
def verify(payload: dict):
    verify_payment(payload)
    return {"status": "ok"}


@app.post("/api/download")
def download(
    url: str,
    resolution: str,
):
    # Paywall enforcement (still server-side)
    if resolution_to_int(resolution) > FREE_MAX_RES:
        raise HTTPException(status_code=402, detail="Payment required")

    # Download video to server temp location
    file_path = download_video(url, resolution, DOWNLOAD_DIR)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Download failed")

    filename = os.path.basename(file_path)
    media_type, _ = mimetypes.guess_type(file_path)
    media_type = media_type or "application/octet-stream"

    def iterfile():
        with open(file_path, mode="rb") as f:
            yield from f
        os.remove(file_path)  # cleanup after streaming

    return StreamingResponse(
        iterfile(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
