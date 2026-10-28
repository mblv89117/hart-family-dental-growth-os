@description('Hart Family Dental website only. No shared Container Apps environment, registry, or vault.')
param location string
param minReplicas int
param maxReplicas int
param deployContainerApp bool
param containerImage string
param githubActionsPrincipalId string
param purgeProtection bool
param smtpHost string
param smtpPort string
param smtpFrom string
param resendFromEmail string
param leadCcEmails string

var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var acrPushRoleId = '8311e382-0749-4cb8-b61a-304f252e45ec'
var containerAppsContributorRoleId = '358470bc-b998-42bd-ab17-a7e34c199c0f'
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'

// Names only. Values are created by an admin after the vault exists. Never commit values.
var secretNames = [
  'hfd-website-lead-webhook-secret'
  'resend-api-key'
  'smtp-user'
  'smtp-pass'
]

var suffix = uniqueString(resourceGroup().id)
var vaultName = 'kvhfd${suffix}'
var acrName = 'acrhfd${suffix}'

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-hfd-website'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-hfd-website'
  location: location
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: vaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enablePurgeProtection: purgeProtection
    publicNetworkAccess: 'Enabled'
  }
}

resource acrPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acr.id, identity.id, acrPullRoleId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource kvRead 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(kv.id, identity.id, keyVaultSecretsUserRoleId)
  scope: kv
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

resource githubAcrPush 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(githubActionsPrincipalId)) {
  name: guid(acr.id, githubActionsPrincipalId, acrPushRoleId)
  scope: acr
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPushRoleId)
    principalId: githubActionsPrincipalId
    principalType: 'ServicePrincipal'
  }
}

resource githubContainerApps 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(githubActionsPrincipalId)) {
  name: guid(resourceGroup().id, githubActionsPrincipalId, containerAppsContributorRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', containerAppsContributorRoleId)
    principalId: githubActionsPrincipalId
    principalType: 'ServicePrincipal'
  }
}

resource env 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-hfd-website'
  location: location
  properties: {
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
  }
}

resource app 'Microsoft.App/containerApps@2024-03-01' = if (deployContainerApp) {
  name: 'ca-hfd-website'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: env.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: identity.id
        }
      ]
      secrets: [for secretName in secretNames: {
        name: secretName
        keyVaultUrl: '${kv.properties.vaultUri}secrets/${secretName}'
        identity: identity.id
      }]
    }
    template: {
      containers: [
        {
          name: 'website'
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            { name: 'HOSTNAME', value: '0.0.0.0' }
            { name: 'PORT', value: '3000' }
            { name: 'HFD_ENABLE_HSTS', value: 'true' }
            { name: 'GROWTH_OS_PLATFORM_ENABLED', value: 'false' }
            { name: 'OPS_ENABLED', value: 'false' }
            { name: 'NEXT_PUBLIC_SITE_URL', value: 'https://hfdds.net' }
            { name: 'LEAD_CC_EMAILS', value: leadCcEmails }
            { name: 'SMTP_HOST', value: smtpHost }
            { name: 'SMTP_PORT', value: smtpPort }
            { name: 'SMTP_FROM', value: smtpFrom }
            { name: 'RESEND_FROM_EMAIL', value: resendFromEmail }
            { name: 'HFD_WEBSITE_LEAD_WEBHOOK_SECRET', secretRef: 'hfd-website-lead-webhook-secret' }
            { name: 'RESEND_API_KEY', secretRef: 'resend-api-key' }
            { name: 'SMTP_USER', secretRef: 'smtp-user' }
            { name: 'SMTP_PASS', secretRef: 'smtp-pass' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 3000
              }
              initialDelaySeconds: 15
              periodSeconds: 30
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    acrPull
    kvRead
  ]
}

output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
output vaultName string = kv.name
output identityClientId string = identity.properties.clientId
output identityPrincipalId string = identity.properties.principalId
output containerAppName string = app.?name ?? 'ca-hfd-website'
output containerAppFqdn string = app.?properties.configuration.ingress.fqdn ?? ''
output secretNames array = secretNames
