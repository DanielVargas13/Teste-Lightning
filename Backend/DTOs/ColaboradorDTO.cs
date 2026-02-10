namespace TesteLightning.DTOs;

public class ColaboradorDTO
{
    public int? Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Celular { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public DateTime? DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}
