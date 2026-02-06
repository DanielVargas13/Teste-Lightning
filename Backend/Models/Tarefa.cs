namespace TesteLightning.Models;

public class Tarefa
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public int ColaboradorId { get; set; }
    public int PeriodicidadeDias { get; set; }
    public DateTime DataAgendada { get; set; }
    public DateTime? DataProxima { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    
    // Relacionamentos
    public Colaborador? Colaborador { get; set; }
    public ICollection<Historico> Historicos { get; set; } = new List<Historico>();
}
