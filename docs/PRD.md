# Cloud-Based Asset Management System for Construction

## Product Requirements Document (PRD)

**Version:** 1.0  
**Project Type:** Certification Project (30 Marks)  
**Platform:** Web Application  
**Cloud Provider:** Microsoft Azure

---

# Table of Contents

1. Project Overview
2. Problem Statement
3. Objectives
4. Project Scope
5. User Roles
6. Functional Requirements
7. Non-Functional Requirements
8. UI Design
9. Technology Stack
10. Azure Services
11. System Architecture
12. Database Design
13. API Design
14. Application Workflow
15. Folder Structure
16. Deployment
17. Future Enhancements

---

# 1. Project Overview

Construction companies use many types of equipment across different construction sites. Managing these assets manually can lead to lost equipment, delayed maintenance, and poor resource utilization.

The Cloud-Based Asset Management System is a web application that allows construction companies to manage their assets from anywhere using Microsoft Azure Cloud Services.

The application stores asset information in Azure SQL Database, documents in Azure Blob Storage, and is deployed using Azure App Service.

---

# 2. Problem Statement

Construction companies face challenges such as:

- Difficulty tracking equipment
- Missed maintenance schedules
- Paper-based asset records
- Poor visibility across multiple sites

A cloud-based system solves these issues by centralizing asset information.

---

# 3. Objectives

- Manage construction assets
- Store asset information securely
- Schedule equipment maintenance
- Upload equipment manuals
- Access data from anywhere
- Deploy the application using Microsoft Azure

---

# 4. Project Scope

## Included Features

- User Login
- Dashboard
- Asset Management (CRUD)
- Maintenance Tracking
- Document Upload
- Search Assets
- Azure Deployment

## Out of Scope

- GPS Tracking
- AI Predictions
- IoT Sensors
- Mobile Application
- ERP Integration

---

# 5. User Roles

## Administrator

Permissions:

- Login
- Add Assets
- Edit Assets
- Delete Assets
- Manage Maintenance
- Upload Documents
- View Reports

---

## Site Engineer

Permissions:

- Login
- View Assets
- Update Asset Status
- View Maintenance Details

---

# 6. Functional Requirements

## 6.1 Authentication

Users can:

- Login
- Logout

Authentication uses Microsoft Entra ID.

---

## 6.2 Dashboard

Dashboard displays:

- Total Assets
- Available Assets
- Under Maintenance
- Active Sites

---

## 6.3 Asset Management

Users can:

- Add Asset
- Edit Asset
- Delete Asset
- View Asset Details

### Asset Information

- Asset ID
- Asset Name
- Category
- Purchase Date
- Current Site
- Assigned Engineer
- Status

---

## 6.4 Maintenance

Each asset stores:

- Last Service Date
- Next Service Date
- Maintenance Notes

Administrator can update maintenance schedules.

---

## 6.5 Document Upload

Users can upload:

- Equipment Manuals
- Images
- Warranty Documents

Documents are stored in Azure Blob Storage.

---

## 6.6 Search

Search assets by:

- Asset Name
- Category
- Site
- Status

---

# 7. Non-Functional Requirements

- Responsive Design
- Secure Authentication
- Cloud Hosted
- Fast Response Time
- User Friendly Interface

---

# 8. UI Design

---

## Login Page

Components:

- Logo
- Email
- Password
- Login Button

---

## Dashboard

Cards:

- Total Assets
- Active Assets
- Under Maintenance
- Construction Sites

Recent Assets Table

Quick Navigation Cards

---

## Asset List

Table Columns

| Column |
|----------|
| Asset ID |
| Name |
| Category |
| Site |
| Status |
| Actions |

Buttons:

- Add
- Edit
- Delete

---

## Add Asset Page

Fields

- Asset Name
- Category
- Purchase Date
- Site
- Status
- Assigned Engineer
- Upload Manual

Buttons

- Save
- Cancel

---

## Asset Details Page

Displays:

- Asset Information
- Maintenance History
- Uploaded Documents

---

## Maintenance Page

Table

| Column |
|----------|
| Asset |
| Last Service |
| Next Service |
| Status |
| Update |

