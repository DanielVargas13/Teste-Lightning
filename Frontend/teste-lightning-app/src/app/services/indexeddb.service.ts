import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Colaborador } from '../models/colaborador.model';
import { Tarefa } from '../models/tarefa.model';
import { Historico } from '../models/historico.model';

export class AppDB extends Dexie {
  colaboradores!: Table<Colaborador, number>;
  tarefas!: Table<Tarefa, number>;
  historicos!: Table<Historico, number>;
  sincronizacaoQueue!: Table<any, number>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      colaboradores: '++id',
      tarefas: '++id, colaboradorId',
      historicos: '++id, tarefaId, colaboradorId, dataExecucao',
      sincronizacaoQueue: '++id, sincronizado'
    });
  }
}

export const db = new AppDB();

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  
  // ========== COLABORADORES ==========
  async salvarColaborador(colaborador: Colaborador): Promise<number> {
    return await db.colaboradores.put(colaborador);
  }

  async obterColaborador(id: number): Promise<Colaborador | undefined> {
    return await db.colaboradores.get(id);
  }

  async listarColaboradores(): Promise<Colaborador[]> {
    return await db.colaboradores.toArray();
  }

  async deletarColaborador(id: number): Promise<void> {
    await db.colaboradores.delete(id);
  }

  // ========== TAREFAS ==========
  async salvarTarefa(tarefa: Tarefa): Promise<number> {
    return await db.tarefas.put(tarefa);
  }

  async obterTarefa(id: number): Promise<Tarefa | undefined> {
    return await db.tarefas.get(id);
  }

  async listarTarefas(): Promise<Tarefa[]> {
    return await db.tarefas.toArray();
  }

  async listarTarefasPorColaborador(colaboradorId: number): Promise<Tarefa[]> {
    return await db.tarefas.where('colaboradorId').equals(colaboradorId).toArray();
  }

  async deletarTarefa(id: number): Promise<void> {
    await db.tarefas.delete(id);
  }

  // ========== HISTÓRICOS ==========
  async salvarHistorico(historico: Historico): Promise<number> {
    return await db.historicos.put(historico);
  }

  async listarHistoricosDaTarefa(tarefaId: number): Promise<Historico[]> {
    return await db.historicos.where('tarefaId').equals(tarefaId).toArray();
  }

  async listarHistoricosDoColaborador(colaboradorId: number): Promise<Historico[]> {
    return await db.historicos.where('colaboradorId').equals(colaboradorId).toArray();
  }

  // ========== FILA DE SINCRONIZAÇÃO ==========
  async adicionarNaFila(operacao: any): Promise<number> {
    return await db.sincronizacaoQueue.put(operacao);
  }

  async obterFilaNonSincronizada(): Promise<any[]> {
    return await db.sincronizacaoQueue.where('sincronizado').equals(false as any).toArray();
  }

  async marcarComoSincronizado(id: number): Promise<void> {
    await db.sincronizacaoQueue.update(id, { sincronizado: true });
  }

  async limparFilaSincronizada(): Promise<void> {
    await db.sincronizacaoQueue.where('sincronizado').equals(true as any).delete();
  }
}
