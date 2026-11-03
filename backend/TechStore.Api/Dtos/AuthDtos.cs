using System.ComponentModel.DataAnnotations;

namespace TechStore.Api.Dtos;

// Quy tắc kiểm tra dùng chung (front-end có bản tương ứng ở src/utils/validators.js)
public static class ValidationRules
{
    // name@domain.tld, không có khoảng trắng
    public const string Email = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";

    // Ít nhất 1 chữ cái và 1 chữ số
    public const string Password = @"^(?=.*[A-Za-z])(?=.*\d).+$";
}

public class LoginRequest
{
    [Required(ErrorMessage = "Vui lòng nhập email")]
    [RegularExpression(ValidationRules.Email, ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    // Khi đăng nhập chỉ cần có mật khẩu, không kiểm tra độ mạnh
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required(ErrorMessage = "Vui lòng nhập email")]
    [StringLength(254, ErrorMessage = "Email tối đa 254 ký tự")]
    [RegularExpression(ValidationRules.Email, ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Mật khẩu từ 8 đến 100 ký tự")]
    [RegularExpression(ValidationRules.Password, ErrorMessage = "Mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số")]
    public string Password { get; set; } = string.Empty;

    // Không bắt buộc (phải khai báo string? để ASP.NET không tự coi là bắt buộc)
    [StringLength(100, ErrorMessage = "Họ tên tối đa 100 ký tự")]
    public string? FullName { get; set; }
}

public record UserDto(int Id, string Email, string FullName, string Role);

public record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
