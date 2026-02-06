using TesteLightning.Data;
using TesteLightning.Interfaces;
using TesteLightning.Models;

namespace TesteLightning.Services;

public class ReprogramacaoTarefaService : IReprogramacaoTarefaService
{
    private readonly ApplicationDbContext _context;

    public ReprogramacaoTarefaService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Tarefa> ReprogramarTarefaAsync(int tarefaId, DateTime dataExecucao)
    {
        var tarefa = await _context.Tarefas.FindAsync(tarefaId);
        if (tarefa == null)
            throw new Exception("Tarefa não encontrada");

        // Calcular próxima data
        var novaDataProxima = dataExecucao.AddDays(tarefa.PeriodicidadeDias);

        // Atualizar tarefa
        tarefa.DataAgendada = novaDataProxima;
        tarefa.DataProxima = novaDataProxima;
        tarefa.DataAtualizacao = DateTime.UtcNow;

        _context.Tarefas.Update(tarefa);
        await _context.SaveChangesAsync();

        return tarefa;
    }

    public async Task VerificarEReprogramarTarefasVencidasAsync()
    {
        var tarefasVencidas = _context.Tarefas
            .Where(t => t.Ativo && t.DataProxima <= DateTime.UtcNow)
            .ToList();

        foreach (var tarefa in tarefasVencidas)
        {
            await ReprogramarTarefaAsync(tarefa.Id, DateTime.UtcNow);
        }
    }
}
