import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';
import { ApiService } from './api.service';
import { ColaboradorService } from './colaborador.service';
import { TarefaService } from './tarefa.service';
import { HistoricoService } from './historico.service';

export interface SincronizacaoStatus {
  sincronizando: boolean;
  ultimaSincronizacao: Date | null;
  pendentes: number;
  erros: number;
  sucesso: number;
}

export interface SincronizacaoMetadata {
  tipo: 'Colaborador' | 'Tarefa' | 'Historico';
  ultimaSincronizacao: Date | null;
  totalItens: number;
}

@Injectable({
  providedIn: 'root'
})
export class SincronizacaoService {
  private sincronizando$ = new BehaviorSubject<boolean>(false);
  private ultimaSincronizacao$ = new BehaviorSubject<Date | null>(null);
  private operacoesPendentes$ = new BehaviorSubject<number>(0);
  private erros$ = new BehaviorSubject<number>(0);
  private sucessos$ = new BehaviorSubject<number>(0);
  private statusGeral$ = new BehaviorSubject<SincronizacaoStatus>({
    sincronizando: false,
    ultimaSincronizacao: null,
    pendentes: 0,
    erros: 0,
    sucesso: 0
  });

  private ultimaSincronizacaoColaboradores$ = new BehaviorSubject<Date | null>(null);
  private ultimaSincronizacaoTarefas$ = new BehaviorSubject<Date | null>(null);
  private ultimaSincronizacaoHistoricos$ = new BehaviorSubject<Date | null>(null);

  private intervaloPooling = 10000; // 10 segundos - reduzido para atualizar dados mais rapidamente
  private tentativasMaximas = 3;

  constructor(
    private indexedDBService: IndexedDBService,
    private apiService: ApiService,
    private colaboradorService: ColaboradorService,
    private tarefaService: TarefaService,
    private historicoService: HistoricoService
  ) {
    this.inicializarServico();
  }

  private inicializarServico(): void {
    // Carregar metadados de sincronização anteriores
    this.carregarMetadadosSincronizacao();
    
    // Sincronizar imediatamente ao iniciar (solução PRIORIDADE 1)
    this.sincronizar();
    
    // Sincronizar a cada 10 segundos (reduzido de 30s para melhor responsividade)
    interval(this.intervaloPooling).subscribe(() => {
      this.sincronizar();
    });
  }

  private async carregarMetadadosSincronizacao(): Promise<void> {
    try {
      const metaColaboradores = await this.indexedDBService.obterUltimaSincronizacao('Colaborador');
      const metaTarefas = await this.indexedDBService.obterUltimaSincronizacao('Tarefa');
      const metaHistoricos = await this.indexedDBService.obterUltimaSincronizacao('Historico');
      
      this.ultimaSincronizacaoColaboradores$.next(metaColaboradores);
      this.ultimaSincronizacaoTarefas$.next(metaTarefas);
      this.ultimaSincronizacaoHistoricos$.next(metaHistoricos);
    } catch (erro) {
      console.error('Erro ao carregar metadados de sincronização:', erro);
    }
  }

  async sincronizar(): Promise<void> {
    if (this.sincronizando$.value) return;
    
    this.sincronizando$.next(true);

    try {
      // 1. Sincronizar dados do backend (polling de recebimento)
      await this.sincronizarDadosBackend();
      
      // 2. Enviar operações pendentes (polling de envio)
      await this.sincronizarOperacoesPendentes();
      
      this.ultimaSincronizacao$.next(new Date());
      this.atualizarStatus();
    } catch (erro) {
      console.error('Erro ao sincronizar:', erro);
    } finally {
      this.sincronizando$.next(false);
    }
  }

  private async sincronizarDadosBackend(): Promise<void> {
    try {
      // Sincronizar colaboradores
      await this.sincronizarColaboradoresBackend();
      
      // Sincronizar tarefas
      await this.sincronizarTarefasBackend();
      
      // Sincronizar históricos
      await this.sincronizarHistoricosBackend();
    } catch (erro) {
      console.error('Erro ao sincronizar dados do backend:', erro);
    }
  }

