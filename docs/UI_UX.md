# UI / UX Design Document

**Project:** EcoSphere

**Version:** 1.0

**Framework:** React + Tailwind CSS + shadcn/ui

---

# 1. Design Philosophy

EcoSphere follows modern Enterprise ERP design principles.

The interface prioritizes:

- Simplicity
- Consistency
- Fast navigation
- Minimal clicks
- Responsive layouts
- High information density
- Clear visual hierarchy

Every page should allow users to perform business operations with minimal cognitive load.

---

# 2. Design Principles

The UI should always follow these principles.

## Consistency

- Same spacing throughout.
- Same typography.
- Same button styles.
- Same table styles.
- Same card styles.

---

## Clarity

Avoid unnecessary animations.

Highlight important information using colors instead of excessive text.

---

## Efficiency

Most business tasks should require no more than three clicks.

---

## Accessibility

Maintain sufficient color contrast.

Icons must always have labels.

Keyboard navigation should work throughout the application.

---

## Feedback

Every action must provide feedback.

Examples

Loading

Success

Failure

Validation Error

Confirmation Dialog

---

# 3. Color Palette

Primary

#2563EB

Blue

Used for

Buttons

Navigation

Primary Actions

Links

---

Success

#10B981

Green

Used for

Completed

Approved

Healthy ESG

Success Messages

---

Warning

#F59E0B

Orange

Used for

Pending

Approaching Deadline

Reminder

---

Danger

#EF4444

Red

Used for

Compliance Issues

Rejected

Overdue

Validation Errors

---

Neutral

Gray Scale

Backgrounds

Borders

Secondary Text

---

# 4. Typography

Heading

Bold

Large

Section Heading

Semi Bold

Medium

Body

Regular

Small

Captions

Muted Gray

---

# 5. Spacing

Use an 8-point spacing system.

8px

16px

24px

32px

48px

No arbitrary spacing values.

---

# 6. Icons

Use Lucide Icons.

Examples

Dashboard

Leaf

Users

Shield

Award

Bell

Settings

FileText

BarChart

---

# 7. Layout

The application follows a three-part layout.

Sidebar

↓

Top Navigation Bar

↓

Content Area

---

Sidebar

Fixed

Collapsible

Contains navigation only.

---

Top Bar

Contains

Search

Notifications

Profile

Theme Toggle

---

Content

Scrollable

Responsive

Page Title

↓

Action Buttons

↓

Cards

↓

Charts

↓

Tables

---

# 8. Navigation Structure

Dashboard

Environmental

    Carbon Transactions

    Emission Factors

    Sustainability Goals

Social

    CSR Activities

    Employee Participation

    Challenges

    Rewards

Governance

    Policies

    Audits

    Compliance Issues

Reports

Notifications

Administration

    Departments

    Categories

    Settings

---

# 9. Global Components

These components should be reusable.

Button

Input

Select

Date Picker

Badge

Card

Table

Pagination

Search Bar

Notification Toast

Confirmation Dialog

Loading Spinner

Empty State

Modal

Drawer

File Upload

Avatar

Breadcrumb

Tabs

---

# 10. Common Table Design

Every table should support

Search

Sorting

Filtering

Pagination

Row Selection

Status Badges

Quick Actions

Export

---

# 11. Standard CRUD Pattern

Every master module follows the same workflow.

List View

↓

Search

↓

Filter

↓

Create Button

↓

Drawer / Modal

↓

Save

↓

Toast

Instead of opening a new page for every create/edit operation.

---

# 12. Dashboard Philosophy

The Dashboard should answer four questions.

1.

How healthy is the organization?

2.

What needs immediate attention?

3.

How are departments performing?

4.

What should I do next?

Every widget must help answer one of these questions.

---

# 13. Dashboard Layout

Row 1

Overall ESG Score

Environmental Score

Social Score

Governance Score

---

Row 2

Carbon Trend

CSR Participation

Compliance Trend

---

Row 3

Department Rankings

Leaderboard

---

Row 4

Today's Priority Actions

Upcoming Deadlines

Recent Notifications

---

# 14. Priority Actions Panel

Purpose

Recommend the highest-value actions users should perform.

Examples

Resolve Compliance Issue

Approve CSR Participation

Review Challenge Submission

Complete Policy Acknowledgement

Award Badge

Every action displays

Priority

Reason

Department

Due Date

Quick Action Button

---

# 15. Notification Panel

Shows

Unread Notifications

Badge Unlocks

Compliance Alerts

CSR Approvals

Reward Redemption

Policy Reminders

Newest first.

---

# 16. Responsive Behaviour

Desktop

Sidebar expanded.

Tablet