---

## Documents Page

Displays uploaded files

Functions:

- Upload
- Download
- Delete

---

# 9. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

---

## Backend

- ASP.NET Core Web API

---

## Database

Azure SQL Database

---

## Authentication

Microsoft Entra ID

---

## Storage

Azure Blob Storage

---

## Hosting

Azure App Service

---

# 10. Azure Services

| Azure Service | Purpose |
|---------------|---------|
| Azure App Service | Host Application |
| Azure SQL Database | Store Asset Data |
| Azure Blob Storage | Store Documents |
| Microsoft Entra ID | User Authentication |

---

# 11. System Architecture

```
                User

                  │

                  ▼

        Azure App Service

      (Frontend + Backend)

          │           │

          ▼           ▼

 Azure SQL DB    Azure Blob Storage
```

---

# 12. Database Design

## Users

| Column | Type |
|----------|------|
| UserId | INT |
| Name | VARCHAR |
| Email | VARCHAR |
| Role | VARCHAR |

---

## Assets

| Column | Type |
|----------|------|
| AssetId | INT |
| Name | VARCHAR |
| Category | VARCHAR |
| PurchaseDate | DATE |
| Site | VARCHAR |
| AssignedEngineer | VARCHAR |
| Status | VARCHAR |

---

## Maintenance

| Column | Type |
|----------|------|
| MaintenanceId | INT |
| AssetId | INT |
| LastService | DATE |
| NextService | DATE |
| Notes | TEXT |

---

## Documents

| Column | Type |
|----------|------|
| DocumentId | INT |
| AssetId | INT |
| FileName | VARCHAR |
| BlobURL | VARCHAR |
| UploadDate | DATE |

---

# 13. API Design

## Authentication

### Login

```
POST /api/auth/login
```

### Logout

```
POST /api/auth/logout
```

---

## Assets

### Get All Assets

```
GET /api/assets
```

### Get Asset

```
GET /api/assets/{id}
```

### Create Asset

```
POST /api/assets
```

### Update Asset

```
PUT /api/assets/{id}
```

### Delete Asset

```
DELETE /api/assets/{id}
```

---

## Maintenance

### Get Maintenance

```
GET /api/maintenance
```

### Update Maintenance

```
PUT /api/maintenance/{id}
```

---

## Documents

### Upload Document

```
POST /api/documents/upload
```

### Download Document

```
GET /api/documents/{id}
```

### Delete Document

```
DELETE /api/documents/{id}
```

---

# 14. Application Workflow

```
User

↓

Login

↓

Dashboard

↓

View Assets

↓

Add / Edit Asset

↓

Save to Azure SQL Database

↓

Upload Documents

↓

Azure Blob Storage
```

---

# 15. Folder Structure

```
construction-asset-management/

│

├── frontend/

│ ├── app/

│ ├── components/

│ ├── services/

│ └── styles/

│

├── backend/

│ ├── Controllers/

│ ├── Models/

│ ├── Services/

│ ├── Data/

│ └── Middleware/

│

└── docs/

      └── PRD.md
```

---

# 16. Deployment

## Azure Resources

- Azure App Service
- Azure SQL Database
- Azure Blob Storage
- Microsoft Entra ID

---

## Deployment Steps

1. Create Azure Resource Group
2. Create Azure SQL Database
3. Create Blob Storage Account
4. Configure Microsoft Entra ID
5. Deploy Backend to Azure App Service
6. Deploy Frontend to Azure App Service
7. Connect Database
8. Test Application

---

# 17. Future Enhancements

- QR Code Scanning
- Asset GPS Tracking
- Azure IoT Integration
- Email Notifications
- Dashboard Analytics
- Mobile Application
- Power BI Integration
- Predictive Maintenance

---

# Conclusion

The Cloud-Based Asset Management System provides a centralized platform for managing construction assets efficiently. By leveraging Microsoft Azure services, the application ensures secure data storage, cloud accessibility, and scalable deployment while fulfilling the requirements of a cloud-based certification project.

```

This PRD provides a clear roadmap for developing and deploying the application using Microsoft Azure services.