output "ipv4_address" {
  value = google_compute_global_address.v4.address
}

output "ipv6_address" {
  value = google_compute_global_address.v6.address
}

output "service_url" {
  description = "Direct run.app URL; ingress refuses it from the internet, only the load balancer reaches the service."
  value       = google_cloud_run_v2_service.site.uri
}

output "workload_identity_provider" {
  description = "Value for the GCP_WIF_PROVIDER repository variable."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deploy_service_account" {
  description = "Value for the GCP_DEPLOY_SERVICE_ACCOUNT repository variable."
  value       = google_service_account.deploy.email
}

output "image_repository" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.site.repository_id}"
}

output "certificate" {
  value = google_compute_managed_ssl_certificate.site.name
}
