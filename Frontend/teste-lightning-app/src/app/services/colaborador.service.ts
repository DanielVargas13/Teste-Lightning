import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Colaborador } from '../models/colaborador.model';
import { ApiService } from './api.service';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  private colaboradores$ = new BehaviorSubject<Colaborador[]>([]);

  constructor(
    private apiService: ApiService,
    private indexedDBService: IndexedDBService
  ) {
    this.carregarColaboradores();
  }

  async criarColaborador(colaborador: Colaborador): Promise<void> {
    // 1. Salvar no IndexedDB imediatamente
    const id = await this.indexedDBService.salvarColaborador(colaborador);
    
    // 2. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Colaborador',
      entityId: id,
      operacao: 'CREATE',
      dados: JSON.stringify(colaborador),
      sincronizado: false
    });

    // 3. Recarregar lista local
    await this.carregarColaboradores();
  }

  async atualizarColaborador(colaborador: Colaborador): Promise<void> {
    // 1. Atualizar no IndexedDB
    await this.indexedDBService.salvarColaborador(colaborador);
    
    // 2. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Colaborador',
      entityId: colaborador.id,
      operacao: 'UPDATE',
      dados: JSON.stringify(colaborador),
      sincronizado: false
    });

    // 3. Recarregar lista local
    await this.carregarColaboradores();
  }

  async deletarColaborador(id: number | undefined): Promise<void> {
    if (!id) return;
    
    // 1. Deletar do IndexedDB
    await this.indexedDBService.deletarColaborador(id);
    
    // 2. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Colaborador',
      entityId: id,
      operacao: 'DELETE',
      dados: null,
      sincronizado: false
    });

    // 3. Recarregar lista local
    await this.carregarColaboradores();
  }

  async carregarColaboradores(): Promise<void> {
    const colaboradores = await this.indexedDBService.listarColaboradores();
    this.colaboradores$.next(colaboradores);
  }

  getColaboradores$(): Observable<Colaborador[]> {
    return this.colaboradores$.asObservable();
  }

  async obterColaborador(id: number): Promise<Colaborador | undefined> {
    return await this.indexedDBService.obterColaborador(id);
  }
}
