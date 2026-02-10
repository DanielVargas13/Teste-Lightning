namespace TesteLightning.Models;

public class Colaborador
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Celular { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    public bool Ativo { get; set; } = true;
    public ICollection<Tarefa> Tarefas { get; set; } = new List<Tarefa>();
}
