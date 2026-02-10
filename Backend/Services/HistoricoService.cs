using Microsoft.EntityFrameworkCore;
using TesteLightning.Data;
using TesteLightning.DTOs;
using TesteLightning.Interfaces;

namespace TesteLightning.Services;

public class HistoricoService : IHistoricoService
{
    private readonly ApplicationDbContext _context;

    public HistoricoService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HistoricoDTO>> ListarTodosHistoricosAsync()
    {
        return await _context.Historicos
            .Include(h => h.Tarefa)
            .ThenInclude(t => t.Colaborador)
            .Select(h => new HistoricoDTO
            {
                Id = h.Id,
                TarefaId = h.TarefaId,
                ColaboradorId = h.Tarefa!.ColaboradorId,
                DescricaoTarefa = h.Tarefa!.Descricao,
                NomeColaborador = h.Tarefa!.Colaborador!.Nome + " " + h.Tarefa.Colaborador.Sobrenome,
                DataExecucao = h.DataExecucao,
                HoraExecucao = h.HoraExecucao,
                DataCriacao = h.DataCriacao
            })
            .OrderByDescending(h => h.DataExecucao)
            .ToListAsync();
    }

    public async Task<List<HistoricoDTO>> ListarHistoricosDaTarefaAsync(int tarefaId)
    {
        return await _context.Historicos
            .Where(h => h.TarefaId == tarefaId)
            .Include(h => h.Tarefa)
            .ThenInclude(t => t.Colaborador)
            .Select(h => new HistoricoDTO
            {
                Id = h.Id,
                TarefaId = h.TarefaId,
                ColaboradorId = h.Tarefa!.ColaboradorId,
                DescricaoTarefa = h.Tarefa!.Descricao,
                NomeColaborador = h.Tarefa!.Colaborador!.Nome + " " + h.Tarefa.Colaborador.Sobrenome,
                DataExecucao = h.DataExecucao,
                HoraExecucao = h.HoraExecucao,
                DataCriacao = h.DataCriacao
            })
            .ToListAsync();
    }

    public async Task<List<HistoricoDTO>> ListarHistoricosDoColaboradorAsync(int colaboradorId)
    {
        return await _context.Historicos
            .Include(h => h.Tarefa)
            .ThenInclude(t => t.Colaborador)
            .Where(h => h.Tarefa!.ColaboradorId == colaboradorId)
            .Select(h => new HistoricoDTO
            {
                Id = h.Id,
                TarefaId = h.TarefaId,
                ColaboradorId = h.Tarefa!.ColaboradorId,
                DescricaoTarefa = h.Tarefa!.Descricao,
                NomeColaborador = h.Tarefa!.Colaborador!.Nome + " " + h.Tarefa.Colaborador.Sobrenome,
                DataExecucao = h.DataExecucao,
                HoraExecucao = h.HoraExecucao,
                DataCriacao = h.DataCriacao
            })
            .ToListAsync();
    }

    public async Task<List<HistoricoDTO>> ListarHistoricosPorPeriodoAsync(DateTime dataInicio, DateTime dataFim)
    {
        return await _context.Historicos
            .Where(h => h.DataExecucao >= dataInicio && h.DataExecucao <= dataFim)
            .Include(h => h.Tarefa)
            .ThenInclude(t => t.Colaborador)
            .Select(h => new HistoricoDTO
            {
                Id = h.Id,
                TarefaId = h.TarefaId,
                ColaboradorId = h.Tarefa!.ColaboradorId,
                DescricaoTarefa = h.Tarefa!.Descricao,
                NomeColaborador = h.Tarefa!.Colaborador!.Nome + " " + h.Tarefa.Colaborador.Sobrenome,
                DataExecucao = h.DataExecucao,
                HoraExecucao = h.HoraExecucao,
                DataCriacao = h.DataCriacao
            })
            .OrderByDescending(h => h.DataExecucao)
            .ToListAsync();
    }
}
