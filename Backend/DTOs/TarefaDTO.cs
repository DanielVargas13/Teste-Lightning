namespace TesteLightning.DTOs;

public class TarefaDTO
{
    public int? Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public int ColaboradorId { get; set; }
    public int PeriodicidadeDias { get; set; }
    public DateTime DataAgendada { get; set; }
    public DateTime? DataProxima { get; set; }
    public bool Ativo { get; set; } = true;
    public string? NomeColaborador { get; set; }
    public DateTime? DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}
