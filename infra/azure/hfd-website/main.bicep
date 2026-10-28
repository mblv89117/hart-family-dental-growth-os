targetScope = 'subscription'

@description('Dedicated resource group for the Hart Family Dental website only. Do not deploy other clients here.')
param resourceGroupName string = 'rg-hfd-website'

@description('West US 3 is the closest Azure region to Desert Hot Springs and Yucca Valley. Override if the subscription restricts it.')
param location string = 'westus3'

@description('1 keeps a replica warm for SEO and ad landing latency. 0 scales to zero and saves the idle bill. See docs/AZURE_MIGRATION_HFD_WEBSITE.md.')
@minValue(0)
@maxValue(2)
param minReplicas int = 1

@minValue(1)
@maxValue(5)
param maxReplicas int = 3

@description('Leave false until Key Vault secret versions exist and an image has been pushed to this ACR.')
param deployContainerApp bool = false

@description('Full image reference, for example myacr.azurecr.io/hfd-website:sha. Ignored until deployContainerApp is true.')
param containerImage string = ''

@description('Object id of the GitHub OIDC service principal. Empty skips role assignments. Scope is this resource group and its ACR only.')
param githubActionsPrincipalId string = ''

@description('Leave false so a validation environment can be deleted. Turning this on cannot be undone.')
param purgeProtection bool = false

param smtpHost string = ''
param smtpPort string = '587'
param smtpFrom string = ''
param resendFromEmail string = ''

@description('Existing office CC. Not a secret. Override per environment if needed.')
param leadCcEmails string = 'hartdental@gmail.com'

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    client: 'hart-family-dental'
    workload: 'hfd-website'
    isolation: 'dedicated'
  }
}

module site 'resources.bicep' = {
  name: 'hfd-website'
  scope: rg
  params: {
    location: location
    minReplicas: minReplicas
    maxReplicas: maxReplicas
    deployContainerApp: deployContainerApp
    containerImage: containerImage
    githubActionsPrincipalId: githubActionsPrincipalId
    purgeProtection: purgeProtection
    smtpHost: smtpHost
    smtpPort: smtpPort
    smtpFrom: smtpFrom
    resendFromEmail: resendFromEmail
    leadCcEmails: leadCcEmails
  }
}

output resourceGroupName string = rg.name
output acrName string = site.outputs.acrName
output acrLoginServer string = site.outputs.acrLoginServer
output vaultName string = site.outputs.vaultName
output identityClientId string = site.outputs.identityClientId
output identityPrincipalId string = site.outputs.identityPrincipalId
output containerAppName string = site.outputs.containerAppName
output containerAppFqdn string = site.outputs.containerAppFqdn
output secretNames array = site.outputs.secretNames
