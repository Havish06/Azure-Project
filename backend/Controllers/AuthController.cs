using ConstructionAssetManagement.Data;
using ConstructionAssetManagement.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ConstructionAssetManagement.Controllers;

/// <summary>
/// Authentication is performed on the frontend via MSAL against Microsoft Entra ID.
/// The frontend sends the resulting access token as a Bearer token on every request.
/// This controller just syncs/creates a local User record on first login ("login")
/// and lets the frontend clear its own token cache on logout.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    [Authorize]
    public async Task<IActionResult> Login()
    {
        var objectId = User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
                        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("preferred_username");
        var name = User.FindFirstValue(ClaimTypes.Name) ?? email ?? "Unknown User";

        if (string.IsNullOrEmpty(objectId) || string.IsNullOrEmpty(email))
        {
            return Unauthorized(new { error = "Token missing required claims." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.EntraObjectId == objectId);
        if (user == null)
        {
            // First-time login: create the user record.
            // Default new users to SiteEngineer; promote to Administrator manually in the DB
            // or extend this logic to check an Entra ID security group / app role claim.
            user = new User
            {
                Name = name,
                Email = email,
                EntraObjectId = objectId,
                Role = UserRole.SiteEngineer
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            user.UserId,
            user.Name,
            user.Email,
            Role = user.Role.ToString()
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Token invalidation is handled client-side by MSAL (clearing the cache /
        // redirecting to the Entra ID logout endpoint). Nothing to do server-side.
        return Ok(new { message = "Logged out." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var objectId = User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
                        ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EntraObjectId == objectId);
        if (user == null) return NotFound();

        return Ok(new
        {
            user.UserId,
            user.Name,
            user.Email,
            Role = user.Role.ToString()
        });
    }
}
