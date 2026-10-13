variable "project_id" {
  description = "Dedicated website project, created by bootstrap.sh."
  type        = string
  default     = "arelis-sembric-web"
}

variable "region" {
  description = "Cloud Run and Artifact Registry region."
  type        = string
  default     = "europe-west3"
}

variable "domain" {
  description = "Public hostname of the website."
  type        = string
  default     = "sembric.app.arelis.digital"
}

variable "dns_project" {
  description = "Project that owns the existing app.arelis.digital Cloud DNS zone."
  type        = string
  default     = "arelis-development-427412"
}

variable "dns_zone" {
  description = "Managed zone name for app.arelis.digital."
  type        = string
  default     = "application"
}

variable "github_repository" {
  description = "Repository allowed to deploy, as owner/name."
  type        = string
  default     = "arelis-ai/sembric-web"
}

variable "github_repository_id" {
  description = "Numeric GitHub repository ID; names can be re-registered, IDs cannot."
  type        = string
}

variable "github_owner_id" {
  description = "Numeric GitHub organization ID of the repository owner."
  type        = string
  default     = "171426724"
}

variable "billing_account" {
  description = "Billing account for the project budget. Keep it in an untracked tfvars file, never in Git."
  type        = string
  sensitive   = true
}

variable "monthly_budget_units" {
  description = "Monthly budget in the billing account's currency."
  type        = number
  default     = 50
}

variable "bootstrap_image" {
  description = "Image used only when Terraform first creates the service; the deploy workflow owns the image afterwards."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "min_instances" {
  description = "Warm instances, so the first visitor never waits for a cold start."
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Hard cap on serving instances."
  type        = number
  default     = 5
}
