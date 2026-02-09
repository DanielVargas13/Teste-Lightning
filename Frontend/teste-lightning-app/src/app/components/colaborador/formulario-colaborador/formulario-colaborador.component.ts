import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColaboradorService } from '../../../services/colaborador.service';
import { Colaborador } from '../../../models/colaborador.model';
import { ColaboradorSchema, ValidadorCampos } from '../../../validators/validacao.schemas';
import { ZodError } from 'zod';

@Component({
  selector: 'app-formulario-colaborador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-colaborador.component.html',
  styleUrls: ['./formulario-colaborador.component.css']
})
export class FormularioColaboradorComponent implements OnInit {
  @Input() colaborador: Colaborador | null = null;
  @Output() salvo = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  formulario: Colaborador = {
    nome: '',
    sobrenome: '',
    celular: '',
    endereco: '',
    ativo: true
  };

  carregando = false;
  erro = '';
  errosCampos: { [key: string]: string } = {};
  modo: 'criar' | 'editar' = 'criar';

  constructor(
    private colaboradorService: ColaboradorService
  ) {}

  ngOnInit() {
    if (this.colaborador) {
      this.modo = 'editar';
      this.formulario = { ...this.colaborador };
    }
  }

  async salvarColaborador() {
    this.erro = '';
    this.errosCampos = {};

    const resultado = ColaboradorSchema.safeParse(this.formulario);
    
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
        await this.colaboradorService.criarColaborador(resultado.data);
        this.salvo.emit();
      } else {
        await this.colaboradorService.atualizarColaborador(resultado.data);
        this.salvo.emit();
      }
    } catch (error) {
      this.erro = 'Erro ao salvar colaborador';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  validarCampo(campo: string): void {
    this.errosCampos[campo] = '';
    const valor = (this.formulario as any)[campo];

    if (valor === undefined || valor === null || valor === '') {
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

  validarNome(): void {
    this.validarCampo('nome');
  }

  validarSobrenome(): void {
    this.validarCampo('sobrenome');
  }

  validarCelular(): void {
    this.validarCampo('celular');
  }

  validarEndereco(): void {
    this.validarCampo('endereco');
  }

  validarFormulario(): boolean {
    const resultado = ColaboradorSchema.safeParse(this.formulario);
    return resultado.success;
  }

  cancelar() {
    this.cancelado.emit();
  }
}
