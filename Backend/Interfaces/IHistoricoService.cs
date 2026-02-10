using TesteLightning.DTOs;

namespace TesteLightning.Interfaces;

public interface IHistoricoService
{
    Task<List<HistoricoDTO>> ListarTodosHistoricosAsync();
    Task<List<HistoricoDTO>> ListarHistoricosDaTarefaAsync(int tarefaId);
    Task<List<HistoricoDTO>> ListarHistoricosDoColaboradorAsync(int colaboradorId);
    Task<List<HistoricoDTO>> ListarHistoricosPorPeriodoAsync(DateTime dataInicio, DateTime dataFim);
}
