using Microsoft.EntityFrameworkCore;
using TesteLightning.Models;

namespace TesteLightning.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Colaborador> Colaboradores { get; set; }
    public DbSet<Tarefa> Tarefas { get; set; }
    public DbSet<Historico> Historicos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Colaborador>()
            .HasKey(c => c.Id);

        modelBuilder.Entity<Colaborador>()
            .Property(c => c.Nome)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<Colaborador>()
            .Property(c => c.Sobrenome)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<Colaborador>()
            .Property(c => c.Celular)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<Colaborador>()
            .Property(c => c.Endereco)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<Tarefa>()
            .HasKey(t => t.Id);

        modelBuilder.Entity<Tarefa>()
            .Property(t => t.Descricao)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<Tarefa>()
            .HasOne(t => t.Colaborador)
            .WithMany(c => c.Tarefas)
            .HasForeignKey(t => t.ColaboradorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Tarefa>()
            .HasIndex(t => t.ColaboradorId)
            .HasDatabaseName("IX_Tarefas_ColaboradorId");

        modelBuilder.Entity<Tarefa>()
            .HasIndex(t => t.DataProxima)
            .HasDatabaseName("IX_Tarefas_DataProxima");

        modelBuilder.Entity<Historico>()
            .HasKey(h => h.Id);

        modelBuilder.Entity<Historico>()
            .HasOne(h => h.Tarefa)
            .WithMany(t => t.Historicos)
            .HasForeignKey(h => h.TarefaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Historico>()
            .HasIndex(h => h.TarefaId)
            .HasDatabaseName("IX_Historicos_TarefaId");

        modelBuilder.Entity<Historico>()
            .HasIndex(h => h.DataExecucao)
            .HasDatabaseName("IX_Historicos_DataExecucao");
    }
}
