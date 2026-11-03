using Microsoft.EntityFrameworkCore;
using TechStore.Api.Models;

namespace TechStore.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(100).IsRequired();
            e.Property(c => c.Icon).HasMaxLength(10);
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.Icon).HasMaxLength(10);
            e.Property(p => p.Badge).HasMaxLength(50);
            e.Property(p => p.Description).HasMaxLength(2000);

            e.HasOne(p => p.Category)
             .WithMany(c => c.Products)
             .HasForeignKey(p => p.CategoryId)
             .OnDelete(DeleteBehavior.Restrict); // không cho xóa danh mục còn sản phẩm
        });

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();   // không cho 2 tài khoản trùng email
            e.Property(u => u.Email).HasMaxLength(254).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.FullName).HasMaxLength(100);
            e.Property(u => u.Role).HasMaxLength(20).IsRequired();
        });

        SeedData.Apply(modelBuilder);
    }
}
