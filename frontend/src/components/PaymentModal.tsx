import { axiosInstance } from "@/api";
import axios from "axios";

interface Props {
    resolution: string;
    price: number;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

export default function PaymentModal({
    resolution,
    price,
    onClose,
    onPaymentSuccess,
}: Props) {
    const handlePayment = async () => {
        // 1️⃣ Create order on backend
        const orderRes = await axiosInstance.post(
            "/api/payment/create"
        );

        const { order_id, amount, currency } = orderRes.data;

        // 2️⃣ Open Razorpay Checkout
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 🔑 REAL KEY
            amount,
            currency,
            name: "YT Downloader",
            description: `Download ${resolution}`,
            order_id,
            handler: async function (response: any) {
                // 3️⃣ Verify payment on backend
                await axiosInstance.post(
                    "/api/payment/verify",
                    {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    }
                );

                // 4️⃣ Notify parent → start download
                onPaymentSuccess();
            },
            theme: {
                color: "#000000",
            },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded w-full max-w-sm">
                <h3 className="font-bold mb-2">Payment Required</h3>
                <p className="mb-4">
                    Download <strong>{resolution}</strong> for ₹{price}
                </p>

                <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-2 rounded mb-2"
                >
                    Pay ₹{price}
                </button>

                <button
                    onClick={onClose}
                    className="w-full border py-2 rounded"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