Sidebar collapsible.

Mobile

Sidebar becomes Drawer.

Tables become Cards.

Charts resize automatically.

---

# 17. Empty States

Every module must define an empty state.

Example

"No CSR Activities Found"

Display

Illustration

Short Description

Primary Action Button

---

# 18. Loading States

Use Skeleton Loaders.

Avoid blank screens.

---

# 19. Error States

Every API error should display

Friendly Message

Retry Button

Error Details (Developer Mode)

---

# 20. Success Feedback

After every successful operation

Show Toast Notification

Example

"CSR Activity Created Successfully"

Avoid page refreshes.

---

# 21. Design System

To ensure consistency across the application, all UI elements follow a shared design system.

---

## Buttons

Primary

- Blue
- Used for Create, Save, Submit

Secondary

- Gray
- Used for Cancel

Success

- Green
- Used for Approve

Danger

- Red
- Used for Delete

Warning

- Orange
- Used for Archive

Ghost

- Icon-only actions

---

## Status Badges

ACTIVE → Green

INACTIVE → Gray

PENDING → Orange

APPROVED → Green

REJECTED → Red

COMPLETED → Blue

ARCHIVED → Gray

OVERDUE → Red

---

## Cards

Every KPI Card contains

Icon

↓

Title

↓

Value

↓

Small Trend Indicator

Example

Overall ESG Score

84

↑ +4%

---

## Tables

Every table follows

Toolbar

↓

Filters

↓

Search

↓

Export

↓

Table

↓

Pagination

---

## Forms

Every form contains

Title

↓

Description

↓

Fields

↓

Validation

↓

Actions

Save

Cancel

---

## Drawers

Create

Edit

Quick View

Should use Right Drawer.

Avoid opening a new page.

---

## Dialogs

Delete Confirmation

Approve

Reject

Archive

Should always require confirmation.

---

# 22. Screen: Login

Purpose

Authenticate users securely.

---

Accessible Roles

All Users

---

Components

Company Logo

Email

Password

Remember Me

Forgot Password

Login Button

---

Validations

Email format

Password required

Invalid credentials

---

Actions

Login

Forgot Password

---

Success

Redirect to Dashboard.

---

Error

Display login error message.

---

Responsive

Centered Card.

---

# 23. Screen: Dashboard

Purpose

Provide an organization-wide ESG overview.

---

Accessible Roles

All authenticated users.

Dashboard content varies by role.

---

Top KPI Cards

Overall ESG Score

Environmental Score

Social Score

Governance Score

---

Charts

Carbon Trend

CSR Participation

Compliance Trend

Department Ranking

---

Tables

Recent Activities

Upcoming Deadlines

Notifications

---

Special Widget

Today's Priority Actions

Displays

Priority

Department

Reason

Quick Action

---

Quick Actions

Create CSR

Create Audit

View Reports

Redeem Reward

---

API Dependencies

GET /dashboard

GET /notifications

GET /priority-actions

---

Empty State

Display onboarding hints.

---

# 24. Screen: Administration

Purpose

Manage organization-wide master data.

---

Accessible Roles

Administrator

---

Layout

Tabbed Interface

Tabs

Departments

Categories

Settings

---

Tab 1

Departments

Table

Create

Edit

Deactivate

Search

Filters

---

Tab 2

Categories

Table

Create

Edit

Deactivate

---

Tab 3

Settings

Configuration Cards

Auto Emission

Evidence Required

Badge Auto Award

Notification Settings

ESG Weightage

---

API

GET /departments

POST /departments

GET /categories

POST /categories

GET /settings

PATCH /settings

---

# 25. Screen: Emission Factors

Purpose

Manage carbon conversion factors.

---

Accessible Roles

Administrator

ESG Manager

---

Components

Table

Search

Filters

Create

Edit

Deactivate

---

Columns

Name

Source

Unit

Factor

Status

---

Quick Actions

Add

Edit

Deactivate

---

API

GET /emission-factors

POST /emission-factors

PUT /emission-factors/:id

---

# 26. Screen: Carbon Transactions

Purpose

View and manage carbon emission records.

---

Accessible Roles

Administrator

ESG Manager

---

KPI Cards

Today's Emissions

Monthly Emissions

Department Emissions

Goal Progress

---

Table

Department

Emission Factor

Quantity

Calculated Emission

Date

Created By

---

Actions

Add Transaction

View Details

Export

---

Filters

Department

Date

Source

Emission Factor

---

API

GET /carbon-transactions

POST /carbon-transactions

---

# 27. Screen: Sustainability Goals

Purpose

Track environmental goals.

---

Accessible Roles

Administrator

ESG Manager

---

