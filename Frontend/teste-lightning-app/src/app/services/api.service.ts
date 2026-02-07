import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Colaborador } from '../models/colaborador.model';
import { Tarefa } from '../models/tarefa.model';
import { Historico } from '../models/historico.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5157/api';
  private readonly TIMEOUT_MS = 5000; // 5 segundos - timeout rápido para detectar offline

  constructor(private http: HttpClient) { }

  /**
   * Converte Observable para Promise com timeout rápido
   * Se não responder em 5s, falha rápido (não espera os 10+ segundos padrão)
   */
  private async toPromiseWithTimeout<T>(obs: Observable<T>): Promise<T | undefined> {
    return obs.pipe(
      timeout(this.TIMEOUT_MS)
    ).toPromise();
  }

  /**
   * Método público para fazer requisição com timeout rápido
   * Usado pelos serviços para falhar rápido quando offline
   */
  async getWithTimeout<T>(observable: Observable<T>): Promise<T | undefined> {
    return this.toPromiseWithTimeout(observable);
  }

  // ========== COLABORADORES ==========
  criarColaborador(colaborador: Colaborador): Observable<Colaborador> {
    return this.http.post<Colaborador>(`${this.apiUrl}/colaborador`, colaborador);
  }

  atualizarColaborador(id: number, colaborador: Colaborador): Observable<Colaborador> {
    return this.http.put<Colaborador>(`${this.apiUrl}/colaborador/${id}`, colaborador);
  }

  obterColaborador(id: number): Observable<Colaborador> {
    return this.http.get<Colaborador>(`${this.apiUrl}/colaborador/${id}`);
  }

  listarColaboradores(): Observable<Colaborador[]> {
    return this.http.get<Colaborador[]>(`${this.apiUrl}/colaborador`);
  }

  deletarColaborador(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/colaborador/${id}`);
  }

  // ========== TAREFAS ==========
  criarTarefa(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(`${this.apiUrl}/tarefa`, tarefa);
  }

  atualizarTarefa(id: number, tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/tarefa/${id}`, tarefa);
  }

  obterTarefa(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/tarefa/${id}`);
  }

  listarTarefas(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/tarefa`);
  }

  listarTarefasPorColaborador(colaboradorId: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}/tarefa/colaborador/${colaboradorId}`);
  }

  deletarTarefa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tarefa/${id}`);
  }

  executarTarefa(id: number): Observable<Tarefa> {
    return this.http.post<Tarefa>(`${this.apiUrl}/tarefa/${id}/executar`, {});
  }

  // ========== HISTÓRICOS ==========
  listarHistoricosDaTarefa(tarefaId: number): Observable<Historico[]> {
    return this.http.get<Historico[]>(`${this.apiUrl}/historico/tarefa/${tarefaId}`);
  }

  listarHistoricosDoColaborador(colaboradorId: number): Observable<Historico[]> {
    return this.http.get<Historico[]>(`${this.apiUrl}/historico/colaborador/${colaboradorId}`);
  }

  listarHistoricosPorPeriodo(dataInicio: Date, dataFim: Date): Observable<Historico[]> {
    const params = {
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString()
    };
    return this.http.get<Historico[]>(`${this.apiUrl}/historico/periodo`, { params });
  }
}
