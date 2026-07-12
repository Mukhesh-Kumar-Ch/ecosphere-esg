# REST API Specification

**Project:** EcoSphere

**Version:** 1.0

**Architecture:** REST

**Authentication:** JWT

**Response Format:** JSON

---

# API Standards

Base URL

/api/v1

---

Authentication

Authorization

Bearer JWT_TOKEN

---

Content Type

application/json

---

Success Response

HTTP 200

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

Validation Error

HTTP 400

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

---

Unauthorized

401

---

Forbidden

403

---

Not Found

404

---

Internal Error

500

---

# Authentication

POST

/api/v1/auth/login

POST

/api/v1/auth/logout

GET

/api/v1/auth/me

POST

/api/v1/auth/refresh

---

# Dashboard

GET

/api/v1/dashboard

Returns

Overall ESG Score

Dashboard KPIs

Charts

Priority Actions

Recent Notifications

---

# Departments

GET

/api/v1/departments

GET

/api/v1/departments/:id

POST

/api/v1/departments

PUT

/api/v1/departments/:id

DELETE

/api/v1/departments/:id

---

# Categories

GET

/api/v1/categories

POST

/api/v1/categories

PUT

/api/v1/categories/:id

DELETE

/api/v1/categories/:id

---

# Settings

GET

/api/v1/settings

PATCH

/api/v1/settings

---

# Users

GET

/api/v1/users

GET

/api/v1/users/:id

POST

/api/v1/users

PUT

/api/v1/users/:id

DELETE

/api/v1/users/:id

---

# Emission Factors

GET

/api/v1/emission-factors

GET

/api/v1/emission-factors/:id

POST

/api/v1/emission-factors

PUT

/api/v1/emission-factors/:id

DELETE

/api/v1/emission-factors/:id

---

# Environmental Goals

GET

/api/v1/environmental-goals

POST

/api/v1/environmental-goals

PUT

/api/v1/environmental-goals/:id

DELETE

/api/v1/environmental-goals/:id

---

# Carbon Transactions

GET

/api/v1/carbon-transactions

GET

/api/v1/carbon-transactions/:id

POST

/api/v1/carbon-transactions

---

# CSR Activities

GET

/api/v1/csr-activities

GET

/api/v1/csr-activities/:id

POST

/api/v1/csr-activities

PUT

/api/v1/csr-activities/:id

DELETE

/api/v1/csr-activities/:id

---

# Employee Participation

GET

/api/v1/employee-participation

POST

/api/v1/employee-participation

PATCH

/api/v1/employee-participation/:id/approve

PATCH

/api/v1/employee-participation/:id/reject

---

# Challenges

GET

/api/v1/challenges

GET

/api/v1/challenges/:id

POST

/api/v1/challenges

PUT

/api/v1/challenges/:id

DELETE

/api/v1/challenges/:id

---

# Challenge Participation

GET

/api/v1/challenge-participation

POST

/api/v1/challenge-participation

PATCH

/api/v1/challenge-participation/:id/approve

PATCH

/api/v1/challenge-participation/:id/reject

PATCH

/api/v1/challenge-participation/:id/progress

---

# Rewards

GET

/api/v1/rewards

GET

/api/v1/rewards/:id

POST

/api/v1/rewards

PUT

/api/v1/rewards/:id

DELETE

/api/v1/rewards/:id

---

# Reward Redemption

POST

/api/v1/reward-redemptions

GET

/api/v1/reward-redemptions

---

# Badges

GET

/api/v1/badges

GET

/api/v1/user-badges

---

# XP

GET

/api/v1/xp-transactions

GET

/api/v1/leaderboard

---

# Policies

GET

/api/v1/policies

GET

/api/v1/policies/:id

POST

/api/v1/policies

PUT

/api/v1/policies/:id

DELETE

/api/v1/policies/:id

---

# Policy Acknowledgement

POST

/api/v1/policy-acknowledgements

GET

/api/v1/policy-acknowledgements

---

# Audits

GET

/api/v1/audits

GET

/api/v1/audits/:id

POST

/api/v1/audits

PUT

/api/v1/audits/:id

DELETE

/api/v1/audits/:id

---

# Compliance Issues

GET

/api/v1/compliance-issues

GET

/api/v1/compliance-issues/:id

POST

/api/v1/compliance-issues

PUT

/api/v1/compliance-issues/:id

PATCH

/api/v1/compliance-issues/:id/resolve

---

# Notifications

GET

/api/v1/notifications

PATCH

/api/v1/notifications/:id/read

PATCH

/api/v1/notifications/read-all

---

# Reports

GET

/api/v1/reports/environment

GET

/api/v1/reports/social

GET

/api/v1/reports/governance

GET

/api/v1/reports/esg-summary

POST

/api/v1/reports/custom

---

# Activity Logs

GET

/api/v1/activity-logs

---

# Search

GET

/api/v1/search?q=

Returns

Departments

Users

CSR

Challenges

Policies

Audits

Compliance Issues

Rewards

---

# File Upload

POST

/api/v1/upload

Purpose

Evidence Upload

CSR Proof

Challenge Proof

Policy Documents

---

# Health

GET

/api/v1/health

Returns

Server Status

Database Status

Version