# PLANTED DEFECTS -- see FIXTURE.md. Expected: checkov, trivy config, tfsec.
resource "azurerm_network_security_rule" "defect_open_to_world" {
  # DEFECT 6: SSH open to 0.0.0.0/0.
  name                        = "allow-ssh-any"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "22"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = "rg-fixture"
  network_security_group_name = "nsg-fixture"
}

resource "azurerm_storage_account" "defect_public" {
  # DEFECT 7: public network access + no HTTPS-only + minimum TLS below 1.2.
  name                            = "fixturestorage"
  resource_group_name             = "rg-fixture"
  location                        = "eastus"
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  public_network_access_enabled   = true
  enable_https_traffic_only       = false
  min_tls_version                 = "TLS1_0"
  allow_nested_items_to_be_public = true
}
