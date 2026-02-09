namespace TesteLightning.Models;

public class Historico
{
    public int Id { get; set; }
    public int TarefaId { get; set; }
    public DateTime DataExecucao { get; set; } = DateTime.UtcNow;
    public TimeSpan HoraExecucao { get; set; } = DateTime.UtcNow.TimeOfDay;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public Tarefa? Tarefa { get; set; }
}
