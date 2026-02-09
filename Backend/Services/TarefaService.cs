using Microsoft.EntityFrameworkCore;
using TesteLightning.Data;
using TesteLightning.DTOs;
using TesteLightning.Interfaces;
using TesteLightning.Models;

namespace TesteLightning.Services;

public class TarefaService : ITarefaService
{
    private readonly ApplicationDbContext _context;
    private readonly IReprogramacaoTarefaService _reprogramacaoService;

    public TarefaService(ApplicationDbContext context, IReprogramacaoTarefaService reprogramacaoService)
    {
        _context = context;
        _reprogramacaoService = reprogramacaoService;
    }

    public async Task<TarefaDTO> CriarTarefaAsync(TarefaDTO tarefaDTO)
    {
        var tarefa = new Tarefa
        {
            Descricao = tarefaDTO.Descricao,
            ColaboradorId = tarefaDTO.ColaboradorId,
            PeriodicidadeDias = tarefaDTO.PeriodicidadeDias,
            DataAgendada = tarefaDTO.DataAgendada,
            DataProxima = tarefaDTO.DataProxima,
            Ativo = true,
            DataCriacao = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow
        };

        _context.Tarefas.Add(tarefa);
        await _context.SaveChangesAsync();

        tarefaDTO.Id = tarefa.Id;
        return tarefaDTO;
    }

    public async Task<TarefaDTO> AtualizarTarefaAsync(int id, TarefaDTO tarefaDTO)
    {
        var tarefa = await _context.Tarefas.FindAsync(id);
        if (tarefa == null)
            throw new Exception("Tarefa não encontrada");

        tarefa.Descricao = tarefaDTO.Descricao;
        tarefa.PeriodicidadeDias = tarefaDTO.PeriodicidadeDias;
        tarefa.DataAgendada = tarefaDTO.DataAgendada;
        tarefa.DataProxima = tarefaDTO.DataProxima;
        tarefa.Ativo = tarefaDTO.Ativo;
        tarefa.DataAtualizacao = DateTime.UtcNow;

        _context.Tarefas.Update(tarefa);
        await _context.SaveChangesAsync();

        return tarefaDTO;
    }

    public async Task<bool> DeletarTarefaAsync(int id)
    {
        var tarefa = await _context.Tarefas.FindAsync(id);
        if (tarefa == null)
            return false;

        _context.Tarefas.Remove(tarefa);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TarefaDTO?> ObterTarefaPorIdAsync(int id)
    {
        var tarefa = await _context.Tarefas
            .Include(t => t.Colaborador)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tarefa == null)
            return null;

        return new TarefaDTO
        {
            Id = tarefa.Id,
            Descricao = tarefa.Descricao,
            ColaboradorId = tarefa.ColaboradorId,
            PeriodicidadeDias = tarefa.PeriodicidadeDias,
            DataAgendada = tarefa.DataAgendada,
            DataProxima = tarefa.DataProxima,
            Ativo = tarefa.Ativo,
            NomeColaborador = tarefa.Colaborador?.Nome + " " + tarefa.Colaborador?.Sobrenome,
            DataCriacao = tarefa.DataCriacao,
            DataAtualizacao = tarefa.DataAtualizacao
        };
    }

    public async Task<List<TarefaDTO>> ListarTarefasAsync()
    {
        return await _context.Tarefas
            .Include(t => t.Colaborador)
            .Select(t => new TarefaDTO
            {
                Id = t.Id,
                Descricao = t.Descricao,
                ColaboradorId = t.ColaboradorId,
                PeriodicidadeDias = t.PeriodicidadeDias,
                DataAgendada = t.DataAgendada,
                DataProxima = t.DataProxima,
                Ativo = t.Ativo,
                NomeColaborador = t.Colaborador! != null ? t.Colaborador.Nome + " " + t.Colaborador.Sobrenome : "",
                DataCriacao = t.DataCriacao,
                DataAtualizacao = t.DataAtualizacao
            })
            .ToListAsync();
    }

    public async Task<List<TarefaDTO>> ListarTarefasPorColaboradorAsync(int colaboradorId)
    {
        return await _context.Tarefas
            .Where(t => t.ColaboradorId == colaboradorId)
            .Include(t => t.Colaborador)
            .Select(t => new TarefaDTO
            {
                Id = t.Id,
                Descricao = t.Descricao,
                ColaboradorId = t.ColaboradorId,
                PeriodicidadeDias = t.PeriodicidadeDias,
                DataAgendada = t.DataAgendada,
                DataProxima = t.DataProxima,
                Ativo = t.Ativo,
                NomeColaborador = t.Colaborador! != null ? t.Colaborador.Nome + " " + t.Colaborador.Sobrenome : "",
                DataCriacao = t.DataCriacao,
                DataAtualizacao = t.DataAtualizacao
            })
            .ToListAsync();
    }

    public async Task<TarefaDTO> ExecutarTarefaAsync(int tarefaId)
    {
        var tarefa = await _context.Tarefas
            .Include(t => t.Colaborador)
            .FirstOrDefaultAsync(t => t.Id == tarefaId);

        if (tarefa == null)
            throw new Exception("Tarefa não encontrada");

        var historico = new Historico
        {
            TarefaId = tarefaId,
            DataExecucao = DateTime.UtcNow,
            HoraExecucao = DateTime.UtcNow.TimeOfDay,
            DataCriacao = DateTime.UtcNow
        };

        _context.Historicos.Add(historico);

        await _reprogramacaoService.ReprogramarTarefaAsync(tarefaId, DateTime.UtcNow);

        await _context.SaveChangesAsync();

        return new TarefaDTO
        {
            Id = tarefa.Id,
            Descricao = tarefa.Descricao,
            ColaboradorId = tarefa.ColaboradorId,
            PeriodicidadeDias = tarefa.PeriodicidadeDias,
            DataAgendada = tarefa.DataAgendada,
            DataProxima = tarefa.DataProxima,
            Ativo = tarefa.Ativo,
            NomeColaborador = tarefa.Colaborador?.Nome + " " + tarefa.Colaborador?.Sobrenome,
            DataCriacao = tarefa.DataCriacao,
            DataAtualizacao = tarefa.DataAtualizacao
        };
    }
}
