export interface Colaborador {
  id?: number;
  nome: string;
  sobrenome: string;
  celular: string;
  endereco: string;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}
