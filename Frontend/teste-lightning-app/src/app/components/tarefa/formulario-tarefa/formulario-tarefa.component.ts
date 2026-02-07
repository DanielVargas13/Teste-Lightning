import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarefaService } from '../../../services/tarefa.service';
import { ColaboradorService } from '../../../services/colaborador.service';
import { Tarefa } from '../../../models/tarefa.model';
import { Colaborador } from '../../../models/colaborador.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-formulario-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-tarefa.component.html',
  styleUrls: ['./formulario-tarefa.component.css']
})
export class FormularioTarefaComponent implements OnInit {
  @Input() tarefa: Tarefa | null = null;
  @Output() salvo = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formulario: Tarefa = {
    descricao: '',
    colaboradorId: 0,
    periodicidadeDias: 1,
    dataAgendada: new Date(),
    ativo: true
  };

  colaboradores$: Observable<Colaborador[]>;
  carregando = false;
  erro = '';
  modo: 'criar' | 'editar' = 'criar';

  constructor(
    private tarefaService: TarefaService,
    private colaboradorService: ColaboradorService
  ) {
    this.colaboradores$ = this.colaboradorService.getColaboradores$();
  }

  ngOnInit() {
    if (this.tarefa) {
      this.modo = 'editar';
      this.formulario = { ...this.tarefa };
      // Formatar a data para o input
      if (this.formulario.dataAgendada) {
        const d = new Date(this.formulario.dataAgendada);
        this.formulario.dataAgendada = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
  }

  async salvarTarefa() {
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = '';

    try {
      if (this.modo === 'criar') {
        // Usar apenas o serviço - ele cuida de tudo (IndexedDB + Fila + Sincronização)
        await this.tarefaService.criarTarefa(this.formulario);
        this.salvo.emit();
      } else {
        // Usar apenas o serviço - ele cuida de tudo (IndexedDB + Fila + Sincronização)
        await this.tarefaService.atualizarTarefa(this.formulario);
        this.salvo.emit();
      }
    } catch (error) {
      this.erro = 'Erro ao salvar tarefa';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  validarFormulario(): boolean {
    if (!this.formulario.descricao.trim()) {
      this.erro = 'Descrição é obrigatória';
      return false;
    }
    if (!this.formulario.colaboradorId) {
      this.erro = 'Colaborador é obrigatório';
      return false;
    }
    if (!this.formulario.periodicidadeDias || this.formulario.periodicidadeDias <= 0) {
      this.erro = 'Periodicidade deve ser maior que 0';
      return false;
    }
    if (!this.formulario.dataAgendada) {
      this.erro = 'Data agendada é obrigatória';
      return false;
    }
    return true;
  }

  cancelar() {
    this.cancelado.emit();
  }
}
