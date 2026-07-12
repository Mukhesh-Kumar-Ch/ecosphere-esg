# Business Rules Document

**Project:** EcoSphere

**Version:** 1.0

**Purpose**

This document defines all business rules governing EcoSphere.

Business rules are mandatory and must always be enforced by the backend service layer.

Business logic must never be implemented in the frontend.

---

# 1. General Rules

## BR-001

Every authenticated user must belong to exactly one Department.

---

## BR-002

Every authenticated user must have exactly one Role.

---

## BR-003

Only authenticated users may access protected resources.

---

## BR-004

Soft-deleted records cannot be modified.

---

## BR-005

Historical records must never be permanently deleted.

---

## BR-006

Every create, update, approve, reject or redemption operation must generate an Activity Log.

---

## BR-007

All timestamps use UTC.

---

# 2. Authentication Rules

## BR-AUTH-001

Email addresses must be unique.

---

## BR-AUTH-002

Passwords must be stored using bcrypt.

---

## BR-AUTH-003

JWT tokens are required for protected APIs.

---

## BR-AUTH-004

Inactive users cannot log in.

---

## BR-AUTH-005

Role permissions are enforced on every protected endpoint.

---

# 3. Department Rules

## BR-DEPT-001

Department codes must be unique.

---

## BR-DEPT-002

Department Head must belong to the same department.

---

## BR-DEPT-003

Departments with employees cannot be deleted.

Use soft delete instead.

---

## BR-DEPT-004

Inactive departments cannot receive new employees.

---

# 4. Category Rules

## BR-CAT-001

Category names must be unique within their category type.

---

## BR-CAT-002

Inactive categories cannot be assigned.

---

# 5. Environmental Rules

## BR-ENV-001

Emission Factor must be positive.

---

## BR-ENV-002

Carbon Emission

=

Quantity × Emission Factor

---

## BR-ENV-003

Calculated emissions cannot be edited manually.

---

## BR-ENV-004

Environmental Goals belong to exactly one department.

---

## BR-ENV-005

Completed goals become read-only.

---

## BR-ENV-006

Carbon Transactions are immutable.

---

## BR-ENV-007

If AUTO_EMISSION is enabled,

Carbon Transactions are generated automatically.

---

# 6. CSR Rules

## BR-CSR-001

End Date must be greater than or equal to Start Date.

---

## BR-CSR-002

Archived CSR Activities cannot accept participants.

---

## BR-CSR-003

One employee may participate only once in the same CSR Activity.

---

## BR-CSR-004

Evidence is mandatory when EVIDENCE_REQUIRED is enabled.

---

## BR-CSR-005

Participation contributes to ESG calculations only after approval.

---

# 7. Challenge Rules

## BR-CH-001

Challenge XP Reward must be positive.

---

## BR-CH-002

Archived Challenges cannot receive new participants.

---

## BR-CH-003

Progress must remain between 0 and 100.

---

## BR-CH-004

One employee may participate only once in a Challenge.

---

## BR-CH-005

Challenge lifecycle

Draft

↓

Active

↓

Under Review

↓

Completed

OR

Archived

---

# 8. XP Rules

## BR-XP-001

XP is maintained only through XP Transactions.

---

## BR-XP-002

Current XP

=

SUM(all XP Transactions)

---

## BR-XP-003

XP Transactions are immutable.

---

## BR-XP-004

Positive values increase XP.

Negative values decrease XP.

---

## BR-XP-005

Manual XP edits are prohibited.

---

# 9. Badge Rules

## BR-BDG-001

Badge names must be unique.

---

## BR-BDG-002

Badges are awarded automatically when unlock rules are satisfied and BADGE_AUTO_AWARD is enabled.

---

## BR-BDG-003

Employees cannot receive the same badge twice.

---

# 10. Reward Rules

## BR-RWD-001

Reward stock cannot become negative.

---

## BR-RWD-002

Reward redemption requires sufficient XP.

---

## BR-RWD-003

Reward redemption decreases stock.

---

## BR-RWD-004

Reward redemption creates a negative XP Transaction.

---

## BR-RWD-005

Out-of-stock rewards cannot be redeemed.

---

# 11. Policy Rules

## BR-POL-001

Policy versions are immutable.

---

## BR-POL-002

One employee acknowledges one policy version only once.

---

## BR-POL-003

Acknowledgement reminders are sent automatically.

---

# 12. Audit Rules

## BR-AUD-001

Audit End Date must not precede Start Date.

---

## BR-AUD-002

Completed Audits become read-only.

---

## BR-AUD-003

Closed Audits cannot receive new Compliance Issues.

---

# 13. Compliance Rules

## BR-CMP-001

Every Compliance Issue requires an Owner.

---

## BR-CMP-002

Every Compliance Issue requires a Due Date.

---

## BR-CMP-003

Issues passing their Due Date while unresolved become OVERDUE.

---

## BR-CMP-004

Resolved issues become read-only.

---

## BR-CMP-005

Creating or updating a Compliance Issue generates a Notification.

---

# 14. Notification Rules

## BR-NOT-001

Notifications are generated automatically.

---

## BR-NOT-002

Notifications cannot be edited.

---

## BR-NOT-003

Users may mark notifications as read.

---

# 15. Reporting Rules

## BR-REP-001

Reports are generated from live transactional data.

---

## BR-REP-002

Department ESG Scores are calculated dynamically.

---

## BR-REP-003

Overall ESG Score uses configurable weightages.

Default

Environmental = 40%

Social = 30%

Governance = 30%

---

# 16. Administration Rules

## BR-ADM-001

Only Administrators may modify Settings.

---

## BR-ADM-002

Every Settings change generates an Activity Log.

---

## BR-ADM-003

Configuration changes take effect immediately.

---

# 17. Security Rules

## BR-SEC-001

Frontend validation is never trusted.

---

## BR-SEC-002

Every request must be validated on the backend.

---

## BR-SEC-003

RBAC is enforced by middleware.

---

## BR-SEC-004

Passwords are never returned by any API.

---

## BR-SEC-005

Business logic belongs exclusively in the Service Layer.