  private async sincronizarColaboradoresBackend(): Promise<void> {
    try {
      // Obter dados do backend com timeout rápido (5s)
      let colaboradoresBackend = await this.apiService.getWithTimeout(
        this.apiService.listarColaboradores()
      );
      
      if (!colaboradoresBackend) {
        console.warn('Nenhum dado de colaboradores do backend. Mantendo dados locais.');
        return;
      }

      // Obter dados locais
      const colaboradoresLocal = await this.indexedDBService.listarColaboradores();
      const mapaLocal = new Map(colaboradoresLocal.map(c => [c.id, c]));

      let atualizacoes = 0;

      // Processar dados do backend - fazer merge, não recarregar tudo
      for (const colaborador of colaboradoresBackend) {
        const local = mapaLocal.get(colaborador.id);
        
        // Se não existe localmente ou foi modificado no backend, atualizar localmente
        if (!local || this.foiModificadoNoBackend(local, colaborador)) {
          await this.indexedDBService.salvarColaborador(colaborador);
          atualizacoes++;
        }
        
        mapaLocal.delete(colaborador.id);
      }

      // Deletar localmente o que foi deletado no backend
      for (const id of mapaLocal.keys()) {
        if (id !== null && id !== undefined) {
          await this.indexedDBService.deletarColaborador(id);
          atualizacoes++;
        }
      }

      // Atualizar timestamp de sincronização
      if (atualizacoes > 0) {
        await this.indexedDBService.atualizarUltimaSincronizacao('Colaborador');
        const novaData = new Date();
        this.ultimaSincronizacaoColaboradores$.next(novaData);
        
        console.log(`✅ Sincronização de colaboradores: ${atualizacoes} alteração(ões)`);
        // Recarregar APENAS se houve atualizações
        await this.colaboradorService.carregarColaboradores();
      } else {
        console.log(`ℹ️  Colaboradores já sincronizados (sem alterações)`);
      }
    } catch (erro) {
      console.warn('⚠️ Backend offline ou erro ao sincronizar colaboradores. Utilizando dados locais:', erro);
      // Fallback: apenas recarregar do IndexedDB (mantém dados offline)
      await this.colaboradorService.carregarColaboradores();
    }
  }

  private async sincronizarTarefasBackend(): Promise<void> {
    try {
      // Obter dados do backend com timeout rápido (5s)
      let tarefasBackend = await this.apiService.getWithTimeout(
        this.apiService.listarTarefas()
      );
      
      if (!tarefasBackend) {
        console.warn('Nenhum dado de tarefas do backend. Mantendo dados locais.');
        return;
      }

      // Obter dados locais
      const tarefasLocal = await this.indexedDBService.listarTarefas();
      const mapaLocal = new Map(tarefasLocal.map(t => [t.id, t]));

      let atualizacoes = 0;

      // Processar dados do backend - fazer merge, não recarregar tudo
      for (const tarefa of tarefasBackend) {
        const local = mapaLocal.get(tarefa.id);
        
        // Se não existe localmente ou foi modificado no backend, atualizar localmente
        if (!local || this.foiModificadoNoBackend(local, tarefa)) {
          await this.indexedDBService.salvarTarefa(tarefa);
          atualizacoes++;
        }
        
        mapaLocal.delete(tarefa.id);
      }

      // Deletar localmente o que foi deletado no backend
      for (const id of mapaLocal.keys()) {
        if (id !== null && id !== undefined) {
          await this.indexedDBService.deletarTarefa(id);
          atualizacoes++;
        }
      }

      // Atualizar timestamp de sincronização
      if (atualizacoes > 0) {
        await this.indexedDBService.atualizarUltimaSincronizacao('Tarefa');
        const novaData = new Date();
        this.ultimaSincronizacaoTarefas$.next(novaData);
        
        console.log(`✅ Sincronização de tarefas: ${atualizacoes} alteração(ões)`);
        // Recarregar APENAS se houve atualizações
        await this.tarefaService.carregarTarefas();
      } else {
        console.log(`ℹ️  Tarefas já sincronizadas (sem alterações)`);
      }
    } catch (erro) {
      console.warn('⚠️ Backend offline ou erro ao sincronizar tarefas. Utilizando dados locais:', erro);
      // Fallback: apenas recarregar do IndexedDB (mantém dados offline)
      await this.tarefaService.carregarTarefas();
    }
  }

