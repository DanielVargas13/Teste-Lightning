import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Historico } from '../../models/historico.model';
import { HistoricoService } from '../../services/historico.service';

@Component({
  selector: 'app-historico-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-list.component.html',
  styleUrls: ['./historico-list.component.css']
})
export class HistoricoListComponent implements OnInit {
  historicos: Historico[] = [];
  carregando = false;
  erro: string | null = null;

  constructor(private historicoService: HistoricoService) {}

  ngOnInit(): void {
    this.carregarHistoricos();
  }

  private carregarHistoricos(): void {
    this.carregando = true;
    this.historicoService.getHistoricos$().subscribe({
      next: (dados) => {
        this.historicos = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar histórico:', erro);
        this.erro = 'Erro ao carregar histórico';
        this.carregando = false;
      }
    });
  }

  formatarData(data: Date | undefined): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  formatarHora(hora: string | undefined): string {
    if (!hora) return '';
    return hora;
  }
}
