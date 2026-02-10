import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarefaService } from '../../../services/tarefa.service';
import { ColaboradorService } from '../../../services/colaborador.service';
import { Tarefa } from '../../../models/tarefa.model';
import { Colaborador } from '../../../models/colaborador.model';
import { TarefaSchema, ValidadorCampos } from '../../../validators/validacao.schemas';
import { ZodError } from 'zod';
import { Observable } from 'rxjs';
import { SincronizacaoService } from '../../../services/sincronizacao.service';

@Component({
  selector: 'app-formulario-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-tarefa.component.html',
  styleUrls: ['./formulario-tarefa.component.css'],
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
    ativo: true,
  };

  colaboradores$: Observable<Colaborador[]>;
  carregando = false;
  erro = '';
  errosCampos: { [key: string]: string } = {};
  modo: 'criar' | 'editar' = 'criar';
  sincronizando$: Observable<boolean>;

  constructor(
    private tarefaService: TarefaService,
    private colaboradorService: ColaboradorService,
    private sincronizacaoService: SincronizacaoService,
  ) {
    this.colaboradores$ = this.colaboradorService.getColaboradores$();
    this.sincronizando$ = this.sincronizacaoService.getSincronizando$();
  }

  ngOnInit() {
    if (this.tarefa) {
      this.modo = 'editar';
      this.formulario = { ...this.tarefa };
      if (this.formulario.dataAgendada) {
        const d = new Date(this.formulario.dataAgendada);
        this.formulario.dataAgendada = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
  }

  async salvarTarefa() {
    this.erro = '';
    this.errosCampos = {};

    const resultado = TarefaSchema.safeParse(this.formulario);

    if (!resultado.success) {
      resultado.error.issues.forEach((err: any) => {
        const campo = err.path[0] as string;
        this.errosCampos[campo] = err.message;
      });
      this.erro = 'Por favor, corrija os erros abaixo';
      return;
    }

    this.carregando = true;

    try {
      if (this.modo === 'criar') {
        await this.tarefaService.criarTarefa(resultado.data);
        this.salvo.emit();
        this.sincronizacaoService.sincronizarAgora();
      } else {
        await this.tarefaService.atualizarTarefa(resultado.data);
        this.salvo.emit();
        this.sincronizacaoService.sincronizarAgora();
      }
    } catch (error) {
      this.erro = 'Erro ao salvar tarefa';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  validarCampo(campo: string): void {
    this.errosCampos[campo] = '';
    const valor = (this.formulario as any)[campo];

    if (valor === undefined || valor === null || valor === '' || valor === 0) {
      return;
    }

    try {
      const validador = (ValidadorCampos as any)[campo];
      if (validador) {
        validador.parse(valor);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        this.errosCampos[campo] = (error.issues[0] as any)?.message || 'Campo inválido';
      }
    }
  }

  validarDescricao(): void {
    this.validarCampo('descricao');
  }

  validarPeriodicidade(): void {
    this.validarCampo('periodicidadeDias');
  }

  validarColaborador(): void {
    this.errosCampos['colaboradorId'] = '';
    if (!this.formulario.colaboradorId || this.formulario.colaboradorId === 0) {
      this.errosCampos['colaboradorId'] = 'Colaborador é obrigatório';
    }
  }

  validarDataAgendada(): void {
    this.errosCampos['dataAgendada'] = '';
    if (!this.formulario.dataAgendada) {
      this.errosCampos['dataAgendada'] = 'Data agendada é obrigatória';
      return;
    }

    try {
      const dataSchema = TarefaSchema.pick({ dataAgendada: true });
      dataSchema.parse({ dataAgendada: new Date(this.formulario.dataAgendada) });
    } catch (error) {
      if (error instanceof ZodError) {
        this.errosCampos['dataAgendada'] = (error.issues[0] as any)?.message || 'Data inválida';
      }
    }
  }

  validarFormulario(): boolean {
    const resultado = TarefaSchema.safeParse(this.formulario);
    return resultado.success;
  }

  cancelar() {
    this.cancelado.emit();
  }
}
