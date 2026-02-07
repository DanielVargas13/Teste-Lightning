import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SincronizacaoService, SincronizacaoStatus } from '../../services/sincronizacao.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-status-sincronizacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-sincronizacao.component.html',
  styleUrls: ['./status-sincronizacao.component.css']
})
export class StatusSincronizacaoComponent implements OnInit {
  statusGeral$: Observable<SincronizacaoStatus>;
  sincronizando$: Observable<boolean>;
  ultimaSincronizacao$: Observable<Date | null>;

  constructor(private sincronizacaoService: SincronizacaoService) {
    this.statusGeral$ = this.sincronizacaoService.getStatusGeral$();
    this.sincronizando$ = this.sincronizacaoService.getSincronizando$();
    this.ultimaSincronizacao$ = this.sincronizacaoService.getUltimaSincronizacao$();
  }

  ngOnInit() {}

  async sincronizarAgora() {
    await this.sincronizacaoService.sincronizarAgora();
  }

  formatarData(data: Date | null): string {
    if (!data) return '-';
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR');
  }
}
