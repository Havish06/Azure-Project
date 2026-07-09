# Cloud-Based Asset Management System for Construction

A full-stack implementation of the PRD: **Next.js (TypeScript + Tailwind)** frontend,
**ASP.NET Core Web API** backend, **Azure SQL Database**, **Azure Blob Storage**, and
**Microsoft Entra ID** authentication.

Everything is wired end-to-end — controllers call a real `AppDbContext` over EF Core,
the frontend calls real API endpoints with axios, file uploads go to real Blob Storage
via the SDK, and auth is real Entra ID token validation. You only need to supply your
own Azure resource values in two `.env` files — nothing here is mocked.

---

## 1. Project Structure

```
construction-asset-management/
├── backend/                     ASP.NET Core Web API (.NET 8)
│   ├── Controllers/             AssetsController, MaintenanceController,
│   │                            DocumentsController, AuthController
│   ├── Models/                  Asset, Maintenance, Document, User (EF Core entities)
│   ├── DTOs/                    Request/response shapes
│   ├── Data/                    AppDbContext
│   ├── Services/                IBlobStorageService / BlobStorageService (Azure Blob SDK)
│   ├── Authorization/           Administrator role policy handler
│   ├── Middleware/               Global error handling
│   ├── Program.cs               Wires DB, Entra ID auth, CORS, Blob Storage, Swagger
│   ├── appsettings.json
│   └── .env.example             ← copy to .env and fill in your Azure values
│
├── frontend/                    Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── app/                     Pages: /, /dashboard, /assets, /assets/add,
│   │                            /assets/[id], /maintenance, /documents
│   ├── components/               Sidebar, AppShell, StatusBadge, SummaryCard
│   ├── services/                 apiClient (axios + MSAL), assetService,
│   │                            maintenanceService, documentService, authService
│   ├── types/                    Shared TypeScript interfaces
│   └── .env.local.example       ← copy to .env.local and fill in your values
│
└── docs/
    └── PRD.md
```

---

## 2. Azure resources you need to create

Per the PRD, section 16 (Deployment):

1. **Resource Group**
2. **Azure SQL Database** (server + database)
3. **Azure Storage Account** → create a Blob container named `asset-documents` (or any
   name — set it in `.env`)
4. **Microsoft Entra ID App Registrations** — you need **two**:
   - **API app registration** (`ConstructionAssetManagement-API`): expose an API scope,
     e.g. `access_as_user`. This gives you the `ENTRA_CLIENT_ID` / `ENTRA_AUDIENCE` for
     the backend.
   - **SPA app registration** (`ConstructionAssetManagement-Web`): platform = Single-page
     application, redirect URI `http://localhost:3000` (and your deployed URL later).
     Add a delegated permission to the API app's `access_as_user` scope, grant admin
     consent. This gives you `NEXT_PUBLIC_ENTRA_CLIENT_ID` for the frontend.
5. **Azure App Service** (one for the API, one for the frontend, or a combined setup) —
   for later deployment.

---

## 3. Configure environment variables

### Backend — `backend/.env`

Copy `backend/.env.example` → `backend/.env` and fill in:

```env
AZURE_SQL_CONNECTION_STRING=Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;User ID=<user>;Password=<password>;Encrypt=True;
AZURE_BLOB_STORAGE_CONNECTION_STRING=<storage account connection string>
AZURE_BLOB_CONTAINER_NAME=asset-documents
ENTRA_INSTANCE=https://login.microsoftonline.com/
ENTRA_TENANT_ID=<your tenant id>
ENTRA_CLIENT_ID=<API app registration client id>
ENTRA_AUDIENCE=api://<API app registration client id>
FRONTEND_URL=http://localhost:3000
```

These are loaded automatically at startup via `DotNetEnv.Env.Load()` in `Program.cs`
and mapped into the standard ASP.NET Core configuration keys (`ConnectionStrings:DefaultConnection`,
`AzureAd:*`, `AzureBlobStorage:*`). In Azure App Service, set the same names as
**Application Settings** instead of shipping a `.env` file.

### Frontend — `frontend/.env.local`

Copy `frontend/.env.local.example` → `frontend/.env.local` and fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ENTRA_CLIENT_ID=<SPA app registration client id>
NEXT_PUBLIC_ENTRA_TENANT_ID=<your tenant id>
NEXT_PUBLIC_ENTRA_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_ENTRA_API_SCOPE=api://<API app registration client id>/access_as_user
```

---

## 4. Run locally

### Backend

```bash
cd backend
dotnet restore
dotnet ef database update    # applies EF Core migrations to Azure SQL
dotnet run
```

The first run needs an initial migration if one hasn't been generated yet:

```bash
dotnet tool install --global dotnet-ef   # once, if not already installed
dotnet ef migrations add InitialCreate
dotnet ef database update
```

`Program.cs` also calls `db.Database.Migrate()` on startup, so once a migration exists,
schema updates apply automatically on deploy.

API runs at `http://localhost:5000`, Swagger UI at `http://localhost:5000/swagger`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`.

---

## 5. How the pieces connect

- **Auth**: The frontend uses `@azure/msal-browser` / `@azure/msal-react` to sign the
  user in against Entra ID (`services/authConfig.ts`). Every API call attaches a fresh
  access token as a Bearer header (`services/apiClient.ts`). The backend validates that
  token with `Microsoft.Identity.Web` (`Program.cs`). On first login, `AuthController`
  syncs the Entra ID identity into the local `Users` table (defaults to `SiteEngineer`
  role — promote a user to `Administrator` directly in the database, or extend
  `AuthController`/`AdministratorHandler` to read an Entra ID app role/group claim).
- **Database**: `AppDbContext` (EF Core) maps directly to the PRD's `Users`, `Assets`,
  `Maintenance`, `Documents` tables against Azure SQL Database.
- **File storage**: `DocumentsController.Upload` streams the file straight to Azure Blob
  Storage via `BlobStorageService`, storing only the resulting blob URL in the
  `Documents` table. Downloads generate a short-lived SAS URL.
- **Role-based actions**: Create/Edit/Delete on Assets, Maintenance, and Documents are
  restricted to `Administrator` via the `AdministratorOnly` policy; Site Engineers can
  still view everything and update an asset's status.

---

## 6. Deploying to Azure App Service

Following PRD section 16:

```bash
# Backend
cd backend
dotnet publish -c Release -o ./publish
az webapp deploy --resource-group <rg> --name <api-app-name> --src-path ./publish

# Frontend
cd frontend
npm run build
# Deploy via `az webapp up`, GitHub Actions, or Azure Static Web Apps
```

Set the same environment variables listed above as **Application Settings** on each
App Service instance (instead of `.env` files), and update `FRONTEND_URL` /
`NEXT_PUBLIC_API_URL` / Entra ID redirect URIs to the deployed URLs.
