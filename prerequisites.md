# Prerequisites

Everything you need to install and configure before running the Construction Asset Management system locally.

---

## System requirements (install once)

| Tool | Version | Purpose | Install |
|---|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | **8.0** | Backend API | Download from Microsoft |
| [Node.js](https://nodejs.org/) | **18+** (LTS recommended) | Frontend (includes npm) | Download from nodejs.org |
| `dotnet-ef` (global tool) | matches EF Core 8 | Database migrations | See command below |

```bash
dotnet tool install --global dotnet-ef
```

---

## Backend — `backend/`

**Install command:**

```bash
cd backend
dotnet restore
```

**NuGet packages** (installed automatically via `dotnet restore`):

| Package | Version |
|---|---|
| Microsoft.EntityFrameworkCore | 8.0.8 |
| Microsoft.EntityFrameworkCore.SqlServer | 8.0.8 |
| Microsoft.EntityFrameworkCore.Design | 8.0.8 |
| Microsoft.EntityFrameworkCore.Tools | 8.0.8 |
| Azure.Storage.Blobs | 12.21.2 |
| Microsoft.Identity.Web | 3.3.0 |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.8 |
| Swashbuckle.AspNetCore | 6.6.2 |
| DotNetEnv | 3.1.1 |

**Run the backend:**

```bash
cd backend
dotnet ef database update    # applies EF Core migrations to Azure SQL
dotnet run
```

On first run, if no migration exists yet:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

API: `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

---

## Frontend — `frontend/`

**Install command:**

```bash
cd frontend
npm install
```

**Runtime dependencies** (installed automatically via `npm install`):

| Package | Version |
|---|---|
| next | 14.2.5 |
| react | ^18.3.1 |
| react-dom | ^18.3.1 |
| @azure/msal-browser | ^3.23.0 |
| @azure/msal-react | ^2.0.22 |
| axios | ^1.7.7 |
| recharts | ^2.12.7 |

**Dev dependencies:**

| Package | Version |
|---|---|
| typescript | ^5.5.4 |
| tailwindcss | ^3.4.9 |
| postcss | ^8.4.41 |
| autoprefixer | ^10.4.19 |
| @types/node | ^20.14.15 |
| @types/react | ^18.3.3 |
| @types/react-dom | ^18.3.0 |

**Run the frontend:**

```bash
cd frontend
npm run dev
```

App: `http://localhost:3000`

---

## Quick setup (copy-paste)

```bash
# Global tool (once)
dotnet tool install --global dotnet-ef

# Backend
cd backend
dotnet restore

# Frontend
cd ../frontend
npm install
```

---

## Environment variables

Copy the example files and fill in your Azure values before running:

| File | Copy from |
|---|---|
| `backend/.env` | `backend/.env.example` |
| `frontend/.env.local` | `frontend/.env.local.example` |

See [README.md](./README.md#3-configure-environment-variables) for the full list of keys and where to get each value.

---

## Azure services (provision in Azure Portal)

These are not installed locally, but the app depends on them:

1. **Azure SQL Database** — backend data store
2. **Azure Blob Storage** — document uploads (create a container, e.g. `asset-documents`)
3. **Microsoft Entra ID** — two app registrations:
   - **API app** (`ConstructionAssetManagement-API`) — expose scope `access_as_user`
   - **SPA app** (`ConstructionAssetManagement-Web`) — platform SPA, redirect URI `http://localhost:3000`, delegated permission to the API scope

---

## Optional (for deployment)

| Tool | Purpose |
|---|---|
| [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) (`az`) | Deploy to Azure App Service |

See [README.md](./README.md#6-deploying-to-azure-app-service) for deployment steps.
