# Infrastructure

Terraform for the website's dedicated Google Cloud project, `arelis-sembric-web` (europe-west3):

- Artifact Registry repository `site` (immutable tags, cleanup policy)
- Cloud Run service `sembric-web` (ingress: internal and Cloud Load Balancing only; one warm instance; serving identity
  with no permissions)
- Workload Identity Federation pool `github`, provider `sembric-web` restricted to this repository's numeric ID, its
  owner ID and `refs/heads/main`, impersonating the separate deploy identity
- Global external Application Load Balancer (IPv4 + IPv6) with a Google-managed certificate, a modern TLS policy,
  a canonical-host redirect for other Host headers and an HTTP→HTTPS redirect
- A and AAAA records for `sembric.app.arelis.digital` in the existing `application` zone (`app.arelis.digital`) in
  `arelis-development-427412`
- Uptime check and a project budget

## First-time setup

```bash
ORG_ID=<org id> BILLING_ACCOUNT=<billing account> infra/bootstrap.sh   # project, billing link, state bucket
cd infra
cp terraform.tfvars.example terraform.tfvars                         # billing account + GitHub repository ID (untracked)
terraform init
terraform apply
```

Then set the repository variables used by the deploy workflow:

```bash
gh variable set GCP_PROJECT_ID --body arelis-sembric-web
gh variable set GCP_REGION --body europe-west3
gh variable set GCP_WIF_PROVIDER --body "$(terraform output -raw workload_identity_provider)"
gh variable set GCP_DEPLOY_SERVICE_ACCOUNT --body "$(terraform output -raw deploy_service_account)"
```

The certificate becomes ACTIVE after the A/AAAA records resolve to the load balancer (typically 15–60 minutes):

```bash
gcloud compute ssl-certificates describe sembric-web-cert --global --project arelis-sembric-web --format='value(managed.status)'
```

## Checks

```bash
terraform fmt -check -recursive
terraform validate
terraform test        # mocked provider; not evidence of deployed resources
terraform plan        # after apply, expect "No changes"
```

The Cloud Run image is owned by the deploy workflow and ignored by Terraform, so deployments do not create drift.
