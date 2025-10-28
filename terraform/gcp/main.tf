terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# VPC Network
resource "google_compute_network" "mantrix_vpc" {
  name                    = "mantrix-vpc"
  auto_create_subnetworks = false
}

# Subnet
resource "google_compute_subnetwork" "mantrix_subnet" {
  name          = "mantrix-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.mantrix_vpc.id
}

# Firewall Rules
resource "google_compute_firewall" "allow_ssh" {
  name    = "mantrix-allow-ssh"
  network = google_compute_network.mantrix_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["mantrix-vm"]
}

resource "google_compute_firewall" "allow_http" {
  name    = "mantrix-allow-http"
  network = google_compute_network.mantrix_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["mantrix-vm"]
}

resource "google_compute_firewall" "allow_https" {
  name    = "mantrix-allow-https"
  network = google_compute_network.mantrix_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["mantrix-vm"]
}

# Static IP Address
resource "google_compute_address" "mantrix_ip" {
  name = "mantrix-static-ip"
}

# Compute Instance (equivalent to t3.medium: 2 vCPU, 4GB RAM)
resource "google_compute_instance" "mantrix_vm" {
  name         = "mantrix-production"
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["mantrix-vm", "http-server", "https-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 30
      type  = "pd-standard"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.mantrix_subnet.id

    access_config {
      nat_ip = google_compute_address.mantrix_ip.address
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.ssh_public_key_path)}"
  }

  metadata_startup_script = file("${path.module}/startup-script.sh")

  service_account {
    scopes = ["cloud-platform"]
  }

  labels = {
    environment = "production"
    application = "mantrix"
  }
}

# DNS Record (if using Cloud DNS)
resource "google_dns_record_set" "mantrix_a" {
  count = var.use_cloud_dns ? 1 : 0

  name         = "mantrix.cloudmantra.ai."
  type         = "A"
  ttl          = 300
  managed_zone = var.dns_zone_name
  rrdatas      = [google_compute_address.mantrix_ip.address]
}

# Outputs
output "instance_ip" {
  description = "Public IP address of the Mantrix instance"
  value       = google_compute_address.mantrix_ip.address
}

output "instance_name" {
  description = "Name of the compute instance"
  value       = google_compute_instance.mantrix_vm.name
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh ${var.ssh_user}@${google_compute_address.mantrix_ip.address}"
}

output "application_url" {
  description = "Application URL"
  value       = "http://${google_compute_address.mantrix_ip.address}"
}

output "dns_configuration" {
  description = "DNS A record to configure"
  value       = "mantrix.cloudmantra.ai -> ${google_compute_address.mantrix_ip.address}"
}
