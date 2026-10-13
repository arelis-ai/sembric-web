mock_provider "google" {
  mock_data "google_project" {
    defaults = {
      number = "123456789012"
    }
  }
}

override_resource {
  target = google_service_account.run
  values = {
    name  = "projects/arelis-sembric-web/serviceAccounts/sembric-web-run@arelis-sembric-web.iam.gserviceaccount.com"
    email = "sembric-web-run@arelis-sembric-web.iam.gserviceaccount.com"
  }
}

override_resource {
  target = google_service_account.deploy
  values = {
    name  = "projects/arelis-sembric-web/serviceAccounts/sembric-web-deploy@arelis-sembric-web.iam.gserviceaccount.com"
    email = "sembric-web-deploy@arelis-sembric-web.iam.gserviceaccount.com"
  }
}

override_resource {
  target = google_iam_workload_identity_pool.github
  values = {
    name = "projects/123456789012/locations/global/workloadIdentityPools/github"
  }
}

variables {
  billing_account      = "AAAAAA-BBBBBB-CCCCCC"
  github_repository_id = "987654321"
}

run "secure_public_site" {
  command = apply

  assert {
    condition     = google_cloud_run_v2_service.site.ingress == "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
    error_message = "Only the load balancer may reach the service; the run.app URL must refuse internet traffic."
  }
  assert {
    condition     = google_cloud_run_v2_service.site.template[0].service_account == "sembric-web-run@arelis-sembric-web.iam.gserviceaccount.com"
    error_message = "Serving and deploy identities must be separate."
  }
  assert {
    condition     = google_service_account_iam_member.deploy_wif.member == "principalSet://iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/github/attribute.repository_id/987654321"
    error_message = "Only the exact repository may impersonate the deploy identity."
  }
  assert {
    condition     = google_cloud_run_v2_service.site.location == "europe-west3"
    error_message = "The service runs in europe-west3."
  }
  assert {
    condition     = google_artifact_registry_repository.site.docker_config[0].immutable_tags
    error_message = "Image tags must be immutable; deployments use digests."
  }
  assert {
    condition = (
      strcontains(google_iam_workload_identity_pool_provider.github.attribute_condition, "assertion.repository_id == '987654321'") &&
      strcontains(google_iam_workload_identity_pool_provider.github.attribute_condition, "assertion.repository_owner_id == '171426724'") &&
      strcontains(google_iam_workload_identity_pool_provider.github.attribute_condition, "assertion.ref == 'refs/heads/main'")
    )
    error_message = "Only main of the exact repository (by numeric ID) may obtain deploy credentials."
  }
  assert {
    condition     = google_compute_backend_service.site.load_balancing_scheme == "EXTERNAL_MANAGED"
    error_message = "Use the global external Application Load Balancer."
  }
  assert {
    condition     = google_compute_url_map.redirect.default_url_redirect[0].https_redirect
    error_message = "Plain HTTP must only redirect to HTTPS."
  }
  assert {
    condition     = google_compute_managed_ssl_certificate.site.managed[0].domains == tolist(["sembric.app.arelis.digital"])
    error_message = "The managed certificate covers exactly the public hostname."
  }
  assert {
    condition     = google_compute_ssl_policy.modern.min_tls_version == "TLS_1_2"
    error_message = "TLS 1.2 is the minimum."
  }
  assert {
    condition = (
      google_dns_record_set.a.name == "sembric.app.arelis.digital." &&
      google_dns_record_set.a.managed_zone == "application" &&
      google_dns_record_set.a.project == "arelis-development-427412"
    )
    error_message = "The A record belongs in the existing app.arelis.digital zone."
  }
  assert {
    condition     = google_compute_global_forwarding_rule.http["v4"].port_range == "80" && google_compute_global_forwarding_rule.https["v4"].port_range == "443"
    error_message = "Port 80 redirects and port 443 serves."
  }
}
