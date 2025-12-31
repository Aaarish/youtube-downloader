import razorpay
from app.config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, PRICE_RUPEES

client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)

def create_order():
    return client.order.create({
        "amount": PRICE_RUPEES * 100,
        "currency": "INR",
        "payment_capture": 1
    })

def verify_payment(payload):
    client.utility.verify_payment_signature(payload)
