using ConstructionAssetManagement.Data;
using ConstructionAssetManagement.Middleware;
using ConstructionAssetManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;

// Load variables from a local .env file (no-op if the file doesn't exist, e.g. in Azure App Service
// where these are set as Application Settings / environment variables instead).
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------------------
// Map .env / environment variables into configuration keys used across the app
// ---------------------------------------------------------------------------
builder.Configuration["ConnectionStrings:DefaultConnection"] =
    Environment.GetEnvironmentVariable("AZURE_SQL_CONNECTION_STRING")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

builder.Configuration["AzureBlobStorage:ConnectionString"] =
    Environment.GetEnvironmentVariable("AZURE_BLOB_STORAGE_CONNECTION_STRING")
    ?? builder.Configuration["AzureBlobStorage:ConnectionString"];

builder.Configuration["AzureBlobStorage:ContainerName"] =
    Environment.GetEnvironmentVariable("AZURE_BLOB_CONTAINER_NAME")
    ?? builder.Configuration["AzureBlobStorage:ContainerName"] ?? "asset-documents";

builder.Configuration["AzureAd:Instance"] =
    Environment.GetEnvironmentVariable("ENTRA_INSTANCE") ?? builder.Configuration["AzureAd:Instance"] ?? "https://login.microsoftonline.com/";
builder.Configuration["AzureAd:TenantId"] =
    Environment.GetEnvironmentVariable("ENTRA_TENANT_ID") ?? builder.Configuration["AzureAd:TenantId"];
builder.Configuration["AzureAd:ClientId"] =
    Environment.GetEnvironmentVariable("ENTRA_CLIENT_ID") ?? builder.Configuration["AzureAd:ClientId"];
builder.Configuration["AzureAd:Audience"] =
    Environment.GetEnvironmentVariable("ENTRA_AUDIENCE") ?? builder.Configuration["AzureAd:Audience"];

builder.Configuration["Cors:FrontendUrl"] =
    Environment.GetEnvironmentVariable("FRONTEND_URL") ?? builder.Configuration["Cors:FrontendUrl"] ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Database (Azure SQL Database via EF Core)
// ---------------------------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration["ConnectionStrings:DefaultConnection"],
        sql => sql.EnableRetryOnFailure()));

// ---------------------------------------------------------------------------
// Azure Blob Storage
// ---------------------------------------------------------------------------
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();

// ---------------------------------------------------------------------------
// Authentication - Microsoft Entra ID (JWT Bearer validation)
// The frontend uses MSAL to sign users in against Entra ID and attaches the
// resulting access token as "Authorization: Bearer <token>" on API calls.
// ---------------------------------------------------------------------------
builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization(options =>
{
    // Requires the caller's local User record (synced at /api/auth/login) to have Role = Administrator.
    // Enforced via the custom AdministratorRequirement/Handler registered below.
    options.AddPolicy("AdministratorOnly", policy =>
        policy.Requirements.Add(new ConstructionAssetManagement.Authorization.AdministratorRequirement()));
});
builder.Services.AddScoped<IAuthorizationHandler, ConstructionAssetManagement.Authorization.AdministratorHandler>();

// ---------------------------------------------------------------------------
// CORS - allow the Next.js frontend to call this API
// ---------------------------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration["Cors:FrontendUrl"]!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Construction Asset Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    c.AddSecurityRequirement(new()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Apply pending EF Core migrations automatically on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
