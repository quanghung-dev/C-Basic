using Npgsql;
using Microsoft.EntityFrameworkCore;
using ProductManagementApi.Data;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/db-test", async () =>
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return Results.BadRequest(new { success = false, message = "Connection string not found." });
    }
    try
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        return Results.Ok(new { success = true, message = "Database connection successful." });
    }
    catch (Exception ex)
    {
        return Results.Problem(title: "Database connection failed", detail: ex.Message, statusCode: 500);
    }
});

app.Run();
