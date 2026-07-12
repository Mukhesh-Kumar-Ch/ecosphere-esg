# Database Design Document

**Project:** EcoSphere

**Version:** 1.0

**Database:** PostgreSQL 16+

**ORM:** Prisma ORM

**Author:** Team EcoSphere

---

# 1. Introduction

This document defines the logical and relational database design for EcoSphere.

The database is designed using Third Normal Form (3NF) principles to eliminate redundancy, maintain referential integrity, and support enterprise-grade ESG workflows.

The schema is intentionally modular to align with the application's architecture and the Odoo Hackathon problem statement.

---

# 2. Design Goals

The database must satisfy the following goals.

- Fully normalized (3NF)
- PostgreSQL optimized
- Suitable for Prisma ORM
- High referential integrity
- Minimal data duplication
- Easy reporting
- Easy future expansion
- Audit-friendly
- Modular domain design

---

# 3. Normalization Strategy

The database follows the following normalization rules.

## First Normal Form (1NF)

- Every column contains atomic values.
- No repeating groups.
- Every record is uniquely identifiable.

---

## Second Normal Form (2NF)

- Every non-key attribute depends entirely on the primary key.
- No partial dependencies.

---

## Third Normal Form (3NF)

- No transitive dependencies.
- Lookup values are extracted into master tables.
- Computed values are not stored unless necessary.

---

# 4. Naming Convention

## Tables

Plural snake_case

Examples

users

departments

carbon_transactions

reward_redemptions

---

## Columns

snake_case

Examples

department_id

created_at

updated_at

password_hash

---

## Primary Keys

Every table uses

id UUID PRIMARY KEY

---

## Foreign Keys

Referenced table name

Examples

department_id

user_id

challenge_id

reward_id

---

# 5. UUID Strategy

Every entity uses UUID Version 4.

Reasons

- Globally unique
- Better for distributed systems
- Safer than auto increment IDs
- Easier future synchronization

Example

```
550e8400-e29b-41d4-a716-446655440000
```

---

# 6. Timestamp Policy

Every transactional table contains

created_at

updated_at

Whenever applicable

deleted_at (Soft Delete)

Example

```
created_at

updated_at

deleted_at
```

---

# 7. Soft Delete Policy

Historical ESG data must never be permanently removed.

Instead of deleting,

records should be marked inactive.

Tables using soft delete

Users

Departments

Policies

Challenges

Rewards

Badges

CSR Activities

Compliance Issues

This preserves reporting accuracy.

---

# 8. Master Data vs Transaction Data

Master Data changes rarely.

Transaction Data grows continuously.

---

## Master Data

Roles

Departments

Users

Categories

Emission Factors

Environmental Goals

Policies

Badges

Rewards

---

## Transaction Data

Carbon Transactions

CSR Activities

Employee Participation

Challenges

Challenge Participation

Policy Acknowledgements

Audits

Compliance Issues

Reward Redemptions

Notifications

Activity Logs

---

# 9. Domain Driven Organization

The database is divided into six logical domains.

Authentication Domain

Organization Domain

Environmental Domain

Social Domain

Governance Domain

Shared Domain

This allows backend modules to remain independent.

---

# 10. Authentication Domain

---

## Table: roles

### Purpose

Stores application roles.

This table controls authorization across the platform.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE |
| description | TEXT | NULL |

### Relationships

One Role

↓

Many Users

### Sample Values

Admin

ESG Manager

Compliance Officer

HR Manager

Employee

---

## Table: users

### Purpose

Stores all authenticated users.

Every user belongs to exactly one department and exactly one role.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| department_id | UUID | FK |
| role_id | UUID | FK |
| name | VARCHAR(120) | NOT NULL |
| email | VARCHAR(255) | UNIQUE |
| password_hash | TEXT | NOT NULL |
| status | UserStatus | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

### Relationships

Many Users

↓

One Department

Many Users

↓

One Role

One User

↓

Many Notifications

One User

↓

Many CSR Participations

One User

