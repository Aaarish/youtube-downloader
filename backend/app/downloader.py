import os
import subprocess
from pytubefix import YouTube
from http.client import RemoteDisconnected


def download_video(url: str, resolution: str, output_dir: str) -> str:
    yt = YouTube(
        url,
        use_oauth=False,
        allow_oauth_cache=False,
    )

    # Use pytube's own filename handling
    progressive = yt.streams.filter(
        res=resolution,
        progressive=True,
        file_extension="mp4"
    ).first()

    try:
        if progressive:
            if progressive.filesize is None:
                progressive._filesize = progressive.filesize_approx

            # 🔑 THIS RETURNS THE ACTUAL PATH CREATED
            file_path = progressive.download(output_path=output_dir)
            return file_path

        # DASH (video + audio)
        video = yt.streams.filter(
            res=resolution,
            only_video=True,
            file_extension="mp4"
        ).first()

        audio = yt.streams.filter(
            only_audio=True,
            file_extension="mp4"
        ).order_by("abr").desc().first()

        if not video or not audio:
            raise RuntimeError("Required streams not found")

        if video.filesize is None:
            video._filesize = video.filesize_approx
        if audio.filesize is None:
            audio._filesize = audio.filesize_approx

        video_path = video.download(output_path=output_dir)
        audio_path = audio.download(output_path=output_dir)

        final_path = os.path.splitext(video_path)[0] + "_merged.mp4"

        subprocess.run(
            [
                "ffmpeg",
                "-i", video_path,
                "-i", audio_path,
                "-c", "copy",
                final_path,
                "-y",
            ],
            check=True
        )

        os.remove(video_path)
        os.remove(audio_path)

        return final_path

    except RemoteDisconnected:
        raise RuntimeError("YouTube closed the connection. Please retry.")
