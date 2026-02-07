import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarefaService } from '../../../services/tarefa.service';
import { SincronizacaoService } from '../../../services/sincronizacao.service';
import { Tarefa } from '../../../models/tarefa.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-tarefas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-tarefas.component.html',
  styleUrls: ['./lista-tarefas.component.css']
})
export class ListaTarefasComponent implements OnInit {
  @Output() editar = new EventEmitter<Tarefa>();
  @Output() listaAtualizada = new EventEmitter<void>();

  tarefas$: Observable<Tarefa[]>;
  sincronizando$: Observable<boolean>;
  carregando = false;
  erro = '';

  constructor(
    private tarefaService: TarefaService,
    private sincronizacaoService: SincronizacaoService
  ) {
    this.tarefas$ = this.tarefaService.getTarefas$();
    this.sincronizando$ = this.sincronizacaoService.getSincronizando$();
  }

  ngOnInit() {
    this.carregarTarefas();
  }

  async carregarTarefas() {
    this.carregando = true;
    try {
      await this.tarefaService.carregarTarefas();
    } catch (error) {
      this.erro = 'Erro ao carregar tarefas';
      console.error(error);
    } finally {
      this.carregando = false;
    }
  }

  async deletarTarefa(id: number | undefined) {
    if (!id) return;
    
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        // Usar apenas o serviço - ele cuida de tudo (IndexedDB + Fila + Sincronização)
        await this.tarefaService.deletarTarefa(id);
        this.listaAtualizada.emit();
      } catch (error) {
        this.erro = 'Erro ao deletar tarefa';
        console.error(error);
      }
    }
  }

  async executarTarefa(id: number | undefined) {
    if (!id) return;
    
    try {
      // Usar apenas o serviço - ele cuida de tudo (IndexedDB + Fila + Sincronização)
      await this.tarefaService.executarTarefa(id);
      this.listaAtualizada.emit();
    } catch (error) {
      this.erro = 'Erro ao executar tarefa';
      console.error(error);
    }
  }

  editarTarefa(tarefa: Tarefa) {
    this.editar.emit(tarefa);
  }

  formatarData(data: any): string {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }
}
