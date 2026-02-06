using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using TesteLightning.Data;
using TesteLightning.Interfaces;
using TesteLightning.Services;

var builder = WebApplication.CreateBuilder(args);

// Adicionar DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar Serviços
builder.Services.AddScoped<IColaboradorService, ColaboradorService>();
builder.Services.AddScoped<ITarefaService, TarefaService>();
builder.Services.AddScoped<IHistoricoService, HistoricoService>();
builder.Services.AddScoped<IReprogramacaoTarefaService, ReprogramacaoTarefaService>();

// Adicionar Controllers
builder.Services.AddControllers();

// Adicionar Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS - Permitir requisições do Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();
