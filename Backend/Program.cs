using Npgsql;
using SmartSql;
using SmartSql.ConfigBuilder;
using ProductManagementApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
var configPath = Path.Combine(builder.Environment.ContentRootPath, "SmartSqlConfig.xml");

builder.Services.AddSmartSql((sp, smartSqlBuilder) =>
{
    var properties = new Dictionary<string, string>
    {
        { "DefaultConnection", connectionString }
    };
    smartSqlBuilder.UseProperties((System.Collections.IDictionary)properties)
                   .UseXmlConfig(ResourceType.File, configPath);
});

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
