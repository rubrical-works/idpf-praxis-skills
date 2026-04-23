# Tech Stack Detection Guide
**Version:** v0.13.1
**Purpose:** Patterns for detecting technology stacks from codebase analysis
## Language Detection
### By File Extension
| Extension | Language | Confidence |
|-----------|----------|------------|
| `.py` | Python | High |
| `.js`, `.mjs`, `.cjs` | JavaScript | High |
| `.ts`, `.tsx` | TypeScript | High |
| `.go` | Go | High |
| `.rs` | Rust | High |
| `.java` | Java | High |
| `.cs` | C# | High |
| `.rb` | Ruby | High |
| `.php` | PHP | High |
| `.swift` | Swift | High |
| `.kt`, `.kts` | Kotlin | High |
| `.scala` | Scala | High |
| `.ex`, `.exs` | Elixir | High |
| `.clj` | Clojure | High |
### By Package Manager File
| File | Language/Runtime | Example Content |
|------|------------------|-----------------|
| `package.json` | Node.js | `{"name": "project"}` |
| `requirements.txt` | Python | `flask==2.0` |
| `pyproject.toml` | Python (modern) | `[tool.poetry]` |
| `go.mod` | Go | `module example.com/project` |
| `Cargo.toml` | Rust | `[package]` |
| `Gemfile` | Ruby | `source 'rubygems'` |
| `pom.xml` | Java (Maven) | `<project>` |
| `build.gradle` | Java/Kotlin (Gradle) | `plugins { }` |
| `composer.json` | PHP | `{"require": {}}` |
| `Package.swift` | Swift | `Package(name:` |
| `*.csproj` | .NET | `<Project Sdk=` |
## Framework Detection
### Python Frameworks
| Dependency | Framework | Type |
|------------|-----------|------|
| `flask` | Flask | Web micro-framework |
| `django` | Django | Full-stack web |
| `fastapi` | FastAPI | Async API |
| `tornado` | Tornado | Async web |
| `pyramid` | Pyramid | Web |
| `celery` | Celery | Task queue |
| `pytest` | pytest | Testing |
| `sqlalchemy` | SQLAlchemy | ORM |
### JavaScript/TypeScript Frameworks
| Dependency | Framework | Type |
|------------|-----------|------|
| `express` | Express.js | Web server |
| `fastify` | Fastify | Web server |
| `koa` | Koa | Web server |
| `next` | Next.js | React framework |
| `nuxt` | Nuxt.js | Vue framework |
| `react` | React | Frontend |
| `vue` | Vue.js | Frontend |
| `angular` | Angular | Frontend |
| `svelte` | Svelte | Frontend |
| `nest` | NestJS | Backend |
### Go Frameworks
| Import Path | Framework | Type |
|-------------|-----------|------|
| `github.com/gin-gonic/gin` | Gin | Web |
| `github.com/labstack/echo` | Echo | Web |
| `github.com/gofiber/fiber` | Fiber | Web |
| `github.com/gorilla/mux` | Gorilla Mux | Router |
| `gorm.io/gorm` | GORM | ORM |
### Ruby Frameworks
| Gem | Framework | Type |
|-----|-----------|------|
| `rails` | Ruby on Rails | Full-stack |
| `sinatra` | Sinatra | Micro-framework |
| `hanami` | Hanami | Web |
| `rspec` | RSpec | Testing |
| `activerecord` | ActiveRecord | ORM |
### Java Frameworks
| Dependency | Framework | Type |
|------------|-----------|------|
| `spring-boot` | Spring Boot | Application framework |
| `spring-web` | Spring MVC | Web |
| `hibernate` | Hibernate | ORM |
| `micronaut` | Micronaut | Microservices |
| `quarkus` | Quarkus | Cloud-native |
### .NET Frameworks
| Package | Framework | Type |
|---------|-----------|------|
| `Microsoft.AspNetCore` | ASP.NET Core | Web |
| `Microsoft.EntityFrameworkCore` | EF Core | ORM |
| `xunit` | xUnit | Testing |
| `NUnit` | NUnit | Testing |
## Database Detection
### From Dependencies
| Dependency/Package | Database | Type |
|--------------------|----------|------|
| `pg`, `psycopg2`, `postgresql` | PostgreSQL | Relational |
| `mysql2`, `pymysql`, `mysql-connector` | MySQL | Relational |
| `sqlite3` | SQLite | Embedded |
| `mongodb`, `pymongo` | MongoDB | Document |
| `redis`, `ioredis` | Redis | Key-Value |
| `cassandra-driver` | Cassandra | Wide-column |
| `neo4j` | Neo4j | Graph |
| `elasticsearch` | Elasticsearch | Search |
### From Configuration Files
| Pattern | Database |
|---------|----------|
| `DATABASE_URL=postgres://` | PostgreSQL |
| `MONGO_URI=mongodb://` | MongoDB |
| `REDIS_URL=redis://` | Redis |
| Connection string in `.env` | Various |
## Infrastructure Detection
### From Dockerfile
| Base Image Pattern | Infers |
|--------------------|--------|
| `FROM node:` | Node.js runtime |
| `FROM python:` | Python runtime |
| `FROM golang:` | Go runtime |
| `FROM nginx:` | Web server/reverse proxy |
| `FROM postgres:` | PostgreSQL database |
### From docker-compose.yml
| Service Pattern | Infers |
|-----------------|--------|
| `image: postgres` | PostgreSQL service |
| `image: redis` | Redis service |
| `image: nginx` | Nginx service |
| `build: ./api` | Custom API service |
### From CI/CD Files
| File | Platform |
|------|----------|
| `.github/workflows/*.yml` | GitHub Actions |
| `.gitlab-ci.yml` | GitLab CI |
| `Jenkinsfile` | Jenkins |
| `.circleci/config.yml` | CircleCI |
| `azure-pipelines.yml` | Azure DevOps |
| `bitbucket-pipelines.yml` | Bitbucket Pipelines |
## Output Format
```markdown
## Tech Stack Summary
**Language(s):**
- Python 3.x (High confidence) - `*.py` files, `requirements.txt`
**Framework(s):**
- Flask 2.0 (High confidence) - `requirements.txt: flask==2.0`
- SQLAlchemy (High confidence) - `requirements.txt: sqlalchemy`
**Database(s):**
- PostgreSQL (High confidence) - `requirements.txt: psycopg2`, `DATABASE_URL`
**Infrastructure:**
- Docker (High confidence) - `Dockerfile` present
- GitHub Actions (High confidence) - `.github/workflows/` present
**Testing:**
- pytest (High confidence) - `requirements.txt: pytest`, `test_*.py` files
```
