import { useState } from "react";
import ResolutionPicker from "./components/ResolutionPicker";
import { fetchResolutions } from "./api";

export interface Resolution {
    label: string;
    paid: boolean;
    price?: number;
}

export default function Home() {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [resolutions, setResolutions] = useState<Resolution[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchResolutionsData = async () => {
        if (!url) {
            setError("Please enter a YouTube URL");
            return;
        }

        setError("");
        setLoading(true);
        setResolutions([]);

        try {
            const data = await fetchResolutions(url);

            setTitle(data.title);
            setResolutions(data.resolutions);
        } catch (err: any) {
            setError(err.message || "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    YouTube Video Downloader
                </h1>

                <input
                    type="text"
                    placeholder="Paste YouTube URL"
                    className="w-full border p-2 rounded mb-3"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <button
                    onClick={fetchResolutionsData}
                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                    disabled={loading}
                >
                    {loading ? "Fetching..." : "Get Resolutions"}
                </button>

                {error && (
                    <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
                )}

                {title && (
                    <p className="text-sm text-gray-700 mt-4 text-center">
                        <strong>Video:</strong> {title}
                    </p>
                )}

                {resolutions.length > 0 && (
                    <ResolutionPicker url={url} resolutions={resolutions} />
                )}
            </div>
        </div>
    );
}
