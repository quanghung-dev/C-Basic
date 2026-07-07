using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagementApi.Controllers;
using ProductManagementApi.Data;
using ProductManagementApi.Models;

namespace ProductManagementApi.Tests;

public class ProductsControllerTests
{
    [Fact]
    public async Task GetAll_FindsPartialName_IgnoringCase()
    {
        await using var context = CreateContext();
        await SeedProducts(context);
        var controller = new ProductsController(context);

        var result = await controller.GetAll("keyCHRON");

        var products = GetProducts(result);
        var product = Assert.Single(products);
        Assert.Equal("Keychron K8", product.Name);
    }

    [Fact]
    public async Task GetAll_TrimsSearchText()
    {
        await using var context = CreateContext();
        await SeedProducts(context);
        var controller = new ProductsController(context);

        var result = await controller.GetAll("  MX Master  ");

        var products = GetProducts(result);
        var product = Assert.Single(products);
        Assert.Equal("Logitech MX Master 3S", product.Name);
    }

    [Fact]
    public async Task GetAll_ReturnsAllProducts_ForWhitespaceSearch()
    {
        await using var context = CreateContext();
        await SeedProducts(context);
        var controller = new ProductsController(context);

        var result = await controller.GetAll("   ");

        Assert.Equal(2, GetProducts(result).Count);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static async Task SeedProducts(AppDbContext context)
    {
        context.Products.AddRange(
            new Product { Name = "Keychron K8", Price = 2_190_000 },
            new Product { Name = "Logitech MX Master 3S", Price = 2_490_000 });
        await context.SaveChangesAsync();
    }

    private static List<Product> GetProducts(IActionResult result)
    {
        var ok = Assert.IsType<OkObjectResult>(result);
        return Assert.IsAssignableFrom<IEnumerable<Product>>(ok.Value).ToList();
    }
}