Cards

Goal Completion

Overdue Goals

Upcoming Goals

---

Table

Department

Goal

Target

Deadline

Progress

Status

---

Actions

Create Goal

Edit Goal

Mark Complete

---

API

GET /goals

POST /goals

PUT /goals/:id

---

# 28. Screen: CSR Activities

### Purpose

Manage Corporate Social Responsibility (CSR) activities and employee participation.

---

### Accessible Roles

- Administrator
- HR / CSR Manager
- ESG Manager

Employees have read-only access to activities and can join active activities.

---

### Layout

Tabbed Interface

Tab 1

CSR Activities

Tab 2

Employee Participation

---

## Tab 1 – CSR Activities

### Components

KPI Cards

- Active Activities
- Upcoming Activities
- Completed Activities

Table

Columns

- Title
- Category
- Department
- Start Date
- End Date
- Status

Toolbar

- Search
- Filter
- Create Activity
- Export CSV

Quick Actions

- View
- Edit
- Archive

---

### API

GET /csr-activities

POST /csr-activities

PUT /csr-activities/:id

---

## Tab 2 – Employee Participation

### Components

Participation Table

Columns

- Employee
- Activity
- Approval Status
- Proof Uploaded
- Completion Date

Actions

Approve

Reject

View Proof

---

### Validations

Evidence must exist when
Evidence Required = TRUE

One employee cannot participate twice in the same activity.

---

### API

GET /employee-participation

PATCH /employee-participation/:id

---

# 29. Screen: Challenges

### Purpose

Manage sustainability challenges.

---

### Accessible Roles

Administrator

HR Manager

Employees (Read + Participate)

---

### KPI Cards

Active Challenges

Completed Challenges

Average Completion Rate

XP Awarded

---

### Table

Columns

Title

Difficulty

XP Reward

Deadline

Status

Participants

---

### Actions

Create Challenge

Edit Challenge

Archive Challenge

View Participants

---

### Challenge Details Drawer

Description

Deadline

Rules

Evidence Required

Progress

Participants

Approve Submission

Reject Submission

---

### API

GET /challenges

POST /challenges

PUT /challenges/:id

PATCH /challenge-participation/:id

---

### Empty State

"No Active Challenges"

Show

Create Challenge Button

---

# 30. Screen: Rewards & Leaderboard

### Purpose

Display employee rankings, badges and reward redemption.

---

### Accessible Roles

All Users

---

### Layout

Two Tabs

Leaderboard

Rewards

---

## Leaderboard

Table

Rank

Employee

Department

XP

Badges Earned

Completed Challenges

Search

Department Filter

---

## Rewards

Cards

Reward

Description

Required XP

Available Stock

Redeem Button

---

### Reward Drawer

Description

Required XP

Remaining Stock

Redeem Confirmation

---

### User Profile Summary

Current XP

Badges Earned

Recent Achievements

Reward History

---

### API

GET /leaderboard

GET /rewards

POST /reward-redemptions

GET /user-badges

GET /xp-transactions

---

### Validation

Insufficient XP

↓

Disable Redeem Button

Out of Stock

↓

Disable Redeem Button

---

# 31. Shared UX Behaviour

All Social pages follow the same interaction pattern.

List

↓

Search

↓

Filter

↓

Select Item

↓

Drawer Opens

↓

Edit / Approve / Reject

↓

Toast Notification

↓

Auto Refresh

---

### Empty States

CSR

"No CSR Activities Yet"

Challenges

"No Active Challenges"

Rewards

"No Rewards Available"

Leaderboard

"No Rankings Available"

---

### Loading

Skeleton Cards

Skeleton Tables

Progress Indicators

---

### Error

Friendly Error Message

Retry Button

Support Link (optional)

---

# 32. Screen: Policies

### Purpose

Manage ESG policies and track employee acknowledgements.

---

### Accessible Roles

- Administrator
- Compliance Officer

Employees can only view and acknowledge policies assigned to them.

---

### Layout

Tabbed Interface

Tab 1

Policies

Tab 2

Acknowledgements

---

## Tab 1 – Policies

### Components

KPI Cards

- Active Policies
- Draft Policies
- Archived Policies

Table

Columns

- Title
- Version
- Effective Date
- Status

Toolbar

- Search
- Filter
- Create Policy

Actions

- View
- Edit
- Archive

---

## Tab 2 – Policy Acknowledgements

Table

Columns

- Employee
- Policy
- Acknowledged On
- Status

Actions

- Send Reminder
- View Employee

---

### API

GET /policies

POST /policies

PUT /policies/:id

GET /policy-acknowledgements

---

# 33. Screen: Audits

### Purpose

