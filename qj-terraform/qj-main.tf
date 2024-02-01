terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
    }
  }
}
provider "azurerm" {
  features {}
}
resource "azurerm_resource_group" "dvopsResourceGroup" {
  name     = "newdvopsResourceGroup"
  location = "East US"
}
resource "azurerm_kubernetes_cluster" "dvopsAKSCluster" {
  name                = "dvopsAKSCluster"
  location            = azurerm_resource_group.dvopsResourceGroup.location
  resource_group_name = azurerm_resource_group.dvopsResourceGroup.name
  dns_prefix          = "rms-aks"
  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_DS2_v2"
  }
  service_principal {
    client_id     = "40f32e5e-edda-4597-9edd-de23c23e00eb"
    client_secret = "NFA8Q~Kq-bJi_mYb5gPt5IMkSEtoEizKo.KgTdeQ"
  }
}