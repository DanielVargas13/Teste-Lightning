import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SincronizacaoService {
  private sincronizando$ = new BehaviorSubject<boolean>(false);
  private ultimaSincronizacao$ = new BehaviorSubject<Date | null>(null);

  constructor(
    private indexedDBService: IndexedDBService,
    private apiService: ApiService
  ) {
    this.iniciarPooling();
  }

  private iniciarPooling(): void {
    // Sincronizar a cada 30 segundos
    interval(30000).subscribe(() => {
      this.sincronizar();
    });
  }

  async sincronizar(): Promise<void> {
    this.sincronizando$.next(true);

    try {
      const fila = await this.indexedDBService.obterFilaNonSincronizada();

      for (const operacao of fila) {
        try {
          const sucesso = await this.processarOperacao(operacao);
          
          if (sucesso) {
            await this.indexedDBService.marcarComoSincronizado(operacao.id);
          }
        } catch (erro) {
          console.error('Erro ao sincronizar operação:', erro);
        }
      }

      await this.indexedDBService.limparFilaSincronizada();
      this.ultimaSincronizacao$.next(new Date());
    } finally {
      this.sincronizando$.next(false);
    }
  }

  private async processarOperacao(operacao: any): Promise<boolean> {
    try {
      const dados = JSON.parse(operacao.dados);

      switch (operacao.entityType) {
        case 'Colaborador':
          if (operacao.operacao === 'CREATE') {
            await this.apiService.criarColaborador(dados).toPromise();
          } else if (operacao.operacao === 'UPDATE') {
            await this.apiService.atualizarColaborador(dados.id, dados).toPromise();
          } else if (operacao.operacao === 'DELETE') {
            await this.apiService.deletarColaborador(operacao.entityId).toPromise();
          }
          break;

        case 'Tarefa':
          if (operacao.operacao === 'CREATE') {
            await this.apiService.criarTarefa(dados).toPromise();
          } else if (operacao.operacao === 'UPDATE') {
            await this.apiService.atualizarTarefa(dados.id, dados).toPromise();
          } else if (operacao.operacao === 'EXECUTE') {
            await this.apiService.executarTarefa(operacao.entityId).toPromise();
          } else if (operacao.operacao === 'DELETE') {
            await this.apiService.deletarTarefa(operacao.entityId).toPromise();
          }
          break;

        default:
          return false;
      }

      return true;
    } catch (erro) {
      console.error('Erro ao processar operação:', erro);
      return false;
    }
  }

  getSincronizando$(): Observable<boolean> {
    return this.sincronizando$.asObservable();
  }

  getUltimaSincronizacao$(): Observable<Date | null> {
    return this.ultimaSincronizacao$.asObservable();
  }

  async sincronizarAgora(): Promise<void> {
    await this.sincronizar();
  }
}
