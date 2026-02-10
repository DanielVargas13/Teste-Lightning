export interface Tarefa {
  id?: number;
  descricao: string;
  colaboradorId: number;
  periodicidadeDias: number;
  dataAgendada: Date;
  dataProxima?: Date;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  nomeColaborador?: string;
}
