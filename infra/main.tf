locals {
  service      = "sembric-web"
  repository   = "site"
  fqdn         = "${var.domain}."
  deploy_roles = ["roles/run.developer"]
}

data "google_project" "site" {
  project_id = var.project_id
}

resource "google_project_service" "site" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "billingbudgets.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "run.googleapis.com",
    "serviceusage.googleapis.com",
    "sts.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# --- Budget ---------------------------------------------------------------------------------------------------------

resource "google_billing_budget" "site" {
  billing_account = var.billing_account
  display_name    = "Sembric website monthly spend"

  budget_filter {
    projects        = ["projects/${data.google_project.site.number}"]
    calendar_period = "MONTH"
  }
  amount {
    specified_amount {
      units = tostring(var.monthly_budget_units)
    }
  }
  threshold_rules {
    threshold_percent = 0.5
  }
  threshold_rules {
    threshold_percent = 0.9
  }
  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "FORECASTED_SPEND"
  }

  depends_on = [google_project_service.site]
}

# --- Images ---------------------------------------------------------------------------------------------------------

resource "google_artifact_registry_repository" "site" {
  location      = var.region
  repository_id = local.repository
  description   = "Sembric website images, deployed by digest."
  format        = "DOCKER"

  docker_config {
    immutable_tags = true
  }

  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "keep-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = 20
    }
  }
  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      older_than = "2592000s"
    }
  }

  depends_on = [google_project_service.site]
}

# --- Identities -----------------------------------------------------------------------------------------------------

# Serving identity: nginx needs no Google Cloud permissions, so it holds none.
resource "google_service_account" "run" {
  account_id   = "sembric-web-run"
  display_name = "Sembric website serving identity"
}

# Deploy identity, impersonated only by GitHub Actions on main of the exact repository.
resource "google_service_account" "deploy" {
  account_id   = "sembric-web-deploy"
  display_name = "Sembric website deploy identity (GitHub Actions)"
}

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"
  description               = "Short-lived GitHub OIDC tokens for the sembric-web deploy workflow."
  depends_on                = [google_project_service.site]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "sembric-web"
  display_name                       = "sembric-web main"
  attribute_mapping = {
    "google.subject"                = "assertion.sub"
    "attribute.repository"          = "assertion.repository"
    "attribute.repository_id"       = "assertion.repository_id"
    "attribute.repository_owner_id" = "assertion.repository_owner_id"
    "attribute.ref"                 = "assertion.ref"
  }
  attribute_condition = join(" && ", [
    "assertion.repository_id == '${var.github_repository_id}'",
    "assertion.repository_owner_id == '${var.github_owner_id}'",
    "assertion.ref == 'refs/heads/main'",
  ])
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "deploy_wif" {
  service_account_id = google_service_account.deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository_id/${var.github_repository_id}"
}

resource "google_artifact_registry_repository_iam_member" "deploy_push" {
  location   = google_artifact_registry_repository.site.location
  repository = google_artifact_registry_repository.site.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.deploy.email}"
}

resource "google_cloud_run_v2_service_iam_member" "deploy" {
  for_each = toset(local.deploy_roles)
  name     = google_cloud_run_v2_service.site.name
  location = google_cloud_run_v2_service.site.location
  role     = each.value
  member   = "serviceAccount:${google_service_account.deploy.email}"
}

resource "google_service_account_iam_member" "deploy_acts_as_run" {
  service_account_id = google_service_account.run.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deploy.email}"
}

# --- Cloud Run ------------------------------------------------------------------------------------------------------

resource "google_cloud_run_v2_service" "site" {
  name                 = local.service
  location             = var.region
  ingress              = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  invoker_iam_disabled = true
  deletion_protection  = true

  template {
    service_account                  = google_service_account.run.email
    max_instance_request_concurrency = 250
    timeout                          = "10s"
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
    containers {
      image = var.bootstrap_image
      ports {
        container_port = 8080
      }
      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle          = true
        startup_cpu_boost = true
      }
      startup_probe {
        tcp_socket {
          port = 8080
        }
        period_seconds    = 2
        failure_threshold = 10
      }
    }
  }

  lifecycle {
    # The deploy workflow owns the running image (by digest); Terraform owns everything else.
    ignore_changes = [template[0].containers[0].image, client, client_version]
  }

  depends_on = [google_project_service.site]
}

