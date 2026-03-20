// test/integration/beta-attributes-production.test.js
//
// Verifies that stat attributes which were previously beta-only are available
// on the production VRM API.
//
// When adding new beta attributes to BETA_ATTRIBUTES in vrm-api.js, add a
// corresponding FAILING test here (expect available to be false) so you get
// an automatic signal when they land on production.
//
// Run with: npm run test:integration

const VRMAPIService = require('../../src/services/vrm-api-service')

const PRODUCTION_BASE_URL = 'https://vrmapi.victronenergy.com/v2'

describe('Consumption sub-type attribute availability on production API', () => {
  const skipIfNoCredentials = () => {
    if (!global.testConfig.hasIntegrationCredentials()) {
      console.log('⚠️  Skipping - VRM API credentials not configured')
      return true
    }
    return false
  }

  it.each(['dhE', 'evE', 'daE'])('%s should be available on production', async (attribute) => {
    if (skipIfNoCredentials()) return

    const service = new VRMAPIService(process.env.VRM_API_TOKEN, { baseUrl: PRODUCTION_BASE_URL })
    const siteId = process.env.VRM_TEST_SITE_ID

    const now = Math.floor(Date.now() / 1000)
    const start = now - 86400
    const end = now

    const result = await service.callInstallationsAPI(siteId, 'stats', 'GET', null, {
      parameters: {
        type: 'custom',
        'attributeCodes[]': attribute,
        interval: 'hours',
        start,
        end
      }
    })

    expect(result.success).toBe(true)
    expect(result.data.totals[attribute]).not.toBe(false)
    console.log(`✅ ${attribute} is available on production (total: ${result.data.totals[attribute]})`)
  }, 30000)
})
