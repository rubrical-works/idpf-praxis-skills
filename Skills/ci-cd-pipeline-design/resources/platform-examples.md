# Platform-Specific Examples
**Version:** v0.4.0

Complete CI/CD pipeline configurations for major platforms.

## GitHub Actions

### Complete Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Build Stage
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Generate version
        id: version
        run: echo "version=$(date +%Y%m%d)-${{ github.sha }}" >> $GITHUB_OUTPUT

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ steps.version.outputs.version }}
          path: dist/
          retention-days: 7

  # Test Stage
  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-type: [unit, integration]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:${{ matrix.test-type }}

      - name: Upload coverage
        if: matrix.test-type == 'unit'
        uses: codecov/codecov-action@v3

  # Security Stage
  security:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run SAST
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript

      - name: Dependency scan
        run: npm audit --audit-level=high

      - name: Secret scan
        uses: gitleaks/gitleaks-action@v2

  # Build Container
  docker:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Scan container
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  # Deploy Staging
  deploy-staging:
    needs: docker
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}"
          # kubectl set image deployment/app app=$IMAGE:$TAG

      - name: Smoke tests
        run: |
          curl -f https://staging.example.com/health || exit 1

  # Deploy Production
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production"
          # kubectl set image deployment/app app=$IMAGE:$TAG

      - name: Verify deployment
        run: |
          curl -f https://api.example.com/health || exit 1
```

## GitLab CI

### Complete Pipeline

```yaml
stages:
  - build
  - test
  - security
  - package
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

# Build Stage
build:
  stage: build
  image: node:20
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# Test Stage
unit-tests:
  stage: test
  image: node:20
  needs: [build]
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/Lines\s*:\s*(\d+.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

integration-tests:
  stage: test
  image: node:20
  needs: [build]
  services:
    - postgres:14
  variables:
    POSTGRES_DB: test
    DATABASE_URL: postgresql://postgres:postgres@postgres/test
  script:
    - npm ci
    - npm run test:integration

# Security Stage
sast:
  stage: security
  needs: [build]

dependency_scanning:
  stage: security
  needs: [build]

secret_detection:
  stage: security
  needs: [build]

# Package Stage
docker-build:
  stage: package
  image: docker:latest
  services:
    - docker:dind
  needs: [unit-tests, integration-tests, sast]
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE

container_scanning:
  stage: package
  needs: [docker-build]
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# Deploy Stage
deploy-staging:
  stage: deploy
  image: alpine/k8s:1.28.0
  needs: [docker-build, container_scanning]
  environment:
    name: staging
    url: https://staging.example.com
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - kubectl set image deployment/app app=$DOCKER_IMAGE
    - kubectl rollout status deployment/app

deploy-production:
  stage: deploy
  image: alpine/k8s:1.28.0
  needs: [deploy-staging]
  environment:
    name: production
    url: https://example.com
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
  script:
    - kubectl set image deployment/app app=$DOCKER_IMAGE
    - kubectl rollout status deployment/app
```

## Jenkins (Declarative)

### Complete Pipeline

```groovy
pipeline {
    agent any

    environment {
        REGISTRY = 'registry.example.com'
        IMAGE_NAME = 'myapp'
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit -- --coverage'
                    }
                    post {
                        always {
                            junit 'reports/junit.xml'
                            publishCoverage adapters: [coberturaAdapter('coverage/cobertura-coverage.xml')]
                        }
                    }
                }
                stage('Integration Tests') {
                    steps {
                        sh 'npm run test:integration'
                    }
                }
            }
        }

        stage('Security') {
            parallel {
                stage('SAST') {
                    steps {
                        sh 'semgrep --config=auto src/'
                    }
                }
                stage('Dependency Scan') {
                    steps {
                        sh 'npm audit --audit-level=high'
                    }
                }
            }
        }

        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${REGISTRY}", 'registry-credentials') {
                        def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Container Scan') {
            when {
                branch 'main'
            }
            steps {
                sh "trivy image ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy Staging') {
            when {
                branch 'main'
            }
            environment {
                KUBECONFIG = credentials('kubeconfig-staging')
            }
            steps {
                sh "kubectl set image deployment/app app=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh 'kubectl rollout status deployment/app'
            }
        }

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to production?'
                ok 'Deploy'
            }
            environment {
                KUBECONFIG = credentials('kubeconfig-production')
            }
            steps {
                sh "kubectl set image deployment/app app=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                sh 'kubectl rollout status deployment/app'
            }
        }
    }

    post {
        failure {
            slackSend channel: '#deployments',
                      color: 'danger',
                      message: "Pipeline failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        success {
            slackSend channel: '#deployments',
                      color: 'good',
                      message: "Pipeline succeeded: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
    }
}
```

## Azure DevOps

### Complete Pipeline

```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

variables:
  - group: app-settings
  - name: imageRepository
    value: 'myapp'
  - name: containerRegistry
    value: 'myregistry.azurecr.io'

stages:
  - stage: Build
    jobs:
      - job: Build
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'

          - script: npm ci
            displayName: 'Install dependencies'

          - script: npm run build
            displayName: 'Build'

          - publish: dist
            artifact: build

  - stage: Test
    dependsOn: Build
    jobs:
      - job: UnitTests
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'

          - script: npm ci && npm test -- --coverage
            displayName: 'Run tests'

          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'reports/junit.xml'

          - task: PublishCodeCoverageResults@1
            inputs:
              codeCoverageTool: 'Cobertura'
              summaryFileLocation: 'coverage/cobertura-coverage.xml'

  - stage: Security
    dependsOn: Build
    jobs:
      - job: SecurityScan
        steps:
          - task: WhiteSource@21
            inputs:
              cwd: '$(System.DefaultWorkingDirectory)'

  - stage: Docker
    dependsOn:
      - Test
      - Security
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - job: BuildPush
        steps:
          - task: Docker@2
            inputs:
              containerRegistry: 'acr-connection'
              repository: $(imageRepository)
              command: 'buildAndPush'
              tags: |
                $(Build.BuildId)
                latest

  - stage: DeployStaging
    dependsOn: Docker
    condition: succeeded()
    jobs:
      - deployment: DeployStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: KubernetesManifest@0
                  inputs:
                    action: 'deploy'
                    kubernetesServiceConnection: 'k8s-staging'
                    manifests: 'manifests/staging.yaml'

  - stage: DeployProduction
    dependsOn: DeployStaging
    condition: succeeded()
    jobs:
      - deployment: DeployProduction
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: KubernetesManifest@0
                  inputs:
                    action: 'deploy'
                    kubernetesServiceConnection: 'k8s-production'
                    manifests: 'manifests/production.yaml'
```

---

**See SKILL.md for complete CI/CD pipeline guidance**
