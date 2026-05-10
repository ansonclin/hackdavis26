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
import os

cred_path = os.getenv("FIREBASE_CRED_PATH", "firebase-credentials.json")
cred = credentials.Certificate(cred_path)
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
    venmo_handle: str = Form("N/A"),
    incentive_amount: float = Form(...),
    total_incentive: float = Form(0),
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
                "content": f"Summarize this lease agreement for a college student. Use plain English only — no markdown, no ## headers, no ** bold. Structure your response with these sections, each on its own line with a label followed by a colon:\n\nKey Terms: (rent, dates, deposit)\nUtilities & Fees: (what's included, what's extra)\nRules: (pets, guests, noise, etc.)\nWatch Out For: (unusual clauses, penalties, anything risky)\n\nKeep each section to 1-3 short sentences. Be direct and practical.\n\nLease text:\n{lease_text}"
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
        "incentive_amount": incentive_amount,
        "total_incentive": total_incentive,
        "payment_method": "solana",
        "escrow_wallet": str(escrow_keypair.pubkey()),
        "lease_summary": lease_summary,
        "created_at": firestore.SERVER_TIMESTAMP,
    })

    return {
        "id": doc_ref[1].id,
        "lease_summary": lease_summary,
        "escrow_wallet": str(escrow_keypair.pubkey()),
        "incentive_amount": incentive_amount,
        "total_incentive": total_incentive,
        "solana_explorer": f"https://explorer.solana.com/address/{escrow_keypair.pubkey()}?cluster=devnet"
    }

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
