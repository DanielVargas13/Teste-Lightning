import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColaboradorService } from '../../../services/colaborador.service';
import { Colaborador } from '../../../models/colaborador.model';

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
    if (!this.validarFormulario()) {
      return;
    }

    this.carregando = true;
    this.erro = '';

    try {
      if (this.modo === 'criar') {
        // Usar apenas o serviço - ele cuida de tudo (IndexedDB + Fila + Sincronização)
        await this.colaboradorService.criarColaborador(this.formulario);
        this.salvo.emit();
      } else {
        // Usar apenas o serviço - ele cuida de tudo (IndexedDB + Fila + Sincronização)
        await this.colaboradorService.atualizarColaborador(this.formulario);
        this.salvo.emit();
      }
    } catch (error) {
      this.erro = 'Erro ao salvar colaborador';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  validarFormulario(): boolean {
    if (!this.formulario.nome.trim()) {
      this.erro = 'Nome é obrigatório';
      return false;
    }
    if (!this.formulario.sobrenome.trim()) {
      this.erro = 'Sobrenome é obrigatório';
      return false;
    }
    if (!this.formulario.celular.trim()) {
      this.erro = 'Celular é obrigatório';
      return false;
    }
    if (!this.formulario.endereco.trim()) {
      this.erro = 'Endereço é obrigatório';
      return false;
    }
    return true;
  }

  cancelar() {
    this.cancelado.emit();
  }
}
