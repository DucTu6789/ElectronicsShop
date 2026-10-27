using ElectronicsShop.Data;
using ElectronicsShop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsShop.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db) => _db = db;

    // GET api/products?search=iphone
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll([FromQuery] string? search)
    {
        var query = _db.Products.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Brand.Contains(search));

        return await query.OrderByDescending(p => p.Id).ToListAsync();
    }

    // GET api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _db.Products.FindAsync(id);
        return product is null ? NotFound() : product;
    }

    // POST api/products
    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        product.Id = 0; // để database tự tăng Id
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // PUT api/products/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Product product)
    {
        if (id != product.Id) return BadRequest("Id không khớp.");

        var existing = await _db.Products.FindAsync(id);
        if (existing is null) return NotFound();

        _db.Entry(existing).CurrentValues.SetValues(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE api/products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
