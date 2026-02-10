import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoricoService } from '../../services/historico.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { TarefaService } from '../../services/tarefa.service';
import { ApiService } from '../../services/api.service';
import { Historico } from '../../models/historico.model';
import { Colaborador } from '../../models/colaborador.model';
import { Tarefa } from '../../models/tarefa.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-historico-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoPageComponent implements OnInit {
  historicos: Historico[] = [];
  historicosFiltrados: Historico[] = [];
  
  tarefas$: Observable<Tarefa[]>;
  colaboradores$: Observable<Colaborador[]>;

  filtros = {
    tarefaId: '',
    colaboradorId: '',
    dataInicio: '',
    dataFim: ''
  };

  carregando = false;
  erro = '';

  constructor(
    private historicoService: HistoricoService,
    private colaboradorService: ColaboradorService,
    private tarefaService: TarefaService,
    private apiService: ApiService
  ) {
    this.tarefas$ = this.tarefaService.getTarefas$();
    this.colaboradores$ = this.colaboradorService.getColaboradores$();
  }

  ngOnInit() {
    this.carregarHistorico();
  }

  async carregarHistorico() {
    this.carregando = true;
    this.erro = '';
    try {
      await this.historicoService.carregarHistoricos();
      const historicoObs = this.historicoService.getHistoricos$();
      historicoObs.subscribe(historicos => {
        this.historicos = historicos;
        this.aplicarFiltros();
      });
    } catch (error) {
      this.erro = 'Erro ao carregar histórico';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  aplicarFiltros() {
    this.historicosFiltrados = this.historicos.filter(h => {
      if (this.filtros.tarefaId && h.tarefaId !== parseInt(this.filtros.tarefaId)) {
        return false;
      }
      if (this.filtros.colaboradorId && h.colaboradorId !== parseInt(this.filtros.colaboradorId)) {
        return false;
      }
      if (this.filtros.dataInicio) {
        const dataInicio = new Date(this.filtros.dataInicio);
        const dataExecucao = new Date(h.dataExecucao);
        if (dataExecucao < dataInicio) {
          return false;
        }
      }
      if (this.filtros.dataFim) {
        const dataFim = new Date(this.filtros.dataFim);
        const dataExecucao = new Date(h.dataExecucao);
        if (dataExecucao > dataFim) {
          return false;
        }
      }
      return true;
    });
  }

  limparFiltros() {
    this.filtros = {
      tarefaId: '',
      colaboradorId: '',
      dataInicio: '',
      dataFim: ''
    };
    this.aplicarFiltros();
  }

  formatarData(data: any): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  formatarDataHora(data: any): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
  }
}
