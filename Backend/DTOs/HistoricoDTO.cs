namespace TesteLightning.DTOs;

public class HistoricoDTO
{
    public int Id { get; set; }
    public int TarefaId { get; set; }
    // ColaboradorId mantido aqui para UI, mas será preenchido via join (Tarefa.Colaborador)
    public int ColaboradorId { get; set; }
    public string? DescricaoTarefa { get; set; }
    public string? NomeColaborador { get; set; }
    public DateTime DataExecucao { get; set; }
    public TimeSpan HoraExecucao { get; set; }
    public DateTime DataCriacao { get; set; }
}
