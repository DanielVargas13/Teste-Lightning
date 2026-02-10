using Microsoft.AspNetCore.Mvc;
using TesteLightning.DTOs;
using TesteLightning.Interfaces;

namespace TesteLightning.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TarefaController : ControllerBase
{
    private readonly ITarefaService _tarefaService;

    public TarefaController(ITarefaService tarefaService)
    {
        _tarefaService = tarefaService;
    }

    [HttpPost]
    public async Task<ActionResult<TarefaDTO>> Criar(TarefaDTO tarefaDTO)
    {
        try
        {
            var resultado = await _tarefaService.CriarTarefaAsync(tarefaDTO);
            return CreatedAtAction(nameof(ObterPorId), new { id = resultado.Id }, resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TarefaDTO>> Atualizar(int id, TarefaDTO tarefaDTO)
    {
        try
        {
            var resultado = await _tarefaService.AtualizarTarefaAsync(id, tarefaDTO);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Deletar(int id)
    {
        try
        {
            var resultado = await _tarefaService.DeletarTarefaAsync(id);
            if (!resultado)
                return NotFound(new { mensagem = "Tarefa não encontrada" });

            return Ok(new { mensagem = "Tarefa deletada com sucesso" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TarefaDTO>> ObterPorId(int id)
    {
        try
        {
            var resultado = await _tarefaService.ObterTarefaPorIdAsync(id);
            if (resultado == null)
                return NotFound(new { mensagem = "Tarefa não encontrada" });

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<TarefaDTO>>> Listar()
    {
        try
        {
            var resultado = await _tarefaService.ListarTarefasAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet("colaborador/{colaboradorId}")]
    public async Task<ActionResult<List<TarefaDTO>>> ListarPorColaborador(int colaboradorId)
    {
        try
        {
            var resultado = await _tarefaService.ListarTarefasPorColaboradorAsync(colaboradorId);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpPost("{id}/executar")]
    public async Task<ActionResult<TarefaDTO>> Executar(int id)
    {
        try
        {
            var resultado = await _tarefaService.ExecutarTarefaAsync(id);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}