↓

Many Challenge Participations

One User

↓

Many Policy Acknowledgements

One User

↓

Many Reward Redemptions

### Business Rules

Email must be unique.

Passwords must be stored using bcrypt.

Users cannot exist without a department.

Users cannot exist without a role.

Inactive users cannot log in.

### Indexes

email

department_id

role_id

status

---

# 11. Organization Domain

The Organization Domain contains all organizational master data used throughout the application.

This domain rarely changes and acts as the foundation for Environmental, Social and Governance modules.

---

## Table: departments

### Purpose

Stores the organizational hierarchy.

Every employee belongs to one department.

Departments own ESG Goals, Carbon Transactions, CSR Activities, Audits and Department Scores.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| code | VARCHAR(20) | UNIQUE |
| parent_department_id | UUID | FK -> departments.id |
| head_user_id | UUID | FK -> users.id |
| status | DepartmentStatus | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

---

### Relationships

One Department

↓

Many Users

One Department

↓

Many Carbon Transactions

One Department

↓

Many CSR Activities

One Department

↓

Many Audits

One Department

↓

Many Environmental Goals

One Department

↓

Many Compliance Issues

---

### Business Rules

Department code must be unique.

Departments cannot be deleted if employees exist.

Parent Department is optional.

Department Head must belong to the same department.

Inactive departments cannot receive new users.

---

### Indexes

code

status

parent_department_id

head_user_id

---

## Table: categories

### Purpose

Reusable lookup table shared across multiple modules.

Instead of creating separate tables for CSR Categories and Challenge Categories, EcoSphere uses one generic category table.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| type | CategoryType | NOT NULL |
| status | CategoryStatus | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

---

### Category Types

CSR_ACTIVITY

CHALLENGE

TRAINING

GENERAL

---

### Relationships

One Category

↓

Many CSR Activities

One Category

↓

Many Challenges

---

### Business Rules

Category name must be unique within its type.

Inactive categories cannot be assigned.

---

### Indexes

type

status

---

# 12. Environmental Domain

The Environmental Domain measures sustainability by calculating carbon emissions from business operations and comparing them against organizational goals.

This domain consists of three primary entities:

- Emission Factors
- Sustainability Goals
- Carbon Transactions

---

## Table: emission_factors

### Purpose

Stores standardized emission conversion factors.

Emission Factors are used to automatically calculate carbon emissions.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| name | VARCHAR(100) | NOT NULL |
| source | VARCHAR(100) | NOT NULL |
| unit | VARCHAR(30) | NOT NULL |
| factor | DECIMAL(10,4) | NOT NULL |
| description | TEXT | NULL |
| status | Status | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

---

### Example Records

Diesel

kg CO₂/L

2.6800

---

Electricity

kg CO₂/kWh

0.8200

---

### Relationships

One Emission Factor

↓

Many Carbon Transactions

---

### Business Rules

Factor value must be positive.

Inactive factors cannot be used.

Emission Factors are never deleted.

---

### Indexes

name

status

---

## Table: environmental_goals

### Purpose

Defines sustainability targets for individual departments.

Used to measure ESG progress over time.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| department_id | UUID | FK |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| target_value | DECIMAL(10,2) | NOT NULL |
| deadline | DATE | NOT NULL |
| status | GoalStatus | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Goals

↓

One Department

---

### Business Rules

Goals belong to exactly one department.

Completed goals become read-only.

Past deadlines are highlighted on the dashboard.

---

### Indexes

department_id

deadline

status


---

## Table: carbon_transactions

### Purpose

Stores calculated carbon emissions generated from ERP operations.

This table is the primary source for Environmental dashboards and ESG score calculations.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| department_id | UUID | FK |
| emission_factor_id | UUID | FK |
| source_type | SourceType | NOT NULL |
| reference_number | VARCHAR(100) | NULL |
| quantity | DECIMAL(10,2) | NOT NULL |
| calculated_emission | DECIMAL(10,4) | NOT NULL |
| created_by | UUID | FK -> users.id |
| transaction_date | DATE | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

