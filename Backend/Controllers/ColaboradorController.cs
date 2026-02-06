using Microsoft.AspNetCore.Mvc;
using TesteLightning.DTOs;
using TesteLightning.Interfaces;

namespace TesteLightning.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColaboradorController : ControllerBase
{
    private readonly IColaboradorService _colaboradorService;

    public ColaboradorController(IColaboradorService colaboradorService)
    {
        _colaboradorService = colaboradorService;
    }

    [HttpPost]
    public async Task<ActionResult<ColaboradorDTO>> Criar(ColaboradorDTO colaboradorDTO)
    {
        try
        {
            var resultado = await _colaboradorService.CriarColaboradorAsync(colaboradorDTO);
            return CreatedAtAction(nameof(ObterPorId), new { id = resultado.Id }, resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ColaboradorDTO>> Atualizar(int id, ColaboradorDTO colaboradorDTO)
    {
        try
        {
            var resultado = await _colaboradorService.AtualizarColaboradorAsync(id, colaboradorDTO);
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
            var resultado = await _colaboradorService.DeletarColaboradorAsync(id);
            if (!resultado)
                return NotFound(new { mensagem = "Colaborador não encontrado" });

            return Ok(new { mensagem = "Colaborador deletado com sucesso" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ColaboradorDTO>> ObterPorId(int id)
    {
        try
        {
            var resultado = await _colaboradorService.ObterColaboradorPorIdAsync(id);
            if (resultado == null)
                return NotFound(new { mensagem = "Colaborador não encontrado" });

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<ColaboradorDTO>>> Listar()
    {
        try
        {
            var resultado = await _colaboradorService.ListarColaboradoresAsync();
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}
