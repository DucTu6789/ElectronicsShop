using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TechStore.Api.Data;
using TechStore.Api.Dtos;
using TechStore.Api.Models;
using TechStore.Api.Security;

namespace TechStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Dùng để băm thử khi email không tồn tại, để thời gian phản hồi giống nhau
    // (tránh để kẻ xấu dò xem email nào đã đăng ký)
    private static readonly string DummyHash = PasswordHasher.Hash("dummy-password-1");

    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    // POST api/auth/register
    // Dữ liệu đã được [ApiController] kiểm tra theo RegisterRequest (sai -> tự trả 400)
    // -> kiểm tra trùng email -> băm mật khẩu -> INSERT vào bảng Users -> đăng nhập luôn
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = NormalizeEmail(request.Email);

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email này đã được đăng ký" });

        var user = new User
        {
            Email = email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            FullName = request.FullName?.Trim() ?? string.Empty,
            Role = "User",
        };
        _db.Users.Add(user);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Hai request đăng ký cùng email gửi gần như đồng thời: unique index sẽ chặn request thứ hai
            return Conflict(new { message = "Email này đã được đăng ký" });
        }

        return Ok(CreateAuthResponse(user));
    }

    // POST api/auth/login
    // SELECT user theo email trong DB -> so khớp mật khẩu với bản băm -> trả JWT + thông tin user
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Luôn băm/so khớp một lần dù email có tồn tại hay không
        var passwordOk = PasswordHasher.Verify(request.Password, user?.PasswordHash ?? DummyHash);

        if (user is null || !passwordOk)
            return Unauthorized(new { message = "Sai email hoặc mật khẩu" });

        return Ok(CreateAuthResponse(user));
    }

    // GET api/auth/me -> đọc lại thông tin người đang đăng nhập từ DB
    // (front-end gọi khi mở lại trang để chắc chắn token còn hiệu lực và user còn tồn tại)
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id))
            return Unauthorized();

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
            return Unauthorized(new { message = "Tài khoản không còn tồn tại" });

        return Ok(ToDto(user));
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static UserDto ToDto(User user) => new(user.Id, user.Email, user.FullName, user.Role);

    private AuthResponse CreateAuthResponse(User user)
    {
        var expires = DateTime.UtcNow.AddMinutes(_config.GetValue("Jwt:ExpireMinutes", 120));
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), expires, ToDto(user));
    }
}
