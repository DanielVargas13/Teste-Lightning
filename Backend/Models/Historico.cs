namespace TesteLightning.Models;

public class Historico
{
    public int Id { get; set; }
    public int TarefaId { get; set; }
    public DateTime DataExecucao { get; set; } = DateTime.UtcNow;
    public TimeSpan HoraExecucao { get; set; } = DateTime.UtcNow.TimeOfDay;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    
    // Relacionamentos
    // Nota: ColaboradorId removido - crie via Tarefa.Colaborador para evitar ciclo
    public Tarefa? Tarefa { get; set; }
}