---

### Source Types

PURCHASE

MANUFACTURING

EXPENSE

FLEET

MANUAL

---

### Relationships

Many Carbon Transactions

↓

One Department

Many Carbon Transactions

↓

One Emission Factor

Many Carbon Transactions

↓

One User

---

### Business Rules

Calculated Emission = Quantity × Emission Factor.

Calculation is automatic when Auto Emission is enabled.

Manual editing of calculated emissions is not allowed.

Historical transactions cannot be deleted.

---

### Indexes

department_id

transaction_date

source_type

created_by

emission_factor_id

---

## Table: settings

### Purpose

Stores organization-wide application configuration.

This table allows administrators to change platform behaviour without modifying source code.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| key | VARCHAR(100) | UNIQUE |
| value | TEXT | NOT NULL |
| description | TEXT | NULL |
| updated_by | UUID | FK -> users.id |
| updated_at | TIMESTAMP | NOT NULL |

---

### Example Records

AUTO_EMISSION = true

EVIDENCE_REQUIRED = true

BADGE_AUTO_AWARD = true

EMAIL_NOTIFICATIONS = true

DEFAULT_ENV_WEIGHT = 40

DEFAULT_SOCIAL_WEIGHT = 30

DEFAULT_GOVERNANCE_WEIGHT = 30

---

### Business Rules

Every configuration key must be unique.

Configuration changes are logged.

Values are validated before saving.

---

### Relationships

Many Settings

↓

One Administrator

---

# 13. Social Domain

The Social Domain manages employee engagement, CSR initiatives, sustainability challenges, badges, rewards and the complete gamification ecosystem.

It encourages employee participation while maintaining complete auditability of all activities.

---

## Table: csr_activities

### Purpose

Stores CSR (Corporate Social Responsibility) activities organized by the organization.

Employees participate in these activities to improve the Social component of ESG.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| department_id | UUID | FK → departments.id |
| category_id | UUID | FK → categories.id |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| status | ActivityStatus | DEFAULT PLANNED |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

---

### Relationships

One Department

↓

Many CSR Activities

One Category

↓

Many CSR Activities

One CSR Activity

↓

Many Employee Participations

---

### Business Rules

- End Date must be greater than or equal to Start Date.
- Archived activities cannot accept new participants.
- Soft delete only.

---

### Indexes

department_id

category_id

status

start_date

end_date

created_by

---

## Table: employee_participation

### Purpose

Tracks employee participation in CSR activities.

Acts as a junction table between Users and CSR Activities.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| activity_id | UUID | FK → csr_activities.id |
| user_id | UUID | FK → users.id |
| proof_file | TEXT | NULL |
| approval_status | ApprovalStatus | DEFAULT PENDING |
| completion_date | TIMESTAMP | NULL |
| approved_by | UUID | FK → users.id |
| approved_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Employee Participations

↓

One CSR Activity

Many Employee Participations

↓

One User

---

### Business Rules

- One employee can participate only once per CSR activity.
- Evidence is mandatory if `EVIDENCE_REQUIRED` setting is enabled.
- Only approved participation is considered for ESG calculations.

---

### Composite Unique Constraint

(activity_id, user_id)

---

### Indexes

activity_id

user_id

approval_status

---

## Table: challenges

### Purpose

Stores sustainability challenges available to employees.

Challenges encourage continuous ESG engagement through gamification.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| category_id | UUID | FK → categories.id |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| difficulty | DifficultyLevel | NOT NULL |
| xp_reward | INTEGER | NOT NULL |
| deadline | DATE | NOT NULL |
| evidence_required | BOOLEAN | DEFAULT FALSE |
| status | ChallengeStatus | DEFAULT DRAFT |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

---

### Relationships

One Challenge

↓

Many Challenge Participations

---

### Business Rules

- XP reward must be greater than zero.
- Archived challenges cannot receive new participants.
- Challenge lifecycle

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

### Indexes

category_id

