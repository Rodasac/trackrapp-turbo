#!/usr/bin/env bash
# Creates the TrackrApp Pro product and prices in Stripe (test mode).
# Requires the Stripe CLI: https://stripe.com/docs/stripe-cli
# Usage: bash scripts/stripe-setup.sh
set -euo pipefail

echo "Creating TrackrApp Pro product..."
PRODUCT_ID=$(stripe products create \
  --name "TrackrApp Pro" \
  --description "AI-powered spending tips, push notifications, and advanced analytics." \
  | jq -r '.id')
echo "  Product: $PRODUCT_ID"

echo "Creating monthly price (\$4/month)..."
MONTHLY_PRICE_ID=$(stripe prices create \
  --product "$PRODUCT_ID" \
  --unit-amount 400 \
  --currency usd \
  --nickname "Pro Monthly" \
  -d "recurring[interval]=month" | jq -r '.id')
echo "  Monthly price: $MONTHLY_PRICE_ID"

echo "Creating annual price (\$40/year)..."
ANNUAL_PRICE_ID=$(stripe prices create \
  --product "$PRODUCT_ID" \
  --unit-amount 4000 \
  --currency usd \
  --nickname "Pro Annual" \
  -d "recurring[interval]=year"| jq -r '.id')
echo "  Annual price: $ANNUAL_PRICE_ID"

echo ""
echo "Add the following to apps/web/.env.local:"
echo ""
echo "STRIPE_PRO_MONTHLY_PRICE_ID=\"$MONTHLY_PRICE_ID\""
echo "STRIPE_PRO_ANNUAL_PRICE_ID=\"$ANNUAL_PRICE_ID\""
