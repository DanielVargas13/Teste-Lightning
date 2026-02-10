import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColaboradorService } from '../../../services/colaborador.service';
import { SincronizacaoService } from '../../../services/sincronizacao.service';
import { Colaborador } from '../../../models/colaborador.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-colaboradores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-colaboradores.component.html',
  styleUrls: ['./lista-colaboradores.component.css']
})
export class ListaColaboradoresComponent implements OnInit {
  @Output() editar = new EventEmitter<Colaborador>();
  @Output() listaAtualizada = new EventEmitter<void>();

  colaboradores$: Observable<Colaborador[]>;
  sincronizando$: Observable<boolean>;
  carregando = false;
  erro = '';

  constructor(
    private colaboradorService: ColaboradorService,
    private sincronizacaoService: SincronizacaoService
  ) {
    this.colaboradores$ = this.colaboradorService.getColaboradores$();
    this.sincronizando$ = this.sincronizacaoService.getSincronizando$();
  }

  ngOnInit() {
    this.sincronizacaoService.sincronizarAgora();
    this.carregarColaboradores();
  }

  async carregarColaboradores() {
    this.carregando = true;
    try {
      await this.colaboradorService.carregarColaboradores();
    } catch (error) {
      this.erro = 'Erro ao carregar colaboradores';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  async deletarColaborador(id: number | undefined) {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja deletar este colaborador?')) {
      try {
        await this.colaboradorService.deletarColaborador(id);
        this.listaAtualizada.emit();
        this.sincronizacaoService.sincronizarAgora();
      } catch (error) {
        this.erro = 'Erro ao deletar colaborador';
        console.error(error);
      }
    }
  }

  editarColaborador(colaborador: Colaborador) {
    this.editar.emit(colaborador);
  }
}
