using System.ComponentModel.DataAnnotations;

namespace ElectronicsShop.Models;

public class Product
{
    public int Id { get; set; }

    [Required, StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Range(0, 1_000_000_000)]
    public decimal Price { get; set; }

    [Range(0, 100000)]
    public int Stock { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }
}
