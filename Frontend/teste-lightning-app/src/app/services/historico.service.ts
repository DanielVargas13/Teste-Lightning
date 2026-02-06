import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Historico } from '../models/historico.model';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private historicos$ = new BehaviorSubject<Historico[]>([]);

  constructor(private indexedDBService: IndexedDBService) {
    this.carregarHistoricos();
  }

  async carregarHistoricos(): Promise<void> {
    const historicos = await this.indexedDBService.listarHistoricosDaTarefa(0);
    this.historicos$.next(historicos);
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