Plan and monitor ESG audits.

---

### Accessible Roles

Administrator

Compliance Officer

---

### KPI Cards

Upcoming Audits

Ongoing Audits

Completed Audits

Open Issues

---

### Table

Columns

- Audit
- Department
- Auditor
- Start Date
- End Date
- Status

Actions

- Create Audit
- View
- Close Audit

---

### Audit Details Drawer

Audit Information

Assigned Auditor

Compliance Issues

Audit Timeline

---

### API

GET /audits

POST /audits

PUT /audits/:id

---

# 34. Screen: Compliance Issues

### Purpose

Track governance violations and monitor issue resolution.

---

### Accessible Roles

Administrator

Compliance Officer

Department Heads (Own Department)

---

### KPI Cards

Open Issues

Critical Issues

Overdue Issues

Resolved Issues

---

### Table

Columns

- Issue
- Department
- Owner
- Severity
- Due Date
- Status

Filters

Department

Severity

Status

Owner

---

### Actions

Assign Owner

Update Status

Resolve Issue

View Details

---

### API

GET /compliance-issues

POST /compliance-issues

PUT /compliance-issues/:id

---

### Validation

Every issue requires

- Owner
- Due Date

---

# 35. Screen: Reports & Analytics

### Purpose

Provide organization-wide ESG analytics and exportable reports.

---

### Accessible Roles

Administrator

ESG Manager

Compliance Officer

---

### Dashboard Widgets

Overall ESG Score

Department Rankings

Environmental Summary

Social Summary

Governance Summary

---

### Charts

Carbon Emissions Trend

CSR Participation

Challenge Completion

Compliance Resolution

Department ESG Comparison

---

### Report Types

Environmental Report

Social Report

Governance Report

ESG Summary

Custom Report Builder

---

### Export Options

PDF

Excel

CSV

---

### Filters

Department

Employee

Challenge

Date Range

ESG Module

---

### API

GET /reports/environment

GET /reports/social

GET /reports/governance

GET /reports/esg-summary

POST /reports/custom

---

# 36. Screen: Notifications

### Purpose

Display system notifications and reminders.

---

### Accessible Roles

All Users

---

### Sections

Unread Notifications

Today's Notifications

Older Notifications

---

### Notification Types

CSR

Challenge

Policy

Compliance

Reward

Badge

System

---

### Actions

Mark as Read

Mark All Read

View Related Record

Delete (Local Notification Only)

---

### API

GET /notifications

PATCH /notifications/:id/read

PATCH /notifications/read-all

---

# 37. Global Search

### Purpose

Quickly search records across the application.

---

### Search Scope

Departments

Employees

Policies

Challenges

CSR Activities

Audits

Compliance Issues

Rewards

---

### Behaviour

Instant Search

Keyboard Shortcut

Ctrl + K

---

### Search Results

Entity Name

Module

Quick Open

---

# 38. Accessibility

The application should support

Keyboard Navigation

Visible Focus Indicators

ARIA Labels

Color Contrast Compliance

Semantic HTML

Screen Reader Compatibility

Responsive Font Sizes

---

# 39. Responsive Behaviour

Desktop

Sidebar Expanded

Three/Four Column Dashboard

---

Tablet

Collapsible Sidebar

Two Column Layout

---

Mobile

Drawer Navigation

Cards Instead of Tables

Charts Resize Automatically

Sticky Bottom Actions

---

# 40. UX Guidelines

Every page should follow the same interaction flow.

Search

↓

Filter

↓

Table

↓

Select Record

↓

Right Drawer

↓

Save

↓

Toast Notification

↓

Automatic Refresh

Avoid full page reloads.

---

# 41. Dashboard Widgets

The Dashboard contains the following widgets.

Executive ESG Score

Environmental Score

Social Score

Governance Score

Carbon Trend

Department Rankings

CSR Activity Overview

Challenge Progress

Compliance Status

Reward Activity

Recent Notifications

Upcoming Deadlines

Today's Priority Actions

---

# 42. Application Navigation

Dashboard

Environmental

• Emission Factors

• Carbon Transactions

• Sustainability Goals

Social

• CSR Activities

• Challenges

• Rewards & Leaderboard

Governance

• Policies

• Audits

• Compliance Issues

Reports

Notifications

Administration

• Departments

• Categories

• Settings

Logout

---

# 43. Design Summary

EcoSphere follows an enterprise ERP interface that emphasizes

- Consistency
- Simplicity
- High information density
- Minimal clicks
- Reusable components
- Responsive layouts
- Accessibility
- Clear visual hierarchy

Every module follows the same CRUD workflow and visual language, ensuring a consistent user experience across the platform.