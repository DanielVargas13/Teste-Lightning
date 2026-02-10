export interface Historico {
  id: number;
  tarefaId: number;
  colaboradorId: number;
  descricaoTarefa: string;
  nomeColaborador: string;
  dataExecucao: Date;
  horaExecucao: string;
  dataCriacao: Date;
}