# --- Global HTTPS load balancer -------------------------------------------------------------------------------------

resource "google_compute_global_address" "v4" {
  name       = "${local.service}-v4"
  ip_version = "IPV4"
  depends_on = [google_project_service.site]
}

resource "google_compute_global_address" "v6" {
  name       = "${local.service}-v6"
  ip_version = "IPV6"
  depends_on = [google_project_service.site]
}

resource "google_compute_region_network_endpoint_group" "site" {
  name                  = local.service
  region                = var.region
  network_endpoint_type = "SERVERLESS"
  cloud_run {
    service = google_cloud_run_v2_service.site.name
  }
}

resource "google_compute_backend_service" "site" {
  name                  = local.service
  load_balancing_scheme = "EXTERNAL_MANAGED"
  protocol              = "HTTPS"
  backend {
    group = google_compute_region_network_endpoint_group.site.id
  }
  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_url_map" "site" {
  name        = local.service
  description = "Serves the site on its canonical host; any other Host header is redirected there."
  default_url_redirect {
    host_redirect          = var.domain
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
  host_rule {
    hosts        = [var.domain]
    path_matcher = "site"
  }
  path_matcher {
    name            = "site"
    default_service = google_compute_backend_service.site.id
  }
}

resource "google_compute_managed_ssl_certificate" "site" {
  name = "${local.service}-cert"
  managed {
    domains = [var.domain]
  }
  depends_on = [google_project_service.site]
}

resource "google_compute_ssl_policy" "modern" {
  name            = "${local.service}-modern-tls"
  profile         = "MODERN"
  min_tls_version = "TLS_1_2"
  depends_on      = [google_project_service.site]
}

resource "google_compute_target_https_proxy" "site" {
  name             = local.service
  url_map          = google_compute_url_map.site.id
  ssl_certificates = [google_compute_managed_ssl_certificate.site.id]
  ssl_policy       = google_compute_ssl_policy.modern.id
}

resource "google_compute_global_forwarding_rule" "https" {
  for_each = {
    v4 = google_compute_global_address.v4.address
    v6 = google_compute_global_address.v6.address
  }
  name                  = "${local.service}-https-${each.key}"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  ip_address            = each.value
  port_range            = "443"
  target                = google_compute_target_https_proxy.site.id
}

# HTTP only ever redirects to HTTPS.
resource "google_compute_url_map" "redirect" {
  name = "${local.service}-http-redirect"
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "redirect" {
  name    = "${local.service}-http-redirect"
  url_map = google_compute_url_map.redirect.id
}

resource "google_compute_global_forwarding_rule" "http" {
  for_each = {
    v4 = google_compute_global_address.v4.address
    v6 = google_compute_global_address.v6.address
  }
  name                  = "${local.service}-http-${each.key}"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  ip_address            = each.value
  port_range            = "80"
  target                = google_compute_target_http_proxy.redirect.id
}

# --- DNS in the existing app.arelis.digital zone -------------------------------------------------------------------

resource "google_dns_record_set" "a" {
  project      = var.dns_project
  managed_zone = var.dns_zone
  name         = local.fqdn
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_global_address.v4.address]
}

resource "google_dns_record_set" "aaaa" {
  project      = var.dns_project
  managed_zone = var.dns_zone
  name         = local.fqdn
  type         = "AAAA"
  ttl          = 300
  rrdatas      = [google_compute_global_address.v6.address]
}

# --- Monitoring -----------------------------------------------------------------------------------------------------

resource "google_monitoring_uptime_check_config" "home" {
  display_name = "Sembric website home page"
  timeout      = "10s"
  period       = "300s"
  http_check {
    path           = "/"
    port           = 443
    use_ssl        = true
    validate_ssl   = true
    request_method = "GET"
    accepted_response_status_codes {
      status_value = 200
    }
  }
  content_matchers {
    content = "certified answers"
    matcher = "CONTAINS_STRING"
  }
  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.domain
    }
  }
  depends_on = [google_project_service.site]
}
