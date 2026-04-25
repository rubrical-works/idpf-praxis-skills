# postgresql-integration Rationale

Preserved prose from the original SKILL.md. SKILL.md retains its detailed teaching content; this file captures the volatile-knob extraction decisions.

## Per-language client libraries

The config splits Node and Python into separate `clientLibraries.<language>` blocks because the choice of driver and ORM is language-specific. Within each, `primary` is the recommended default; `alternatives` and `orms` are documented but not foregrounded. Adding Go, Rust, or other languages is a JSON edit.

## Why `psycopg2-binary` for Python primary

`psycopg2` requires libpq build dependencies; `psycopg2-binary` ships compiled wheels and works in most environments without sudo apt-get. The skill recommends `-binary` for setup ease and notes that production deployments may want the source-built variant for better compatibility with newer libpq.

## SSL mode list

The full set of PostgreSQL SSL modes is recorded so the skill can answer questions accurately. `productionRecommended: "verify-full"` is the strongest mode but requires a CA cert; the skill should suggest `require` as the minimum production baseline when verify-full is impractical.

## Default port and env var

`5432` and `DATABASE_URL` are PostgreSQL conventions. The env-var name in particular is widely standardized — Heroku, Render, Railway, App Platform all inject `DATABASE_URL`. The skill never invents a different name.

## pgbouncer

Recorded under `pooling.pgbouncer` because external pooling is a common production pattern, and the conventional env var (`PGBOUNCER_URL`) is the contract platforms emit when they expose pooler URLs alongside the direct DB URL.

## ORMs are documented, not opinionated

The skill lists Prisma/Sequelize/TypeORM (Node) and SQLAlchemy/Django (Python) without picking favorites. ORM choice is a project decision. The config records install commands so the skill can scaffold whichever the user picks.
