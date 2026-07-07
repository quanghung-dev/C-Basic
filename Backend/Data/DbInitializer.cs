using Microsoft.EntityFrameworkCore;
using ProductManagementApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProductManagementApi.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // Tự động tạo DB và apply migrations nếu chưa có
        context.Database.Migrate();

        if (context.Products.Any())
        {
            return;
        }

        var seedProducts = new List<Product>
        {
            new Product { Name = "Laptop Dell XPS 13", Price = 1499.99m, Category = "Electronics", Stock = 15 },
            new Product { Name = "iPhone 15 Pro", Price = 1199.99m, Category = "Electronics", Stock = 20 },
            new Product { Name = "Samsung Galaxy S24 Ultra", Price = 1299.99m, Category = "Electronics", Stock = 18 },
            new Product { Name = "Sony WH-1000XM5", Price = 349.99m, Category = "Electronics", Stock = 25 },
            new Product { Name = "Bàn phím cơ Keychron K2", Price = 99.99m, Category = "Electronics", Stock = 50 },
            new Product { Name = "Chuột không dây Logitech MX Master 3S", Price = 109.99m, Category = "Electronics", Stock = 45 },
            new Product { Name = "Màn hình Dell UltraSharp U2723QE", Price = 549.99m, Category = "Electronics", Stock = 12 },
            new Product { Name = "Áo khoác gió Nike Windrunner", Price = 115.00m, Category = "Clothing", Stock = 30 },
            new Product { Name = "Giày thể thao Adidas Ultraboost Light", Price = 190.00m, Category = "Clothing", Stock = 22 },
            new Product { Name = "Quần jean Levi's 501 Original", Price = 79.50m, Category = "Clothing", Stock = 40 },
            new Product { Name = "Áo thun Polo Lacoste Classic Fit", Price = 95.00m, Category = "Clothing", Stock = 35 },
            new Product { Name = "Balo học sinh Vans Old Skool", Price = 42.00m, Category = "Clothing", Stock = 60 },
            new Product { Name = "Sách Clean Code (Robert C. Martin)", Price = 38.99m, Category = "Books", Stock = 70 },
            new Product { Name = "Sách Design Patterns (Gang of Four)", Price = 54.50m, Category = "Books", Stock = 30 },
            new Product { Name = "Sách Refactoring (Martin Fowler)", Price = 47.99m, Category = "Books", Stock = 25 },
            new Product { Name = "Ghế Ergonomic Herman Miller Aeron", Price = 1495.00m, Category = "Home", Stock = 5 },
            new Product { Name = "Bàn làm việc thông minh nâng hạ Epione", Price = 499.00m, Category = "Home", Stock = 8 },
            new Product { Name = "Máy pha cà phê Nespresso Vertuo Next", Price = 179.00m, Category = "Home", Stock = 15 },
            new Product { Name = "Đèn bàn thông minh Xiaomi Yeelight", Price = 35.00m, Category = "Home", Stock = 40 },
            new Product { Name = "Thảm tập Yoga Adidas 8mm", Price = 29.99m, Category = "Sports", Stock = 50 },
            new Product { Name = "Bộ tạ tay đa năng Bowflex SelectTech 552", Price = 429.00m, Category = "Sports", Stock = 10 },
            new Product { Name = "Bình nước giữ nhiệt Hydro Flask 32 oz", Price = 44.95m, Category = "Sports", Stock = 80 }
        };

        context.Products.AddRange(seedProducts);
        context.SaveChanges();
        Console.WriteLine("Database has been seeded with initial products.");
    }
}
