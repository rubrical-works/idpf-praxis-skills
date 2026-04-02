# Contract Testing Domain Module

**Source:** `Domains/Contract-Testing/`
**Tools:** Pact, Pact Broker
**Approach:** Consumer-driven contract testing

## Required Packages

```
@pact-foundation/pact
@pact-foundation/pact-node
wait-on
```

## Generated Artifacts

### Artifact 1: `tests/contract/consumer.spec.ts`

Consumer-side contract test that defines expected provider interactions and generates a Pact file.

```typescript
// tests/contract/consumer.spec.ts
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';

const { like, eachLike, string, integer } = MatchersV3;

const provider = new PactV4({
  consumer: '{{CONSUMER_NAME}}',
  provider: '{{PROVIDER_NAME}}',
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
});

describe('{{PROVIDER_NAME}} Contract', () => {
  describe('GET /api/items', () => {
    it('returns a list of items', async () => {
      await provider
        .addInteraction()
        .given('items exist')
        .uponReceiving('a request for all items')
        .withRequest('GET', '/api/items')
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(
            eachLike({
              id: integer(1),
              name: string('Item A'),
              status: string('active'),
            })
          );
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/items`);
          const body = await response.json();

          expect(response.status).toBe(200);
          expect(body).toHaveLength(1);
          expect(body[0]).toHaveProperty('id');
          expect(body[0]).toHaveProperty('name');
        });
    });
  });

  describe('GET /api/items/:id', () => {
    it('returns a single item', async () => {
      await provider
        .addInteraction()
        .given('item with id 1 exists')
        .uponReceiving('a request for item 1')
        .withRequest('GET', '/api/items/1')
        .willRespondWith(200, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(
            like({
              id: integer(1),
              name: string('Item A'),
              status: string('active'),
              createdAt: string('2024-01-01T00:00:00Z'),
            })
          );
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/items/1`);
          const body = await response.json();

          expect(response.status).toBe(200);
          expect(body.id).toBe(1);
        });
    });

    it('returns 404 for missing item', async () => {
      await provider
        .addInteraction()
        .given('item with id 999 does not exist')
        .uponReceiving('a request for non-existent item')
        .withRequest('GET', '/api/items/999')
        .willRespondWith(404, (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(
            like({
              error: string('Not Found'),
              message: string('Item not found'),
            })
          );
        })
        .executeTest(async (mockServer) => {
          const response = await fetch(`${mockServer.url}/api/items/999`);
          expect(response.status).toBe(404);
        });
    });
  });
});
```

### Artifact 2: `tests/contract/provider.spec.ts`

Provider-side verification test that fetches contracts from the broker and verifies the real provider satisfies them.

```typescript
// tests/contract/provider.spec.ts
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Provider Verification', () => {
  const providerBaseUrl = process.env.PROVIDER_BASE_URL || 'http://localhost:3000';
  const pactBrokerUrl = process.env.PACT_BROKER_URL;
  const pactBrokerToken = process.env.PACT_BROKER_TOKEN;

  it('validates contracts from broker', async () => {
    const verifierOptions: any = {
      provider: '{{PROVIDER_NAME}}',
      providerBaseUrl,
      providerVersion: process.env.PACT_PROVIDER_VERSION || '0.0.0',
      publishVerificationResult: process.env.CI === 'true',
      stateHandlers: {
        'items exist': async () => {
          // Seed test data: ensure items exist in the database or test fixture
          console.log('Setting up state: items exist');
        },
        'item with id 1 exists': async () => {
          // Seed test data: ensure item with id 1 exists
          console.log('Setting up state: item with id 1 exists');
        },
        'item with id 999 does not exist': async () => {
          // Ensure item 999 does not exist
          console.log('Setting up state: item 999 does not exist');
        },
      },
    };

    // Use broker if configured, otherwise use local pact files
    if (pactBrokerUrl) {
      verifierOptions.pactBrokerUrl = pactBrokerUrl;
      verifierOptions.pactBrokerToken = pactBrokerToken;
      verifierOptions.consumerVersionSelectors = [
        { mainBranch: true },
        { deployedOrReleased: true },
      ];
      verifierOptions.enablePending = true;
    } else {
      verifierOptions.pactUrls = [
        path.resolve(process.cwd(), 'pacts'),
      ];
    }

    const verifier = new Verifier(verifierOptions);
    await verifier.verifyProvider();
  });
});
```

### Artifact 3: `pact-config.json`

Centralized Pact configuration for both consumer and provider workflows.

```json
{
  "consumer": {
    "name": "{{CONSUMER_NAME}}",
    "pactDir": "./pacts",
    "logLevel": "warn"
  },
  "provider": {
    "name": "{{PROVIDER_NAME}}",
    "baseUrl": "http://localhost:3000"
  },
  "broker": {
    "url": "${PACT_BROKER_URL}",
    "token": "${PACT_BROKER_TOKEN}"
  },
  "publishOptions": {
    "consumerVersion": "${GIT_SHA}",
    "branch": "${GIT_BRANCH}",
    "tags": []
  },
  "verifierOptions": {
    "enablePending": true,
    "consumerVersionSelectors": [
      { "mainBranch": true },
      { "deployedOrReleased": true }
    ]
  }
}
```

### CI Job: `contract-consumer`

```yaml
contract-consumer:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Run consumer contract tests
      run: npx jest tests/contract/consumer.spec.ts --forceExit

    - name: Publish pacts to broker
      if: github.ref == 'refs/heads/main'
      run: |
        npx pact-broker publish ./pacts \
          --broker-base-url=${{ secrets.PACT_BROKER_URL }} \
          --broker-token=${{ secrets.PACT_BROKER_TOKEN }} \
          --consumer-app-version=${{ github.sha }} \
          --branch=${{ github.ref_name }}

    - name: Can-I-Deploy check
      if: github.ref == 'refs/heads/main'
      run: |
        npx pact-broker can-i-deploy \
          --broker-base-url=${{ secrets.PACT_BROKER_URL }} \
          --broker-token=${{ secrets.PACT_BROKER_TOKEN }} \
          --pacticipant={{CONSUMER_NAME}} \
          --version=${{ github.sha }} \
          --to-environment=production
```

### CI Job: `contract-provider`

```yaml
contract-provider:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install dependencies
      run: {{INSTALL_CMD}}

    - name: Start provider
      run: npm run start:test &

    - name: Wait for provider
      run: npx wait-on http://localhost:3000/health --timeout 30000

    - name: Verify provider contracts
      run: npx jest tests/contract/provider.spec.ts --forceExit
      env:
        PACT_BROKER_URL: ${{ secrets.PACT_BROKER_URL }}
        PACT_BROKER_TOKEN: ${{ secrets.PACT_BROKER_TOKEN }}
        PACT_PROVIDER_VERSION: ${{ github.sha }}
        CI: true

    - name: Can-I-Deploy check
      if: github.ref == 'refs/heads/main'
      run: |
        npx pact-broker can-i-deploy \
          --broker-base-url=${{ secrets.PACT_BROKER_URL }} \
          --broker-token=${{ secrets.PACT_BROKER_TOKEN }} \
          --pacticipant={{PROVIDER_NAME}} \
          --version=${{ github.sha }} \
          --to-environment=production
```

## Manual Testing Areas

Contract testing automates interface validation but cannot cover everything:

- **Provider state complexity** -- Designing realistic provider state handlers that accurately model production data conditions
- **Breaking change coordination** -- When a consumer needs a contract change that breaks the provider, manual cross-team coordination is required
- **Pact Broker administration** -- Setting up webhooks, environments, and deployment tracking in the broker
- **Pending pact triage** -- Reviewing new contracts marked as "pending" and deciding whether to support them
- **Semantic correctness** -- Contracts validate shape and types, not whether the actual business logic is correct
- **Authentication flows** -- Token refresh, OAuth flows, and session management in contract tests require manual setup
- **Versioning strategy decisions** -- Choosing between Git SHA, semantic versioning, or branch-based versioning for contract participants
- **Can-I-Deploy interpretation** -- Understanding deployment matrix results when multiple consumers and providers interact

**Breaking Change Process (from framework):**

1. Consumer publishes new contract with breaking change
2. Provider verification fails
3. Teams coordinate on change
4. Provider implements change
5. Provider verification passes
6. Both services deploy
