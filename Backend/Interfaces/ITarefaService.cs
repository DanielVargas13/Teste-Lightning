using TesteLightning.DTOs;

namespace TesteLightning.Interfaces;

public interface ITarefaService
{
    Task<TarefaDTO> CriarTarefaAsync(TarefaDTO tarefaDTO);
    Task<TarefaDTO> AtualizarTarefaAsync(int id, TarefaDTO tarefaDTO);
    Task<bool> DeletarTarefaAsync(int id);
    Task<TarefaDTO?> ObterTarefaPorIdAsync(int id);
    Task<List<TarefaDTO>> ListarTarefasAsync();
    Task<List<TarefaDTO>> ListarTarefasPorColaboradorAsync(int colaboradorId);
    Task<TarefaDTO> ExecutarTarefaAsync(int tarefaId);
}
