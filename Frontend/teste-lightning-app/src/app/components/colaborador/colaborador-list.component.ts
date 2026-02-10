import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Colaborador } from '../../models/colaborador.model';
import { ColaboradorService } from '../../services/colaborador.service';

@Component({
  selector: 'app-colaborador-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './colaborador-list.component.html',
  styleUrls: ['./colaborador-list.component.css']
})
export class ColaboradorListComponent implements OnInit {
  colaboradores: Colaborador[] = [];
  carregando = false;
  erro: string | null = null;

  constructor(private colaboradorService: ColaboradorService) {}

  ngOnInit(): void {
    this.carregarColaboradores();
  }

  private carregarColaboradores(): void {
    this.carregando = true;
    this.colaboradorService.getColaboradores$().subscribe({
      next: (dados) => {
        this.colaboradores = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar colaboradores:', erro);
        this.erro = 'Erro ao carregar colaboradores';
        this.carregando = false;
      }
    });
  }

  async deletar(id: number | undefined): Promise<void> {
    if (!id || !confirm('Tem certeza que deseja deletar?')) return;
    
    try {
      await this.colaboradorService.deletarColaborador(id);
      this.carregarColaboradores();
    } catch (erro) {
      this.erro = 'Erro ao deletar colaborador';
    }
  }
}
