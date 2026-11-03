using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TechStore.Api.Data;
using TechStore.Api.Models;
using TechStore.Api.Security;

var builder = WebApplication.CreateBuilder(args);

// 1. Kết nối database (chuỗi kết nối nằm trong appsettings.json)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Controllers
builder.Services.AddControllers();

// 3. CORS: cho phép front-end React (Vite chạy ở cổng 3000) gọi API
const string FrontendPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendPolicy, policy =>
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// 4. Swagger để test API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Cho phép nhập JWT trong Swagger (nút Authorize)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Dán token nhận được từ POST /api/auth/login",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// 5. Xác thực JWT: GET công khai, POST/PUT/DELETE cần đăng nhập
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            NameClaimType = System.Security.Claims.ClaimTypes.Name,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Tự động tạo database khi chạy ở môi trường Development:
    //  - Nếu đã có thư mục Migrations (dotnet ef migrations add ...) -> áp dụng migration
    //  - Nếu chưa có migration nào -> tạo database trực tiếp từ model (EnsureCreated)
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.GetMigrations().Any())
        db.Database.Migrate();
    else
        db.Database.EnsureCreated();

    // Database cũ (thiếu bảng Users, hoặc bảng Users còn cột Username thay vì Email)
    // -> tạo lại từ đầu cho khớp model hiện tại
    try { _ = db.Users.Select(u => u.Email).FirstOrDefault(); }
    catch (SqliteException)
    {
        Console.WriteLine("Database cũ không khớp bảng Users (đăng nhập bằng email) -> tạo lại database mẫu...");
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
    }

    // Tạo tài khoản admin ban đầu (lấy từ appsettings.json -> AdminAccount) nếu chưa có
    var adminEmail = (builder.Configuration["AdminAccount:Email"] ?? "admin@techstore.vn").Trim().ToLowerInvariant();
    if (!db.Users.Any(u => u.Email == adminEmail))
    {
        db.Users.Add(new User
        {
            Email = adminEmail,
            PasswordHash = PasswordHasher.Hash(builder.Configuration["AdminAccount:Password"] ?? "Admin@123"),
            FullName = "Quản trị viên",
            Role = "Admin",
        });
        db.SaveChanges();
    }
}

app.UseCors(FrontendPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
