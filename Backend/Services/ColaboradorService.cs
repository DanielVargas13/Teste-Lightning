using Microsoft.EntityFrameworkCore;
using TesteLightning.Data;
using TesteLightning.DTOs;
using TesteLightning.Interfaces;
using TesteLightning.Models;

namespace TesteLightning.Services;

public class ColaboradorService : IColaboradorService
{
    private readonly ApplicationDbContext _context;

    public ColaboradorService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ColaboradorDTO> CriarColaboradorAsync(ColaboradorDTO colaboradorDTO)
    {
        var colaborador = new Colaborador
        {
            Nome = colaboradorDTO.Nome,
            Sobrenome = colaboradorDTO.Sobrenome,
            Celular = colaboradorDTO.Celular,
            Endereco = colaboradorDTO.Endereco,
            Ativo = true,
            DataCriacao = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow
        };

        _context.Colaboradores.Add(colaborador);
        await _context.SaveChangesAsync();

        colaboradorDTO.Id = colaborador.Id;
        return colaboradorDTO;
    }

    public async Task<ColaboradorDTO> AtualizarColaboradorAsync(int id, ColaboradorDTO colaboradorDTO)
    {
        var colaborador = await _context.Colaboradores.FindAsync(id);
        if (colaborador == null)
            throw new Exception("Colaborador não encontrado");

        colaborador.Nome = colaboradorDTO.Nome;
        colaborador.Sobrenome = colaboradorDTO.Sobrenome;
        colaborador.Celular = colaboradorDTO.Celular;
        colaborador.Endereco = colaboradorDTO.Endereco;
        colaborador.Ativo = colaboradorDTO.Ativo;
        colaborador.DataAtualizacao = DateTime.UtcNow;

        _context.Colaboradores.Update(colaborador);
        await _context.SaveChangesAsync();

        return colaboradorDTO;
    }

    public async Task<bool> DeletarColaboradorAsync(int id)
    {
        var colaborador = await _context.Colaboradores.FindAsync(id);
        if (colaborador == null)
            return false;

        _context.Colaboradores.Remove(colaborador);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ColaboradorDTO?> ObterColaboradorPorIdAsync(int id)
    {
        var colaborador = await _context.Colaboradores.FindAsync(id);
        if (colaborador == null)
            return null;

        return new ColaboradorDTO
        {
            Id = colaborador.Id,
            Nome = colaborador.Nome,
            Sobrenome = colaborador.Sobrenome,
            Celular = colaborador.Celular,
            Endereco = colaborador.Endereco,
            Ativo = colaborador.Ativo,
            DataCriacao = colaborador.DataCriacao,
            DataAtualizacao = colaborador.DataAtualizacao
        };
    }

    public async Task<List<ColaboradorDTO>> ListarColaboradoresAsync()
    {
        return await _context.Colaboradores
            .Select(c => new ColaboradorDTO
            {
                Id = c.Id,
                Nome = c.Nome,
                Sobrenome = c.Sobrenome,
                Celular = c.Celular,
                Endereco = c.Endereco,
                Ativo = c.Ativo,
                DataCriacao = c.DataCriacao,
                DataAtualizacao = c.DataAtualizacao
            })
            .ToListAsync();
    }
}