deadline

status

---

## Table: challenge_participation

### Purpose

Tracks employee participation and progress in sustainability challenges.

Acts as a junction table between Users and Challenges.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| challenge_id | UUID | FK → challenges.id |
| user_id | UUID | FK → users.id |
| progress | INTEGER | DEFAULT 0 |
| proof_file | TEXT | NULL |
| approval_status | ApprovalStatus | DEFAULT PENDING |
| approved_by | UUID | FK → users.id |
| approved_at | TIMESTAMP | NULL |
| completed_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Challenge Participations

↓

One Challenge

Many Challenge Participations

↓

One User

---

### Business Rules

- Progress must remain between 0 and 100.
- One employee can participate only once per challenge.
- Evidence is mandatory when required.

---

### Composite Unique Constraint

(challenge_id, user_id)

---

### Indexes

challenge_id

user_id

approval_status

deadline

---

## Table: xp_transactions

### Purpose

Maintains the complete XP ledger for every employee.

This table acts like an accounting ledger and is the single source of truth for XP.

Current XP Balance = SUM(points)

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| source_type | XPSourceType | NOT NULL |
| source_id | UUID | NOT NULL |
| points | INTEGER | NOT NULL |
| remarks | TEXT | NULL |
| created_at | TIMESTAMP | NOT NULL |

---

### Source Types

CSR

CHALLENGE

BADGE

REWARD_REDEMPTION

ADMIN

---

### Business Rules

- Positive points increase XP.
- Negative points decrease XP.
- XP history is immutable.

---

### Indexes

user_id

source_type

created_at

---

## Table: badges

### Purpose

Stores badge definitions.

Badges are automatically awarded when unlock conditions are satisfied.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE |
| description | TEXT | NULL |
| unlock_rule | TEXT | NOT NULL |
| icon | TEXT | NULL |
| status | Status | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

---

### Business Rules

- Badge names must be unique.
- Badges are never permanently deleted.

---

## Table: user_badges

### Purpose

Stores badges earned by employees.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| badge_id | UUID | FK → badges.id |
| user_id | UUID | FK → users.id |
| awarded_at | TIMESTAMP | NOT NULL |

---

### Composite Unique Constraint

(user_id, badge_id)

---

### Indexes

user_id

badge_id

---

## Table: rewards

### Purpose

Stores rewards that employees can redeem using XP.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE |
| description | TEXT | NULL |
| points_required | INTEGER | NOT NULL |
| stock | INTEGER | NOT NULL |
| status | Status | DEFAULT ACTIVE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

---

### Business Rules

- Stock cannot become negative.
- Points Required must be greater than zero.
- Rewards are soft deleted.

---

## Table: reward_redemptions

### Purpose

Stores reward redemption history.

XP deduction is recorded in xp_transactions.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| reward_id | UUID | FK → rewards.id |
| user_id | UUID | FK → users.id |
| redeemed_at | TIMESTAMP | NOT NULL |
| status | RedemptionStatus | DEFAULT SUCCESS |
| created_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Reward Redemptions

↓

One Reward

Many Reward Redemptions

↓

One User

---

### Business Rules

- Reward stock decreases automatically.
- XP deduction is recorded in xp_transactions.
- Redemption fails if stock is unavailable.
- Redemption fails if employee has insufficient XP.

---

### Indexes

reward_id

user_id

redeemed_at

---

# 14. Governance Domain

The Governance Domain ensures organizational compliance through policy management, employee acknowledgements, audits and compliance issue tracking.

This domain maintains accountability, transparency and regulatory compliance.

---

## Table: policies

### Purpose

Stores ESG policies published by the organization.

Policies are version-controlled and require employee acknowledgement.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| version | VARCHAR(20) | NOT NULL |
| effective_date | DATE | NOT NULL |
| status | PolicyStatus | DEFAULT ACTIVE |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| deleted_at | TIMESTAMP | NULL |

---

### Relationships

One Policy

↓

Many Policy Acknowledgements

---

### Business Rules

