using Microsoft.AspNetCore.Mvc;

namespace ProductManagementApi.Controllers;

[ApiController]
[Route("api/screens")]
public class ScreensController : ControllerBase
{
    [HttpGet("products")]
    public IActionResult GetProductsScreen()
    {
        return Ok(new
        {
            screen = "products-list",
            title = "Quan ly san pham",
            dataSources = new
            {
                products = new
                {
                    url = "/api/products",
                    method = "GET"
                },
                categories = new
                {
                    url = "/api/products/categories",
                    method = "GET"
                }
            },
            layout = new
            {
                type = "page",
                children = new object[]
                {
                    new
                    {
                        type = "filterBar",
                        id = "productFilters",
                        columns = 4,
                        fields = new object[]
                        {
                            new
                            {
                                type = "input",
                                name = "search",
                                label = "Name Product",
                                placeholder = "Nhap ten de tim kiem"
                            },
                            new
                            {
                                type = "select",
                                name = "category",
                                label = "Categories",
                                placeholder = "Chon danh muc",
                                source = "categories",
                                allLabel = "Tat ca danh muc"
                            },
                            new
                            {
                                type = "numberRange",
                                name = "price",
                                label = "Khoang gia (d)",
                                minName = "minPrice",
                                maxName = "maxPrice",
                                minPlaceholder = "Tu",
                                maxPlaceholder = "Den"
                            },
                            new
                            {
                                type = "numberRange",
                                name = "stock",
                                label = "Khoang so luong",
                                minName = "minStock",
                                maxName = "maxStock",
                                minPlaceholder = "Tu",
                                maxPlaceholder = "Den"
                            }
                        },
                        actions = new object[]
                        {
                            new
                            {
                                type = "submit",
                                label = "Search",
                                action = "search"
                            },
                            new
                            {
                                type = "navigate",
                                label = "Add Product",
                                to = "/create-product"
                            }
                        }
                    },
                    new
                    {
                        type = "table",
                        id = "productsTable",
                        source = "products",
                        rowKey = "id",
                        pagination = true,
                        columns = new object[]
                        {
                            new { title = "Ten san pham", dataIndex = "name" },
                            new { title = "Danh muc", dataIndex = "category", render = "categoryTag" },
                            new { title = "Gia tien", dataIndex = "price", render = "currency" },
                            new { title = "So luong", dataIndex = "stock", render = "stockTag" },
                            new { title = "Hanh dong", render = "productActions" }
                        }
                    }
                }
            }
        });
    }
}
