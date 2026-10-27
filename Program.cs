using ElectronicsShop.Data;
using ElectronicsShop.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Kết nối database: đọc chuỗi kết nối "DefaultConnection" trong appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Tự động chạy migration + thêm dữ liệu mẫu khi khởi động
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Name = "iPhone 15 128GB", Brand = "Apple", Price = 19990000, Stock = 25, Description = "Màn hình 6.1 inch, chip A16 Bionic, camera 48MP." },
            new Product { Name = "Galaxy S24", Brand = "Samsung", Price = 17490000, Stock = 18, Description = "Màn hình Dynamic AMOLED 2X, tích hợp Galaxy AI." },
            new Product { Name = "MacBook Air M2 13\"", Brand = "Apple", Price = 24990000, Stock = 10, Description = "Chip M2, RAM 8GB, SSD 256GB, pin tới 18 giờ." },
            new Product { Name = "Tai nghe WH-1000XM5", Brand = "Sony", Price = 6490000, Stock = 30, Description = "Chống ồn chủ động, pin 30 giờ." },
            new Product { Name = "Chuột MX Master 3S", Brand = "Logitech", Price = 2290000, Stock = 40, Description = "Chuột không dây công thái học, cuộn siêu êm." },
            new Product { Name = "Màn hình UltraGear 27\"", Brand = "LG", Price = 5990000, Stock = 12, Description = "2K 144Hz IPS, phù hợp làm việc và chơi game." }
        );
        db.SaveChanges();
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseDefaultFiles(); // mở / -> wwwroot/index.html
app.UseStaticFiles();
app.MapControllers();

app.Run();