  private async sincronizarHistoricosBackend(): Promise<void> {
    try {
      // Obter todas as tarefas para sincronizar históricos de cada uma
      const tarefasLocal = await this.indexedDBService.listarTarefas();
      const historicosLocal = await this.indexedDBService.listarHistoricos();
      const mapaLocal = new Map(historicosLocal.map(h => [h.id, h]));

      let totalSincronizado = 0;
      let atualizacoes = 0;

      // Para cada tarefa local, sincronizar seus históricos do backend
      for (const tarefa of tarefasLocal) {
        try {
          if (tarefa.id === null || tarefa.id === undefined) continue;
          
          const historicosBackend = await this.apiService.getWithTimeout(
            this.apiService.listarHistoricosDaTarefa(tarefa.id)
          );
          
          if (!historicosBackend) continue;

          totalSincronizado += historicosBackend.length;

          for (const historico of historicosBackend) {
            const local = mapaLocal.get(historico.id);
            
            if (!local || this.foiModificadoNoBackend(local, historico)) {
              await this.indexedDBService.salvarHistorico(historico);
              atualizacoes++;
            }
            
            mapaLocal.delete(historico.id);
          }
        } catch (erro) {
          console.warn(`⚠️ Erro ao sincronizar históricos da tarefa ${tarefa.id}. Mantendo dados locais:`, erro);
        }
      }

      // Atualizar timestamp de sincronização
      if (atualizacoes > 0) {
        await this.indexedDBService.atualizarUltimaSincronizacao('Historico');
        const novaData = new Date();
        this.ultimaSincronizacaoHistoricos$.next(novaData);
        
        console.log(`✅ Sincronização de históricos: ${atualizacoes} alteração(ões)`);
        // Recarregar APENAS se houve atualizações
        await this.historicoService.carregarHistoricos();
      } else {
        console.log(`ℹ️  Históricos já sincronizados (sem alterações)`);
      }
    } catch (erro) {
      console.warn('⚠️ Backend offline ou erro ao sincronizar históricos. Utilizando dados locais:', erro);
      // Fallback: apenas recarregar do IndexedDB (mantém dados offline)
      await this.historicoService.carregarHistoricos();
    }
  }

  private foiModificadoNoBackend(local: any, remoto: any): boolean {
    // Comparar timestamps de modificação
    if (local.dataAtualizacao && remoto.dataAtualizacao) {
      const localTime = new Date(local.dataAtualizacao).getTime();
      const remotoTime = new Date(remoto.dataAtualizacao).getTime();
      return remotoTime > localTime;
    }
    
    // Fallback: comparar versões se existirem
    if (local.versao !== undefined && remoto.versao !== undefined) {
      return remoto.versao > local.versao;
    }
    
    // Fallback: fazer comparação profunda
    return JSON.stringify(local) !== JSON.stringify(remoto);
  }

  private async sincronizarOperacoesPendentes(): Promise<void> {
    const fila = await this.indexedDBService.obterFilaNonSincronizada();
    this.operacoesPendentes$.next(fila.length);

    for (const operacao of fila) {
      try {
        const sucesso = await this.processarOperacao(operacao);
        if (sucesso) {
          await this.indexedDBService.marcarComoSincronizado(operacao.id);
          this.sucessos$.next(this.sucessos$.value + 1);
          console.log(`✅ ${operacao.entityType} ${operacao.operacao} #${operacao.id} sincronizado`);
        } else {
          // Falhou neste ciclo, mantém na fila para retry no próximo ciclo
          console.warn(`⏳ ${operacao.entityType} ${operacao.operacao} offline - retry em 30s`);
        }
      } catch (erro) {
        console.error(`❌ Erro ao processar ${operacao.entityType} #${operacao.id}:`, erro);
      }
    }

    // Limpar apenas operações sincronizadas (retira a operação após sucesso)
    await this.indexedDBService.limparFilaSincronizada();
  }


