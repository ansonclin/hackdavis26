from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pypdf import PdfReader
import anthropic
import io
import firebase_admin
from firebase_admin import credentials, firestore
from pydantic import BaseModel
import os

cred_path = os.getenv("FIREBASE_CRED_PATH", "firebase-credentials.json")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/listings")
async def create_listing(
    tenant_name: str = Form(...),
    address: str = Form(...),
    rent: float = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    venmo_handle: str = Form(...),
    lease_file: UploadFile = File(...)
):
    contents = await lease_file.read()
    reader = PdfReader(io.BytesIO(contents))
    lease_text = ""
    for page in reader.pages:
        lease_text += page.extract_text()

    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"Please summarize this lease agreement in plain English for a college student. Highlight the key terms, any unusual clauses, and anything they should watch out for:\n\n{lease_text}"
            }
        ]
    )
    lease_summary = response.content[0].text

    doc_ref = db.collection("listings").add({
        "tenant_name": tenant_name,
        "address": address,
        "rent": rent,
        "start_date": start_date,
        "end_date": end_date,
        "venmo_handle": venmo_handle,
        "lease_summary": lease_summary,
        "created_at": firestore.SERVER_TIMESTAMP,
    })

    return {"id": doc_ref[1].id, "lease_summary": lease_summary}

@app.get("/listings")
async def get_listings():
    docs = (
        db.collection("listings")
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .stream()
    )
    results = []
    for doc in docs:
        data = doc.to_dict()
        # Drop the server timestamp — frontend doesn't need it and it's not
        # cleanly JSON-serializable.
        data.pop("created_at", None)
        results.append({"id": doc.id, **data})
    return results

@app.post("/listings/{listing_id}/confirm-payment-sent")
async def confirm_payment_sent(listing_id: str, sender_name: str = Form(...), amount: float = Form(...)):
    db.collection("listings").document(listing_id).collection("confirmations").add({
        "type": "payment_sent",
        "sender_name": sender_name,
        "amount": amount,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    return {"status": "Payment sent confirmation recorded"}

@app.post("/listings/{listing_id}/confirm-payment-received")
async def confirm_payment_received(listing_id: str, receiver_name: str = Form(...), amount: float = Form(...)):
    db.collection("listings").document(listing_id).collection("confirmations").add({
        "type": "payment_received",
        "receiver_name": receiver_name,
        "amount": amount,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    return {"status": "Payment received confirmation recorded"}
