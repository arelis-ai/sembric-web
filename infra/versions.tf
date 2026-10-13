terraform {
  required_version = ">= 1.10.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.0"
    }
  }
  # State lives in the website project's versioned bucket created by bootstrap.sh.
  backend "gcs" {
    bucket = "arelis-sembric-web-tfstate"
    prefix = "site"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  # Bill API quota to this project rather than whatever quota project the operator's credentials carry.
  billing_project       = var.project_id
  user_project_override = true
}
