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
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search, 
        [FromQuery] string? category, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 8)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(product => product.Name.ToLower().Contains(normalizedSearch));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(product => product.Category == category);
        }

        int totalItems = await query.CountAsync();
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        int totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

        return Ok(new
        {
            statusCode = 200,
            message = "Success",
            data = products,
            pagination = new
            {
                currentPage = page,
                pageSize = pageSize,
                totalItems = totalItems,
                totalPages = totalPages
            }
        });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Products
            .Where(p => p.Category != null && p.Category != "")
            .Select(p => p.Category)
            .Distinct()
            .ToListAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }
        return Ok(product);
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