  private async processarOperacao(operacao: any): Promise<boolean> {
    try {
      const dados = operacao.dados ? JSON.parse(operacao.dados) : null;

      switch (operacao.entityType) {
        case 'Colaborador':
          return await this.processarOperacaoColaborador(operacao, dados);

        case 'Tarefa':
          return await this.processarOperacaoTarefa(operacao, dados);

        default:
          console.warn('Tipo de operação desconhecido:', operacao.entityType);
          return false;
      }
    } catch (erro: any) {
      // Detalhamento melhor do erro
      const status = erro?.status || 'desconhecido';
      const msg = erro?.message || 'erro desconhecido';
      console.error(`Erro ao processar ${operacao.entityType} (${operacao.operacao}): status=${status}, msg=${msg}`);
      return false;
    }
  }

  private async processarOperacaoColaborador(operacao: any, dados: any): Promise<boolean> {
    if (operacao.operacao === 'CREATE') {
      try {
        const resultado = await this.apiService.getWithTimeout(
          this.apiService.criarColaborador(dados)
        );
        if (resultado) {
          dados.id = resultado.id;
          await this.indexedDBService.salvarColaborador(resultado);
          await this.colaboradorService.carregarColaboradores();
          return true;
        }
        return false;
      } catch (erro: any) {
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ CREATE offline - mantém na fila para retry`);
          return false;
        }
        console.warn(`CREATE falhou: ${erro?.status}`);
        return false;
      }
    } else if (operacao.operacao === 'UPDATE') {
      try {
        const resultado = await this.apiService.getWithTimeout(
          this.apiService.atualizarColaborador(dados.id, dados)
        );
        if (resultado) {
          await this.indexedDBService.salvarColaborador(resultado);
          await this.colaboradorService.carregarColaboradores();
          return true;
        }
        return false;
      } catch (erro: any) {
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ UPDATE offline - mantém na fila para retry`);
          return false;
        }
        console.warn(`UPDATE falhou: ${erro?.status}`);
        return false;
      }
    } else if (operacao.operacao === 'DELETE') {
      try {
        await this.apiService.getWithTimeout(
          this.apiService.deletarColaborador(operacao.entityId)
        );
        await this.colaboradorService.carregarColaboradores();
        console.log(`✅ DELETE Colaborador sincronizado com backend`);
        return true;
      } catch (erro: any) {
        // Qualquer erro (rede, timeout, 404, 500) -> manter na fila e tentar depois
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ DELETE Colaborador offline - mantém na fila para retry`);
        } else {
          console.warn(`DELETE Colaborador falhou com erro ${erro?.status} - retry em 30s`);
        }
        return false;
      }
    }
    return false;
  }

  private async processarOperacaoTarefa(operacao: any, dados: any): Promise<boolean> {
    if (operacao.operacao === 'CREATE') {
      try {
        const resultado = await this.apiService.getWithTimeout(
          this.apiService.criarTarefa(dados)
        );
        if (resultado) {
          dados.id = resultado.id;
          await this.indexedDBService.salvarTarefa(resultado);
          await this.tarefaService.carregarTarefas();
          return true;
        }
        return false;
      } catch (erro: any) {
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ CREATE Tarefa offline - mantém na fila para retry`);
          return false;
        }
        console.warn(`CREATE Tarefa falhou: ${erro?.status}`);
        return false;
      }
    } else if (operacao.operacao === 'UPDATE') {
      try {
        const resultado = await this.apiService.getWithTimeout(
          this.apiService.atualizarTarefa(dados.id, dados)
        );
        if (resultado) {
          await this.indexedDBService.salvarTarefa(resultado);
          await this.tarefaService.carregarTarefas();
          return true;
        }
        return false;
      } catch (erro: any) {
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ UPDATE Tarefa offline - mantém na fila para retry`);
          return false;
        }
        console.warn(`UPDATE Tarefa falhou: ${erro?.status}`);
        return false;
      }
    } else if (operacao.operacao === 'EXECUTE') {
      try {
        const resultado = await this.apiService.getWithTimeout(
          this.apiService.executarTarefa(operacao.entityId)
        );
        if (resultado) {
          // Atualizar tarefa reprogramada no IndexedDB
          await this.indexedDBService.salvarTarefa(resultado);
          // Se houver histórico no retorno, salvar também
          if (dados?.historico) {
            await this.indexedDBService.salvarHistorico(dados.historico);
            await this.historicoService.carregarHistoricos();
          }
          await this.tarefaService.carregarTarefas();
          return true;
        }
        return false;
      } catch (erro: any) {
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ EXECUTE Tarefa offline - mantém na fila para retry`);
          return false;
        }
        console.warn(`EXECUTE Tarefa falhou: ${erro?.status}`);
        return false;
      }
    } else if (operacao.operacao === 'DELETE') {
      try {
        await this.apiService.getWithTimeout(
          this.apiService.deletarTarefa(operacao.entityId)
        );
        // Se deletou com sucesso no backend, recarregar lista
        await this.tarefaService.carregarTarefas();
        console.log(`✅ DELETE Tarefa sincronizado com backend`);
        return true;
      } catch (erro: any) {
        // Qualquer erro (rede, timeout, 404, 500) -> manter na fila e tentar depois
        const isNetworkError = (erro?.status === 0) || (erro?.message?.includes('timeout'));
        if (isNetworkError) {
          console.warn(`⏳ DELETE Tarefa offline - mantém na fila para retry`);
        } else {
          console.warn(`DELETE Tarefa falhou com erro ${erro?.status} - retry em 30s`);
        }
        return false;
      }
    }
    return false;
  }

  private atualizarStatus(): void {
    this.statusGeral$.next({
      sincronizando: this.sincronizando$.value,
      ultimaSincronizacao: this.ultimaSincronizacao$.value,
      pendentes: this.operacoesPendentes$.value,
      erros: this.erros$.value,
      sucesso: this.sucessos$.value
    });
  }

  private aguardar(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===== Observables Públicos =====
  getSincronizando$(): Observable<boolean> {
    return this.sincronizando$.asObservable();
  }

  getUltimaSincronizacao$(): Observable<Date | null> {
    return this.ultimaSincronizacao$.asObservable();
  }

  getOperacoesPendentes$(): Observable<number> {
    return this.operacoesPendentes$.asObservable();
  }

  getErros$(): Observable<number> {
    return this.erros$.asObservable();
  }

  getSucessos$(): Observable<number> {
    return this.sucessos$.asObservable();
  }

  getStatusGeral$(): Observable<SincronizacaoStatus> {
    return this.statusGeral$.asObservable();
  }

  // ===== Observables de Sincronização por Tipo =====
  getUltimaSincronizacaoColaboradores$(): Observable<Date | null> {
    return this.ultimaSincronizacaoColaboradores$.asObservable();
  }

  getUltimaSincronizacaoTarefas$(): Observable<Date | null> {
    return this.ultimaSincronizacaoTarefas$.asObservable();
  }

  getUltimaSincronizacaoHistoricos$(): Observable<Date | null> {
    return this.ultimaSincronizacaoHistoricos$.asObservable();
  }

  // ===== Métodos Públicos =====
  async sincronizarAgora(): Promise<void> {
    await this.sincronizar();
  }

  resetarContadores(): void {
    this.operacoesPendentes$.next(0);
    this.erros$.next(0);
    this.sucessos$.next(0);
    this.atualizarStatus();
  }

  setIntervaloPooling(ms: number): void {
    this.intervaloPooling = ms;
  }
}
