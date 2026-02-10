using Microsoft.AspNetCore.Mvc;
using TesteLightning.DTOs;
using TesteLightning.Interfaces;

namespace TesteLightning.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoricoController : ControllerBase
{
    private readonly IHistoricoService _historicoService;

    public HistoricoController(IHistoricoService historicoService)
    {
        _historicoService = historicoService;
    }

    [HttpGet]
    public async Task<ActionResult<List<HistoricoDTO>>> ListarTodos()
    {
        try
        {
            var resultado = await _historicoService.ListarTodosHistoricosAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet("tarefa/{tarefaId}")]
    public async Task<ActionResult<List<HistoricoDTO>>> ListarPorTarefa(int tarefaId)
    {
        try
        {
            var resultado = await _historicoService.ListarHistoricosDaTarefaAsync(tarefaId);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet("colaborador/{colaboradorId}")]
    public async Task<ActionResult<List<HistoricoDTO>>> ListarPorColaborador(int colaboradorId)
    {
        try
        {
            var resultado = await _historicoService.ListarHistoricosDoColaboradorAsync(colaboradorId);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet("periodo")]
    public async Task<ActionResult<List<HistoricoDTO>>> ListarPorPeriodo(
        [FromQuery] DateTime dataInicio,
        [FromQuery] DateTime dataFim)
    {
        try
        {
            var resultado = await _historicoService.ListarHistoricosPorPeriodoAsync(dataInicio, dataFim);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}
