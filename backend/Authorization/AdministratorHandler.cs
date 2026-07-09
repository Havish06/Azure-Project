using ConstructionAssetManagement.Data;
using ConstructionAssetManagement.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ConstructionAssetManagement.Authorization;

public class AdministratorRequirement : IAuthorizationRequirement { }

/// <summary>
/// Checks the authenticated Entra ID user against the local Users table to confirm
/// they are an Administrator. This lets us drive role-based UI/permissions (as per the PRD's
/// "Administrator" vs "Site Engineer" roles) on top of Entra ID's identity-only tokens.
/// </summary>
public class AdministratorHandler : AuthorizationHandler<AdministratorRequirement>
{
    private readonly AppDbContext _db;

    public AdministratorHandler(AppDbContext db)
    {
        _db = db;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, AdministratorRequirement requirement)
    {
        var objectId = context.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
                       ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(objectId)) return;

        var user = await _db.Users.FirstOrDefaultAsync(u => u.EntraObjectId == objectId);
        if (user != null && user.Role == UserRole.Administrator)
        {
            context.Succeed(requirement);
        }
    }
}
