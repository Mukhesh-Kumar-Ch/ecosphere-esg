# Technical Requirements Document (TRD)

**Project:** EcoSphere

**Version:** 1.0

**Hackathon:** Odoo Hackathon 2026

---

# 1. Technical Overview

EcoSphere is a full-stack enterprise ESG Management Platform built using a modern client-server architecture.

The application follows a modular ERP design with independent business modules that communicate through REST APIs.

The architecture prioritizes:

- Maintainability
- Modularity
- Scalability
- Security
- Explainability
- Enterprise coding standards

---

# 2. Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod
- Recharts

---

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

---

## Database

PostgreSQL

---

## Authentication

JWT

Refresh Tokens

bcrypt password hashing

---

## File Storage

Local Storage

/uploads

(Hackathon only)

---

## Notifications

In-App Notification System

(No external email service required)

---

# 3. System Architecture

React Frontend

↓

REST API

↓

Express Server

↓

Service Layer

↓

Prisma ORM

↓

PostgreSQL

---

# 4. Architectural Principles

The project follows:

Feature-Based Architecture

Example:

src/

environment/

social/

governance/

gamification/

reports/

notifications/

auth/

Each module owns:

- UI
- API
- Validation
- Types
- Business Logic

---

Backend follows:

Controller

↓

Service

↓

Repository (Prisma)

↓

Database

Business logic must never exist inside controllers.

---

# 5. Frontend Structure

client/

src/

components/

pages/

layouts/

modules/

hooks/

services/

lib/

types/

contexts/

routes/

assets/

---

# 6. Backend Structure

server/

src/

config/

controllers/

services/

repositories/

middlewares/

routes/

modules/

utils/

validators/

prisma/

uploads/

---

# 7. Module Breakdown

Authentication

- Login
- JWT
- RBAC

Environmental

- Emission Factors
- Carbon Transactions
- Goals

Social

- CSR Activities
- Employee Participation

Governance

- Policies
- Audits
- Compliance Issues

Gamification

- Challenges
- XP
- Badges
- Rewards

Reports

Notifications

Administration

Impact Engine

---

# 8. Role Based Access Control

Administrator

Full Access

---

ESG Manager

Environmental

Reports

Department Scores

---

Compliance Officer

Policies

Audits

Compliance

---

HR / CSR Manager

CSR

Challenges

Rewards

Employee Participation

---

Employee

Participate

View Dashboard

Redeem Rewards

Policy Acknowledgement

---

# 9. API Design Principles

REST APIs

Resource-based URLs

Examples

/api/auth

/api/departments

/api/carbon

/api/csr

/api/challenges

/api/reports

/api/notifications

No RPC endpoints.

HTTP verbs must follow REST principles.

GET

POST

PUT

DELETE

PATCH where required.

---

# 10. Validation

Frontend

React Hook Form

+

Zod

Backend

Express Validation

+

Zod

Validation must exist on both frontend and backend.

Never trust client input.

---

# 11. Security

Passwords hashed using bcrypt.

JWT Authentication.

RBAC middleware.

Protected APIs.

Parameterized queries via Prisma.

Input validation.

Secure file upload validation.

No plaintext passwords.

---

# 12. Logging

Every critical operation should be logged.

Examples

Challenge Approved

CSR Approved

Compliance Closed

Reward Redeemed

Badge Awarded

Audit Created

---

# 13. Dashboard Design

Dashboard consists of:

Overall ESG Score

Department Scores

Environmental Summary

Social Summary

Governance Summary

Leaderboards

Notifications

Today's Actions (Impact Engine)

Upcoming Deadlines

Recent Activity

---

# 14. Impact Engine

Purpose

Recommend the highest-impact ESG actions.

Input

Pending approvals

Compliance issues

Department scores

Deadlines

Challenge progress

Carbon targets

Output

Prioritized recommendation list.

Each recommendation contains

Title

Priority

Reason

Department

Estimated ESG Gain

Status

The engine is rule-based.

No machine learning is required.

---

# 15. Error Handling

Global error middleware.

Standard response format.

Success

{
success: true,
data: {}
}

Failure

{
success: false,
message: "...",
errors: []
}

---

# 16. Performance

Pagination

Lazy loading

Server-side filtering

Indexed database fields

Optimized SQL queries

---

# 17. Coding Standards

TypeScript Strict Mode

ESLint

Prettier

Meaningful naming

Small reusable components

No duplicated logic

No inline business logic inside UI

No direct database access from controllers

---

# 18. Deployment

Frontend

Static hosting

Backend

Node.js hosting

Database

PostgreSQL

(Hackathon deployment)

---

# 19. Out of Scope

Machine Learning

External ERP Integrations

IoT Devices

Third-party ESG APIs

Multi-tenant Architecture

Mobile Applications

Microservices

Real-time WebSockets