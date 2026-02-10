using TesteLightning.DTOs;

namespace TesteLightning.Interfaces;

public interface IColaboradorService
{
    Task<ColaboradorDTO> CriarColaboradorAsync(ColaboradorDTO colaboradorDTO);
    Task<ColaboradorDTO> AtualizarColaboradorAsync(int id, ColaboradorDTO colaboradorDTO);
    Task<bool> DeletarColaboradorAsync(int id);
    Task<ColaboradorDTO?> ObterColaboradorPorIdAsync(int id);
    Task<List<ColaboradorDTO>> ListarColaboradoresAsync();
}
