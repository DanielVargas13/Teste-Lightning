using TesteLightning.Models;

namespace TesteLightning.Interfaces;

public interface IReprogramacaoTarefaService
{
    Task<Tarefa> ReprogramarTarefaAsync(int tarefaId, DateTime dataExecucao);
    Task VerificarEReprogramarTarefasVencidasAsync();
}
