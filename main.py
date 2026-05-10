from solana.rpc.api import Client
from solders.keypair import Keypair
import json
import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pypdf import PdfReader
import anthropic
import io
import firebase_admin
from firebase_admin import credentials, firestore
from pydantic import BaseModel

cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

load_dotenv()

solana_client = Client("https://api.devnet.solana.com")
escrow_keypair = Keypair.from_bytes(bytes(json.loads(os.getenv("SOLANA_ESCROW_PRIVATE_KEY"))))


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "lease_summary": lease_summary
    })

    return {"id": doc_ref[1].id, "lease_summary": lease_summary}

@app.get("/listings")
async def get_listings():
    docs = db.collection("listings").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

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

@app.post("/listings/{listing_id}/lock-incentive")
async def lock_incentive(listing_id: str, amount_sol: float = Form(...), tenant_name: str = Form(...)):
    balance = solana_client.get_balance(escrow_keypair.pubkey())
    lamports = balance.value
    
    db.collection("listings").document(listing_id).update({
        "incentive_amount": amount_sol,
        "incentive_status": "locked",
        "escrow_wallet": str(escrow_keypair.pubkey()),
        "tenant_name": tenant_name
    })

    return {
        "status": "Incentive locked",
        "escrow_wallet": str(escrow_keypair.pubkey()),
        "amount_sol": amount_sol,
        "escrow_balance_lamports": lamports,
        "solana_explorer": f"https://explorer.solana.com/address/{escrow_keypair.pubkey()}?cluster=devnet"
    }
