import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarefaService } from '../../services/tarefa.service';
import { Tarefa } from '../../models/tarefa.model';
import { ListaTarefasComponent } from '../../components/tarefa/lista-tarefas/lista-tarefas.component';
import { FormularioTarefaComponent } from '../../components/tarefa/formulario-tarefa/formulario-tarefa.component';

@Component({
  selector: 'app-tarefas-page',
  standalone: true,
  imports: [CommonModule, ListaTarefasComponent, FormularioTarefaComponent],
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.css']
})
export class TarefasPageComponent implements OnInit {
  mostrarFormulario = false;
  tarefaSelecionada: Tarefa | null = null;

  constructor(private tarefaService: TarefaService) {}

  ngOnInit() {
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.tarefaSelecionada = null;
  }

  fecharFormulario() {
    this.mostrarFormulario = false;
    this.tarefaSelecionada = null;
  }

  editarTarefa(tarefa: Tarefa) {
    this.tarefaSelecionada = tarefa;
    this.mostrarFormulario = true;
  }

  atualizarLista() {
    this.fecharFormulario();
  }
}
