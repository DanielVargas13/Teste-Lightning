import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Historico } from '../models/historico.model';
import { IndexedDBService } from './indexeddb.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private historicos$ = new BehaviorSubject<Historico[]>([]);

  constructor(
    private indexedDBService: IndexedDBService,
    private apiService: ApiService
  ) {
    this.carregarHistoricos();
  }

  async carregarHistoricos(): Promise<void> {
    try {
      // Tentar carregar do backend primeiro com timeout rápido (5s)
      const historicosBackend = await this.apiService.getWithTimeout(
        this.apiService.listarHistoricosDaTarefa(0)
      );
      if (historicosBackend && Array.isArray(historicosBackend)) {
        // Se conseguir do backend, atualizar IndexedDB
        for (const historico of historicosBackend) {
          await this.indexedDBService.salvarHistorico(historico);
        }
        this.historicos$.next(historicosBackend);
        console.log('✅ Históricos carregados do backend');
        return;
      }
    } catch (erro) {
      console.warn('⚠️ Backend offline/lento. Usando armazenamento local...', erro);
    }
    
    // Fallback: carregar do IndexedDB (modo offline) - IMEDIATO
    const historicosLocal = await this.indexedDBService.listarHistoricosDaTarefa(0);
    this.historicos$.next(historicosLocal);
    if (historicosLocal.length > 0) {
      console.log(`📱 ${historicosLocal.length} históricos carregados do armazenamento local (offline)`);
    }
  }

  async listarHistoricosDaTarefa(tarefaId: number): Promise<Historico[]> {
    return await this.indexedDBService.listarHistoricosDaTarefa(tarefaId);
  }

  async listarHistoricosDoColaborador(colaboradorId: number): Promise<Historico[]> {
    return await this.indexedDBService.listarHistoricosDoColaborador(colaboradorId);
  }

  getHistoricos$(): Observable<Historico[]> {
    return this.historicos$.asObservable();
  }
}