- Policy version must be unique per title.
- Published policies cannot be modified.
- Old versions remain for audit purposes.
- Policies are never permanently deleted.

---

### Indexes

status

effective_date

created_by

---

## Table: policy_acknowledgements

### Purpose

Tracks employee acknowledgement of ESG policies.

Acts as a junction table between Users and Policies.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| policy_id | UUID | FK → policies.id |
| user_id | UUID | FK → users.id |
| acknowledged_at | TIMESTAMP | NOT NULL |
| acknowledgement_status | AcknowledgementStatus | DEFAULT ACKNOWLEDGED |

---

### Relationships

Many Policy Acknowledgements

↓

One Policy

Many Policy Acknowledgements

↓

One User

---

### Business Rules

- One employee acknowledges a policy only once per version.
- Policy reminders are generated automatically for pending acknowledgements.

---

### Composite Unique Constraint

(policy_id, user_id)

---

### Indexes

policy_id

user_id

---

## Table: audits

### Purpose

Stores governance audit cycles.

Audits verify ESG compliance within departments.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| department_id | UUID | FK → departments.id |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| audit_start_date | DATE | NOT NULL |
| audit_end_date | DATE | NOT NULL |
| auditor_id | UUID | FK → users.id |
| status | AuditStatus | DEFAULT PLANNED |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

---

### Relationships

One Department

↓

Many Audits

One Audit

↓

Many Compliance Issues

One User

↓

Many Audits

---

### Business Rules

- Audit End Date must be greater than or equal to Start Date.
- Completed audits become read-only.
- Closed audits cannot receive new compliance issues.

---

### Indexes

department_id

auditor_id

status

audit_start_date

audit_end_date

---

## Table: compliance_issues

### Purpose

Stores issues identified during governance audits.

Each issue must have an owner responsible for resolution.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| audit_id | UUID | FK → audits.id |
| department_id | UUID | FK → departments.id |
| owner_id | UUID | FK → users.id |
| severity | SeverityLevel | NOT NULL |
| description | TEXT | NOT NULL |
| due_date | DATE | NOT NULL |
| resolved_at | TIMESTAMP | NULL |
| status | ComplianceStatus | DEFAULT OPEN |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Compliance Issues

↓

One Audit

Many Compliance Issues

↓

One Department

Many Compliance Issues

↓

One User (Owner)

---

### Business Rules

- Every issue must have an owner.
- Every issue must have a due date.
- Issues passing due date automatically become overdue.
- Resolved issues become read-only.
- Notification generated on creation and overdue.

---

### Indexes

audit_id

department_id

owner_id

severity

status

due_date

---

# 15. Shared Domain

The Shared Domain contains common entities used across all application modules.

These tables support notifications, auditability and system-wide activity tracking.

---

## Table: notifications

### Purpose

Stores notifications generated by different modules of the application.

Notifications inform users about important ESG events.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| title | VARCHAR(150) | NOT NULL |
| message | TEXT | NOT NULL |
| type | NotificationType | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Notifications

↓

One User

---

### Business Rules

Notifications are generated automatically for:

- Badge Unlock
- Reward Redemption
- CSR Approval
- Challenge Approval
- Policy Reminder
- Compliance Issue Created
- Compliance Issue Overdue

Notifications cannot be edited.

---

### Indexes

user_id

type

is_read

created_at

---

## Table: activity_logs

### Purpose

Maintains a complete audit trail of important user actions performed within the system.

This table supports transparency, traceability and administrative auditing.

### Columns

| Column | Type | Constraints |
|----------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| entity_type | EntityType | NOT NULL |
| entity_id | UUID | NOT NULL |
| action | ActionType | NOT NULL |
| old_value | JSONB | NULL |
| new_value | JSONB | NULL |
| created_at | TIMESTAMP | NOT NULL |

---

### Relationships

Many Activity Logs

↓

One User

---

### Business Rules

Every critical business operation creates one Activity Log.

Examples

