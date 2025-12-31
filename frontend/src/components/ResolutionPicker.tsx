import { useState } from "react";
import axios from "axios";
import PaymentModal from "./PaymentModal";
import type { Resolution } from "../Home";
import { axiosInstance } from "@/api";

interface Props {
    url: string;
    resolutions: Resolution[];
}

export default function ResolutionPicker({ url, resolutions }: Props) {
    const [status, setStatus] = useState("");
    const [showPayment, setShowPayment] = useState(false);
    const [selected, setSelected] = useState<Resolution | null>(null);

    /**
     * FINAL download trigger (only after payment verification)
     */
    const triggerDownload = async (resolution: string) => {
        try {
            setStatus("Preparing download...");

            const response = await axiosInstance.post(
                "/api/download",
                null,
                {
                    params: {
                        url,
                        resolution,
                        payment_verified: true, // 🔒 ONLY true after payment
                    },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${resolution}.mp4`;
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            setStatus(`Download started for ${resolution}`);
        } catch (err: any) {
            setStatus(
                err?.response?.data?.detail ||
                "Download failed. Please try again."
            );
        }
    };

    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">
                Available Resolutions
            </h2>

            <div className="space-y-2">
                {resolutions.map((res) => (
                    <div
                        key={res.label}
                        className="flex justify-between items-center border p-3 rounded"
                    >
                        <span>{res.label}</span>

                        {res.paid ? (
                            <button
                                onClick={() => {
                                    setSelected(res);
                                    setShowPayment(true); // 🔑 ONLY open payment modal
                                }}
                                className="bg-yellow-500 text-black px-3 py-1 rounded"
                            >
                                🔒 Pay ₹{res.price}
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    // Free resolution → direct download allowed
                                    const response = await axios.post(
                                        "http://localhost:8000/api/download",
                                        null,
                                        {
                                            params: {
                                                url,
                                                resolution: res.label,
                                                payment_verified: false,
                                            },
                                            responseType: "blob",
                                        }
                                    );

                                    const blob = new Blob([response.data]);
                                    const link = document.createElement("a");
                                    link.href = window.URL.createObjectURL(blob);
                                    link.download = `${res.label}.mp4`;
                                    link.click();
                                }}
                                className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                                Download
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {status && (
                <p className="text-sm text-center text-blue-600 mt-4">
                    {status}
                </p>
            )}

            {showPayment && selected && (
                <PaymentModal
                    resolution={selected.label}
                    price={selected.price!}
                    onClose={() => setShowPayment(false)}
                    onPaymentSuccess={() => {
                        setShowPayment(false);
                        triggerDownload(selected.label); // ✅ ONLY here
                    }}
                />
            )}
        </div>
    );
}
