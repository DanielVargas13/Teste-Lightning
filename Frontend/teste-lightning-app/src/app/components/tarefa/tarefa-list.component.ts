import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Tarefa } from '../../models/tarefa.model';
import { TarefaService } from '../../services/tarefa.service';

@Component({
  selector: 'app-tarefa-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tarefa-list.component.html',
  styleUrls: ['./tarefa-list.component.css']
})
export class TarefaListComponent implements OnInit {
  tarefas: Tarefa[] = [];
  carregando = false;
  erro: string | null = null;

  constructor(private tarefaService: TarefaService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  private carregarTarefas(): void {
    this.carregando = true;
    this.tarefaService.getTarefas$().subscribe({
      next: (dados) => {
        this.tarefas = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar tarefas:', erro);
        this.erro = 'Erro ao carregar tarefas';
        this.carregando = false;
      }
    });
  }

  async executar(id: number | undefined): Promise<void> {
    if (!id) return;
    
    try {
      await this.tarefaService.executarTarefa(id);
      this.carregarTarefas();
    } catch (erro) {
      this.erro = 'Erro ao executar tarefa';
    }
  }

  async deletar(id: number | undefined): Promise<void> {
    if (!id || !confirm('Tem certeza que deseja deletar?')) return;
    
    try {
      await this.tarefaService.deletarTarefa(id);
      this.carregarTarefas();
    } catch (erro) {
      this.erro = 'Erro ao deletar tarefa';
    }
  }

  formatarData(data: Date | undefined): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