- User Login
- CSR Approval
- Challenge Approval
- Badge Awarded
- Reward Redeemed
- Policy Published
- Policy Acknowledged
- Audit Created
- Compliance Issue Resolved
- Settings Updated

Activity Logs are immutable.

---

### Indexes

user_id

entity_type

entity_id

action

created_at

---

# 16. Database Views

Database Views simplify reporting while avoiding redundant data storage.

Views are read-only.

---

## vw_department_scores

Purpose

Computes department ESG scores dynamically.

Calculates

- Environmental Score
- Social Score
- Governance Score
- Overall ESG Score

No physical table is required.

---

## vw_environment_dashboard

Provides

- Carbon Emissions
- Goal Progress
- Department Ranking

---

## vw_social_dashboard

Provides

- CSR Participation
- Challenge Completion
- Badge Distribution
- Reward Statistics

---

## vw_governance_dashboard

Provides

- Policy Compliance
- Audit Progress
- Open Compliance Issues
- Overdue Issues

---

## vw_organization_score

Calculates the organization's final ESG score using configurable weights.

Default

Environmental = 40%

Social = 30%

Governance = 30%

Weights are retrieved from the Settings table.

---

# 17. PostgreSQL ENUM Types

Using ENUMs improves consistency and data integrity.

---

UserStatus

ACTIVE

INACTIVE

---

DepartmentStatus

ACTIVE

INACTIVE

---

Status

ACTIVE

INACTIVE

---

PolicyStatus

DRAFT

ACTIVE

ARCHIVED

---

ActivityStatus

PLANNED

ACTIVE

COMPLETED

ARCHIVED

---

ChallengeStatus

DRAFT

ACTIVE

UNDER_REVIEW

COMPLETED

ARCHIVED

---

ApprovalStatus

PENDING

APPROVED

REJECTED

---

ComplianceStatus

OPEN

IN_PROGRESS

RESOLVED

OVERDUE

---

AuditStatus

PLANNED

ONGOING

COMPLETED

CANCELLED

---

AcknowledgementStatus

ACKNOWLEDGED

---

NotificationType

CSR

CHALLENGE

BADGE

REWARD

POLICY

AUDIT

COMPLIANCE

SYSTEM

---

DifficultyLevel

EASY

MEDIUM

HARD

---

SeverityLevel

LOW

MEDIUM

HIGH

CRITICAL

---

RedemptionStatus

SUCCESS

FAILED

CANCELLED

---

CategoryType

CSR_ACTIVITY

CHALLENGE

TRAINING

GENERAL

---

XPSourceType

CSR

CHALLENGE

BADGE

REWARD_REDEMPTION

ADMIN

---

SourceType

PURCHASE

MANUFACTURING

EXPENSE

FLEET

MANUAL

---

EntityType

USER

DEPARTMENT

CSR_ACTIVITY

CHALLENGE

POLICY

AUDIT

COMPLIANCE

REWARD

BADGE

SETTINGS

---

ActionType

CREATE

UPDATE

DELETE

APPROVE

REJECT

REDEEM

LOGIN

LOGOUT

---

# 18. Database Constraints

## Primary Keys

Every table uses

UUID Primary Key

---

## Foreign Keys

Foreign key constraints are enforced on all relationships.

---

## Unique Constraints

users.email

departments.code

badges.name

rewards.name

settings.key

(activity_id, user_id)

(challenge_id, user_id)

(policy_id, user_id)

(user_id, badge_id)

---

## Cascade Rules

Hard deletes are avoided.

Master records use Soft Delete.

Transactional records are immutable.

Foreign keys use RESTRICT by default.

---

## Indexing Strategy

Indexes are created for

- Foreign Keys
- Frequently searched fields
- Status columns
- Date columns
- Dashboard queries

---

## Database Philosophy

Master Data

↓

Transactional Data

↓

Database Views

↓

REST APIs

↓

Frontend

Business calculations should occur in the Service Layer.

The database stores facts, not business logic.

Historical records are never removed.

All user actions remain auditable.