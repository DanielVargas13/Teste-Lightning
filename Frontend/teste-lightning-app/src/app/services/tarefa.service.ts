import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tarefa } from '../models/tarefa.model';
import { ApiService } from './api.service';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class TarefaService {
  private tarefas$ = new BehaviorSubject<Tarefa[]>([]);

  constructor(
    private apiService: ApiService,
    private indexedDBService: IndexedDBService
  ) {
    this.carregarTarefas();
  }

  async criarTarefa(tarefa: Tarefa): Promise<void> {
    const id = await this.indexedDBService.salvarTarefa(tarefa);
    
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Tarefa',
      entityId: id,
      operacao: 'CREATE',
      dados: JSON.stringify(tarefa),
      sincronizado: false
    });

    await this.carregarTarefas();
  }

  async atualizarTarefa(tarefa: Tarefa): Promise<void> {
    await this.indexedDBService.salvarTarefa(tarefa);
    
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Tarefa',
      entityId: tarefa.id,
      operacao: 'UPDATE',
      dados: JSON.stringify(tarefa),
      sincronizado: false
    });

    await this.carregarTarefas();
  }

  async deletarTarefa(id: number | undefined): Promise<void> {
    if (!id) return;
    
    await this.indexedDBService.deletarTarefa(id);
    
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Tarefa',
      entityId: id,
      operacao: 'DELETE',
      dados: null,
      sincronizado: false
    });

    await this.carregarTarefas();
  }

  async executarTarefa(id: number | undefined): Promise<void> {
    if (!id) return;
    
    // 1. Recuperar tarefa
    const tarefa = await this.indexedDBService.obterTarefa(id);
    if (!tarefa) return;

    // 2. Atualizar data próxima (reprogramação automática)
    const novaDataProxima = new Date(tarefa.dataAgendada);
    novaDataProxima.setDate(novaDataProxima.getDate() + tarefa.periodicidadeDias);
    
    tarefa.dataProxima = novaDataProxima;
    tarefa.dataAgendada = novaDataProxima;

    // 3. Salvar tarefa reprogramada
    await this.indexedDBService.salvarTarefa(tarefa);

    // 4. Registrar no histórico
    const historico: any = {
      tarefaId: id,
      colaboradorId: tarefa.colaboradorId,
      descricaoTarefa: tarefa.descricao,
      nomeColaborador: '',
      dataExecucao: new Date(),
      horaExecucao: new Date().toLocaleTimeString(),
      dataCriacao: new Date()
    };

    await this.indexedDBService.salvarHistorico(historico);

    // 5. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Tarefa',
      entityId: id,
      operacao: 'EXECUTE',
      dados: JSON.stringify({ tarefa, historico }),
      sincronizado: false
    });

    await this.carregarTarefas();
  }

  async carregarTarefas(): Promise<void> {
    try {
      // Tentar carregar do backend primeiro com timeout rápido (5s)
      const tarefasBackend = await this.apiService.getWithTimeout(
        this.apiService.listarTarefas()
      );
      if (tarefasBackend && Array.isArray(tarefasBackend)) {
        // Se conseguir do backend, atualizar IndexedDB
        for (const tarefa of tarefasBackend) {
          await this.indexedDBService.salvarTarefa(tarefa);
        }
        this.tarefas$.next(tarefasBackend);
        console.log('✅ Tarefas carregadas do backend');
        return;
      }
    } catch (erro) {
      console.warn('⚠️ Backend offline/lento. Carregando tarefas do armazenamento local...', erro);
    }
    
    // Fallback: carregar do IndexedDB (modo offline) - IMEDIATO
    const tarefasLocal = await this.indexedDBService.listarTarefas();
    this.tarefas$.next(tarefasLocal);
    if (tarefasLocal.length > 0) {
      console.log(`📱 ${tarefasLocal.length} tarefas carregadas do armazenamento local (offline)`);
    }
  }

  getTarefas$(): Observable<Tarefa[]> {
    return this.tarefas$.asObservable();
  }

  async obterTarefa(id: number): Promise<Tarefa | undefined> {
    return await this.indexedDBService.obterTarefa(id);
  }

  async listarTarefasPorColaborador(colaboradorId: number): Promise<Tarefa[]> {
    return await this.indexedDBService.listarTarefasPorColaborador(colaboradorId);
  }
}
