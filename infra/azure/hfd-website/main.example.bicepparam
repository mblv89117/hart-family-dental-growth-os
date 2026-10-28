using './main.bicep'

param resourceGroupName = 'rg-hfd-website'
param location = 'westus3'
// Production SEO default. Set 0 only for a validation environment that can tolerate cold starts.
param minReplicas = 1
param maxReplicas = 3
param deployContainerApp = false
param containerImage = ''
// Entra object id of the GitHub Actions OIDC app. Leave empty on the first apply.
param githubActionsPrincipalId = ''
param purgeProtection = false
param smtpHost = ''
param smtpPort = '587'
param smtpFrom = ''
param resendFromEmail = ''
param leadCcEmails = 'hartdental@gmail.com'
