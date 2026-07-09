using SmartSql;
using Microsoft.AspNetCore.Mvc;
using ProductManagementApi.Models;
using ProductManagementApi.DTOs;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
namespace ProductManagementApi.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ISqlMapper _sqlMapper;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(ISqlMapper sqlMapper, ILogger<ProductsController> logger)
    {
        _sqlMapper = sqlMapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search, 
        [FromQuery] string? category, 
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minStock,
        [FromQuery] int? maxStock,
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 8)
    {
        try
        {
            var offset = (page - 1) * pageSize;
            var requestParams = new
            {
                Search = !string.IsNullOrWhiteSpace(search) ? $"%{search.Trim().ToLower()}%" : null,
                Category = !string.IsNullOrWhiteSpace(category) ? category : null,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                MinStock = minStock,
                MaxStock = maxStock,
                Limit = pageSize,
                Offset = offset
            };

            var productsTask = _sqlMapper.QueryAsync<Product>(new RequestContext
            {
                Scope = "Product",
                SqlId = "GetAll",
                Request = requestParams
            });

            var countTask = _sqlMapper.QuerySingleAsync<int>(new RequestContext
            {
                Scope = "Product",
                SqlId = "GetCount",
                Request = requestParams
            });

            await Task.WhenAll(productsTask, countTask);

            var products = await productsTask;
            var totalItems = await countTask;
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi lấy danh sách sản phẩm.");
            return StatusCode(500, new { success = false, message = ex.ToString() });
        }
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _sqlMapper.QueryAsync<string>(new RequestContext
            {
                Scope = "Product",
                SqlId = "GetCategories"
            });
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi lấy danh mục sản phẩm.");
            return StatusCode(500, new { success = false, message = ex.ToString() });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var products = await _sqlMapper.QueryAsync<Product>(new RequestContext
            {
                Scope = "Product",
                SqlId = "GetById",
                Request = new { Id = id }
            });

            var product = products.FirstOrDefault();
            if (product == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm." });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi lấy thông tin sản phẩm.");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống khi lấy thông tin sản phẩm." });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        try
        {
            var createdProducts = await _sqlMapper.QueryAsync<Product>(new RequestContext
            {
                Scope = "Product",
                SqlId = "Create",
                Request = dto
            });

            var createdProduct = createdProducts.FirstOrDefault();
            if (createdProduct == null)
            {
                return BadRequest(new { success = false, message = "Không thể tạo sản phẩm." });
            }

            return StatusCode(201, new { success = true, message = "Tạo sản phẩm thành công.", data = createdProduct });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi tạo sản phẩm.");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống khi tạo sản phẩm." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
    {
        try
        {
            var updatedProducts = await _sqlMapper.QueryAsync<Product>(new RequestContext
            {
                Scope = "Product",
                SqlId = "Update",
                Request = new
                {
                    Id = id,
                    dto.Name,
                    dto.Price,
                    dto.Category,
                    dto.Stock
                }
            });

            var updatedProduct = updatedProducts.FirstOrDefault();
            if (updatedProduct == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm để cập nhật." });
            }

            return Ok(new { success = true, message = "Cập nhật sản phẩm thành công.", data = updatedProduct });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi cập nhật sản phẩm.");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống khi cập nhật sản phẩm." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var deletedProducts = await _sqlMapper.QueryAsync<Product>(new RequestContext
            {
                Scope = "Product",
                SqlId = "Delete",
                Request = new { Id = id }
            });

            var deletedProduct = deletedProducts.FirstOrDefault();
            if (deletedProduct == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sản phẩm để xóa." });
            }

            return Ok(new { success = true, message = "Xóa sản phẩm thành công.", data = deletedProduct });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi xóa sản phẩm.");
            return StatusCode(500, new { success = false, message = "Đã xảy ra lỗi hệ thống khi xóa sản phẩm." });
        }
    }

}