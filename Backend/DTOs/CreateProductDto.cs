namespace ProductManagementApi.DTOs;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    
    public decimal Price { get; set; }
    
    public string? Category { get; set; }

    public int Stock { get; set; } = 0;
}