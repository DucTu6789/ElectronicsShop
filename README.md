# TechShop – Web bán hàng điện tử (ASP.NET Core + EF Core + Axios)

Project đơn giản gồm:
- **Back-end**: ASP.NET Core Web API (.NET 8), EF Core + SQL Server
- **Front-end**: HTML/CSS/JS thuần, gọi API bằng **Axios** (đặt trong `wwwroot`, chạy chung với backend)

## 1. Yêu cầu
- .NET 8 SDK trở lên
- SQL Server (LocalDB đi kèm Visual Studio là đủ)

## 2. Chạy project
```bash
cd ElectronicsShop
dotnet restore
dotnet run
```
- Web bán hàng: http://localhost:5000
- Swagger (test API): http://localhost:5000/swagger

Khi chạy, app **tự động chạy migration** để tạo database `ElectronicsShopDb` và thêm 6 sản phẩm mẫu.

## 3. Cấu hình kết nối database
Sửa `ConnectionStrings:DefaultConnection` trong `appsettings.json`:
```json
"DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ElectronicsShopDb;Trusted_Connection=True;TrustServerCertificate=True"
```
Dùng SQL Server cài riêng: đổi `Server=(localdb)\\MSSQLLocalDB` thành `Server=localhost` (hoặc `Server=localhost\\SQLEXPRESS`).
Chuỗi này được đọc trong `Program.cs` qua `UseSqlServer(...)`.

## 4. EF Core & Migration
Các gói đã có trong `.csproj`: `Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Design`.

```bash
dotnet tool install --global dotnet-ef     # cài công cụ (1 lần)
dotnet ef migrations add TenMigration      # tạo migration mới sau khi sửa Model
dotnet ef database update                  # áp dụng migration vào database
dotnet ef migrations remove                # xóa migration cuối (nếu chưa update)
```
Migration `InitialCreate` đã có sẵn trong thư mục `Migrations/`.
Nếu gặp lỗi với migration có sẵn, xóa thư mục `Migrations/` rồi chạy lại `dotnet ef migrations add InitialCreate`.

## 5. API
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/products?search=` | Lấy danh sách (có tìm kiếm) |
| GET | `/api/products/{id}` | Lấy 1 sản phẩm |
| POST | `/api/products` | Thêm sản phẩm |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |

## 6. Cấu trúc
```
ElectronicsShop/
├── Controllers/ProductsController.cs   # GET, POST, PUT, DELETE
├── Models/Product.cs                   # Entity
├── Data/AppDbContext.cs                # DbContext (EF Core)
├── Migrations/                         # Migration
├── wwwroot/                            # index.html, style.css, app.js (Axios)
├── Program.cs                          # Cấu hình DB, middleware, seed data
└── appsettings.json                    # Connection string
```
