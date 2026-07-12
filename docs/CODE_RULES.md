# Copilot Development Rules

These rules must always be followed while generating code.

Violation of these rules should be considered a bug.

---

# Architecture

Follow Feature-Based Architecture.

Never use Layer-Based Architecture.

---

# Backend

Business logic belongs only inside Services.

Controllers must stay thin.

Repositories only access Prisma.

Never access Prisma directly from Controllers.

---

# Frontend

Business logic must never exist inside React Components.

Components should remain presentational whenever possible.

Move logic into hooks or services.

---

# Validation

Validate every request using Zod.

Never trust frontend validation.

---

# Database

Never duplicate data.

Use relations.

Prefer JOINs over duplicate fields.

Never store calculated values.

---

# Authentication

Always verify JWT.

Always verify Role.

Never expose password hashes.

---

# Error Handling

Every endpoint returns a consistent JSON response.

Never throw raw errors to clients.

Use centralized error middleware.

---

# API

Follow REST conventions.

Use meaningful HTTP status codes.

---

# UI

Reuse components.

Never duplicate forms.

Prefer Drawers over separate edit pages.

Always provide Loading, Empty and Error states.

---

# Code Quality

Use TypeScript Strict Mode.

Avoid 'any'.

Prefer interfaces over loose objects.

Use meaningful names.

Keep functions under 40 lines when practical.

---

# Performance

Use pagination.

Use filtering.

Avoid unnecessary database queries.

Select only required fields.

---

# Security

Hash passwords using bcrypt.

Validate uploads.

Sanitize input.

Protect every private route.

---

# Logging

Every important operation creates an Activity Log.

---

# Notifications

Generate notifications from backend services.

Never from frontend.

---

# Testing

Test business rules before UI.

---

# Documentation

Document exported functions.

Document complex business logic.

---

# Final Rule

When multiple implementation approaches are possible,

prefer the solution that

- reduces code duplication,
- improves maintainability,
- follows the existing project architecture,
- and complies with the Business Rules document.