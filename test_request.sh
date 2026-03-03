#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNTc5Y2VjOS1lMTg4LTQ3OTEtYWM3Yi0zODM2OGUzZDE3NDYiLCJlbWFpbCI6InByaW1lc29mdGNvZGVAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzIxMzA5NTIsImV4cCI6MTc3MjczNTc1Mn0.zUn2garyJpr2orXwkd2ZGSrHDUfNNQXL65cIlQO_05A"
PLAN_ID="4a8ba46d-12c0-4b7f-8b2b-d3e63ea9652d"

curl -X POST https://proappbackend.scratchwizard.net/api/v1/subscription-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "plan_id": "'$PLAN_ID'",
    "amount": 999,
    "payment_method": "bKash Mobile",
    "payment_method_type": "mobile",
    "payment_method_name": "bKash Mobile",
    "approval_type": "auto_approved",
    "payment_currency": "bdt",
    "transaction_id": "BKASH'$(date +%s)'",
    "proof_fields": [
      {
        "id": "bkash_trx_id",
        "label": "bKash Transaction ID",
        "type": "text",
        "value": "BKASH123456"
      },
      {
        "id": "sender_number",
        "label": "Sender bKash Number",
        "type": "text",
        "value": "01712345678"
      },
      {
        "id": "payment_screenshot",
        "label": "Payment Screenshot",
        "type": "file",
        "value": "https://res.cloudinary.com/example/bkash_screenshot.jpg"
      }
    ],
    "proof_images": [
      "https://res.cloudinary.com/example/bkash_screenshot.jpg"
    ],
    "notes": "bKash payment for Professional Plan"
  }'
