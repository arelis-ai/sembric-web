#!/usr/bin/env bash
# One-time creation of the dedicated website project and its Terraform state bucket. Everything else is Terraform.
# Usage: ORG_ID=... BILLING_ACCOUNT=... infra/bootstrap.sh
set -euo pipefail
PROJECT_ID="${PROJECT_ID:-arelis-sembric-web}"
REGION="${REGION:-europe-west3}"
: "${ORG_ID:?Set ORG_ID to the arelis.digital organization ID}"
: "${BILLING_ACCOUNT:?Set BILLING_ACCOUNT (never commit it)}"

if ! gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud projects create "$PROJECT_ID" --organization="$ORG_ID" --name="Sembric website" \
    --labels=product=sembric,plane=website
fi
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT"
gcloud services enable serviceusage.googleapis.com cloudresourcemanager.googleapis.com storage.googleapis.com \
  --project="$PROJECT_ID"
bucket="gs://${PROJECT_ID}-tfstate"
if ! gcloud storage buckets describe "$bucket" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud storage buckets create "$bucket" --project="$PROJECT_ID" --location="$REGION" \
    --uniform-bucket-level-access --public-access-prevention
fi
gcloud storage buckets update "$bucket" --versioning
echo "Project $PROJECT_ID is ready. Next: cd infra && terraform init && terraform apply"
