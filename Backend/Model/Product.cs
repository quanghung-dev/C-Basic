using System.ComponentModel.DataAnnotations.Schema;

namespace ProductManagementApi.Models;

[Table("products")]
public class Product
{
    [Column("id")]
    public int Id {get;set;} 

    [Column("name")]
    public string Name {get;set;} = string.Empty;

    [Column("price")]
    public decimal Price {get;set;}

    [Column("category")]
    public string? Category {get;set;}

    [Column("stock")]
    public int Stock {get;set;} 

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}