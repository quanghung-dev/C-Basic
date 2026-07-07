using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagementApi.Models;
using ProductManagementApi.DTOs;
using ProductManagementApi.Data;

namespace ProductManagementApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(product => product.Name.ToLower().Contains(normalizedSearch));
        }

        var products = await query.ToListAsync();
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto inputDto)
    {
        var newProduct = new Product
        {
            Name = inputDto.Name,
            Price = inputDto.Price,
            Category = inputDto.Category,
            Stock = inputDto.Stock,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(newProduct);
        await _context.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, newProduct);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto inputDto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        if (inputDto.Name != null) product.Name = inputDto.Name;
        if (inputDto.Price.HasValue) product.Price = inputDto.Price.Value;
        if (inputDto.Category != null) product.Category = inputDto.Category;
        if (inputDto.Stock.HasValue) product.Stock = inputDto.Stock.Value;

        await _context.SaveChangesAsync();
        return Ok(product);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully" });
    }
}
