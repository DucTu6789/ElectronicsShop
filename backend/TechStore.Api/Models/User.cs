namespace TechStore.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;       // luôn lưu chữ thường, không trùng nhau
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;    // không bắt buộc khi đăng ký
    public string Role { get; set; } = "User";              // "Admin" hoặc "User"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
