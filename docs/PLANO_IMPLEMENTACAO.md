# Plano de Implementação - Sistema de Gerenciamento de Colaboradores e Tarefas

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (Angular)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │             Components & Services                │   │
│  │   - ColaboradorComponent                        │   │
│  │   - TarefaComponent                             │   │
│  │   - HistoricoComponent                          │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Persistência Local - IndexedDB         │   │
│  │         (via Dexie.js)                           │   │
│  │  - Colaboradores                                 │   │
│  │  - Tarefas                                       │   │
│  │  - Históricos                                    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Sincronização (Polling/Socket)              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕↕↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│              BACKEND (C# .NET 6+)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │         API Controllers                          │   │
│  │  - ColaboradorController                        │   │
│  │  - TarefaController                             │   │
│  │  - HistoricoController                          │   │
│  │  - SincronizacaoController                      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Services & Business Logic                   │   │
│  │  - ColaboradorService                           │   │
│  │  - TarefaService                                │   │
│  │  - ReprogramacaoTarefaService                   │   │
│  │  - HistoricoService                             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Entity Framework Core (ORM)                   │   │
│  │  - Contexto do BD                               │   │
│  │  - Migrações                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕↕↕ ADO.NET
┌─────────────────────────────────────────────────────────┐
│           SQL Server (Banco de Dados)                    │
│  - Tabela: Colaboradores                               │
│  - Tabela: Tarefas                                     │
│  - Tabela: Historicos                                  │
│  - Tabela: SincronizacaoQueue (opcional)               │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura do Banco de Dados (SQL Server)

### 2.1 Tabela: Colaboradores
```sql
CREATE TABLE Colaboradores (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nome NVARCHAR(100) NOT NULL,
    Sobrenome NVARCHAR(100) NOT NULL,
    Celular NVARCHAR(20) NOT NULL,
    Endereco NVARCHAR(500) NOT NULL,
    DataCriacao DATETIME DEFAULT GETDATE(),
    DataAtualizacao DATETIME DEFAULT GETDATE(),
    Ativo BIT DEFAULT 1
);
```

### 2.2 Tabela: Tarefas
```sql
CREATE TABLE Tarefas (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Descricao NVARCHAR(500) NOT NULL,
    ColaboradorId INT NOT NULL,
    PeriodicidadeDias INT NOT NULL,
    DataAgendada DATETIME NOT NULL,
    DataProxima DATETIME,
    Ativo BIT DEFAULT 1,
    DataCriacao DATETIME DEFAULT GETDATE(),
    DataAtualizacao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ColaboradorId) REFERENCES Colaboradores(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Tarefas_ColaboradorId ON Tarefas(ColaboradorId);
CREATE INDEX IX_Tarefas_DataProxima ON Tarefas(DataProxima);
```

### 2.3 Tabela: Historicos
```sql
CREATE TABLE Historicos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TarefaId INT NOT NULL,
    ColaboradorId INT NOT NULL,
    DataExecucao DATETIME DEFAULT GETDATE(),
    HoraExecucao TIME DEFAULT CAST(GETDATE() AS TIME),
    DataCriacao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TarefaId) REFERENCES Tarefas(Id) ON DELETE CASCADE,
    FOREIGN KEY (ColaboradorId) REFERENCES Colaboradores(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Historicos_TarefaId ON Historicos(TarefaId);
CREATE INDEX IX_Historicos_ColaboradorId ON Historicos(ColaboradorId);
CREATE INDEX IX_Historicos_DataExecucao ON Historicos(DataExecucao);
```

### 2.4 Tabela: Sincronizacao (Opcional - para rastreabilidade)
```sql
CREATE TABLE SincronizacaoQueue (
    Id INT PRIMARY KEY IDENTITY(1,1),
    EntityType NVARCHAR(50) NOT NULL,
    EntityId INT NOT NULL,
    Operacao NVARCHAR(10) NOT NULL,
    Dados NVARCHAR(MAX),
    Sincronizado BIT DEFAULT 0,
    TentativasSincronizacao INT DEFAULT 0,
    DataCriacao DATETIME DEFAULT GETDATE()
);
```

---

## 3. Implementação do Backend (C# .NET)

### 3.1 Estrutura de Pastas
```
Backend/
├── Models/
│   ├── Colaborador.cs
│   ├── Tarefa.cs
│   └── Historico.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   ├── Migrations/
│   └── Seeds/
├── Services/
│   ├── ColaboradorService.cs
│   ├── TarefaService.cs
│   ├── ReprogramacaoTarefaService.cs
│   ├── HistoricoService.cs
│   └── SincronizacaoService.cs
├── Controllers/
│   ├── ColaboradorController.cs
│   ├── TarefaController.cs
│   ├── HistoricoController.cs
│   └── SincronizacaoController.cs
├── DTOs/
│   ├── ColaboradorDTO.cs
│   ├── TarefaDTO.cs
│   └── HistoricoDTO.cs
├── Interfaces/
│   ├── IColaboradorService.cs
│   ├── ITarefaService.cs
│   ├── IHistoricoService.cs
│   └── ISincronizacaoService.cs
└── Program.cs
```

### 3.2 Entity Models

#### Colaborador.cs
```csharp
public class Colaborador
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Sobrenome { get; set; }
    public string Celular { get; set; }
    public string Endereco { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    public bool Ativo { get; set; } = true;
    
    // Relacionamentos
    public ICollection<Tarefa> Tarefas { get; set; } = new List<Tarefa>();
    public ICollection<Historico> Historicos { get; set; } = new List<Historico>();
}
```

#### Tarefa.cs
```csharp
public class Tarefa
{
    public int Id { get; set; }
    public string Descricao { get; set; }
    public int ColaboradorId { get; set; }
    public int PeriodicidadeDias { get; set; }
    public DateTime DataAgendada { get; set; }
    public DateTime? DataProxima { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
    
    // Relacionamentos
    public Colaborador Colaborador { get; set; }
    public ICollection<Historico> Historicos { get; set; } = new List<Historico>();
}
```

#### Historico.cs
```csharp
public class Historico
{
    public int Id { get; set; }
    public int TarefaId { get; set; }
    public int ColaboradorId { get; set; }
    public DateTime DataExecucao { get; set; } = DateTime.UtcNow;
    public TimeSpan HoraExecucao { get; set; } = DateTime.UtcNow.TimeOfDay;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    
    // Relacionamentos
    public Tarefa Tarefa { get; set; }
    public Colaborador Colaborador { get; set; }
}
```

### 3.3 DTOs (Data Transfer Objects)

#### ColaboradorDTO.cs
```csharp
public class ColaboradorDTO
{
    public int? Id { get; set; }
    public string Nome { get; set; }
    public string Sobrenome { get; set; }
    public string Celular { get; set; }
    public string Endereco { get; set; }
    public bool Ativo { get; set; }
}
```

#### TarefaDTO.cs
```csharp
public class TarefaDTO
{
    public int? Id { get; set; }
    public string Descricao { get; set; }
    public int ColaboradorId { get; set; }
    public int PeriodicidadeDias { get; set; }
    public DateTime DataAgendada { get; set; }
    public DateTime? DataProxima { get; set; }
    public bool Ativo { get; set; }
    public string NomeColaborador { get; set; }
}
```

#### HistoricoDTO.cs
```csharp
public class HistoricoDTO
{
    public int Id { get; set; }
    public int TarefaId { get; set; }
    public int ColaboradorId { get; set; }
    public string DescricaoTarefa { get; set; }
    public string NomeColaborador { get; set; }
    public DateTime DataExecucao { get; set; }
    public TimeSpan HoraExecucao { get; set; }
}
```

### 3.4 Serviços Core

#### IReprogramacaoTarefaService.cs
```csharp
public interface IReprogramacaoTarefaService
{
    Task<Tarefa> ReprogramarTarefaAsync(int tarefaId, DateTime dataExecucao);
    Task VerificarEReprogramarTarefasVencidasAsync();
}
```

**Lógica de Reprogramação:**
- Quando um colaborador executa uma tarefa, automaticamente a próxima execução é agendada
- `DataProxima = DataExecucao + PeriodicidadeDias`
- Um histórico é criado registrando execução, colaborador, dia e hora

#### ITarefaService.cs
```csharp
public interface ITarefaService
{
    Task<TarefaDTO> CriarTarefaAsync(TarefaDTO tarefaDTO);
    Task<TarefaDTO> AtualizarTarefaAsync(int id, TarefaDTO tarefaDTO);
    Task<bool> DeletarTarefaAsync(int id);
    Task<TarefaDTO> ObterTarefaPorIdAsync(int id);
    Task<List<TarefaDTO>> ListarTarefasAsync();
    Task<List<TarefaDTO>> ListarTarefasPorColaboradorAsync(int colaboradorId);
    Task<TarefaDTO> ExecutarTarefaAsync(int tarefaId);
}
```

#### IColaboradorService.cs
```csharp
public interface IColaboradorService
{
    Task<ColaboradorDTO> CriarColaboradorAsync(ColaboradorDTO colaboradorDTO);
    Task<ColaboradorDTO> AtualizarColaboradorAsync(int id, ColaboradorDTO colaboradorDTO);
    Task<bool> DeletarColaboradorAsync(int id);
    Task<ColaboradorDTO> ObterColaboradorPorIdAsync(int id);
    Task<List<ColaboradorDTO>> ListarColaboradoresAsync();
}
```

#### IHistoricoService.cs
```csharp
public interface IHistoricoService
{
    Task<List<HistoricoDTO>> ListarHistoricosDaTarefaAsync(int tarefaId);
    Task<List<HistoricoDTO>> ListarHistoricosDoColaboradorAsync(int colaboradorId);
    Task<List<HistoricoDTO>> ListarHistoricosPorPeriodoAsync(DateTime dataInicio, DateTime dataFim);
}
```

### 3.5 Controllers

#### TarefaController.cs (Exemplo)
```csharp
[ApiController]
[Route("api/[controller]")]
public class TarefaController : ControllerBase
{
    private readonly ITarefaService _tarefaService;
    private readonly IReprogramacaoTarefaService _reprogramacaoService;
    
    public TarefaController(ITarefaService tarefaService, IReprogramacaoTarefaService reprogramacaoService)
    {
        _tarefaService = tarefaService;
        _reprogramacaoService = reprogramacaoService;
    }
    
    [HttpPost]
    public async Task<ActionResult<TarefaDTO>> CriarTarefa(TarefaDTO tarefaDTO)
    {
        var resultado = await _tarefaService.CriarTarefaAsync(tarefaDTO);
        return CreatedAtAction(nameof(ObterTarefa), new { id = resultado.Id }, resultado);
    }
    
    [HttpPost("{id}/executar")]
    public async Task<ActionResult<TarefaDTO>> ExecutarTarefa(int id)
    {
        var resultado = await _tarefaService.ExecutarTarefaAsync(id);
        return Ok(resultado);
    }
    
    [HttpGet]
    public async Task<ActionResult<List<TarefaDTO>>> ListarTarefas()
    {
        var tarefas = await _tarefaService.ListarTarefasAsync();
        return Ok(tarefas);
    }
    
    // Outros endpoints...
}
```

### 3.6 Configuração EF Core (Program.cs)
```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Adicionar DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar Serviços
builder.Services.AddScoped<IColaboradorService, ColaboradorService>();
builder.Services.AddScoped<ITarefaService, TarefaService>();
builder.Services.AddScoped<IHistoricoService, HistoricoService>();
builder.Services.AddScoped<IReprogramacaoTarefaService, ReprogramacaoTarefaService>();

// Adicionar Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
        builder.WithOrigins("http://localhost:4200")
               .AllowAnyMethod()
               .AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAngular");
app.MapControllers();
app.Run();
```

---

## 4. Implementação do Frontend (Angular)

### 4.1 Estrutura de Pastas
```
src/app/
├── models/
│   ├── colaborador.model.ts
│   ├── tarefa.model.ts
│   └── historico.model.ts
├── services/
│   ├── api.service.ts
│   ├── colaborador.service.ts
│   ├── tarefa.service.ts
│   ├── historico.service.ts
│   ├── indexeddb.service.ts
│   └── sincronizacao.service.ts
├── components/
│   ├── colaborador/
│   │   ├── colaborador-list/colaborador-list.component.ts
│   │   ├── colaborador-form/colaborador-form.component.ts
│   │   └── colaborador-detail/colaborador-detail.component.ts
│   ├── tarefa/
│   │   ├── tarefa-list/tarefa-list.component.ts
│   │   ├── tarefa-form/tarefa-form.component.ts
│   │   └── tarefa-executar/tarefa-executar.component.ts
│   └── historico/
│       ├── historico-list/historico-list.component.ts
│       └── historico-filtro/historico-filtro.component.ts
├── validators/
│   └── validadores-customizados.ts
└── app.module.ts
```

### 4.2 Models TypeScript

#### colaborador.model.ts
```typescript
export interface Colaborador {
  id?: number;
  nome: string;
  sobrenome: string;
  celular: string;
  endereco: string;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}
```

#### tarefa.model.ts
```typescript
export interface Tarefa {
  id?: number;
  descricao: string;
  colaboradorId: number;
  periodicidadeDias: number;
  dataAgendada: Date;
  dataProxima?: Date;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  nomeColaborador?: string;
}
```

#### historico.model.ts
```typescript
export interface Historico {
  id: number;
  tarefaId: number;
  colaboradorId: number;
  descricaoTarefa: string;
  nomeColaborador: string;
  dataExecucao: Date;
  horaExecucao: string;
  dataCriacao: Date;
}
```

### 4.3 IndexedDB Service (Dexie.js)

#### indexeddb.service.ts
```typescript
import Dexie, { Table } from 'dexie';
import { Colaborador } from '../models/colaborador.model';
import { Tarefa } from '../models/tarefa.model';
import { Historico } from '../models/historico.model';

export class AppDB extends Dexie {
  colaboradores!: Table<Colaborador, number>;
  tarefas!: Table<Tarefa, number>;
  historicos!: Table<Historico, number>;
  sincronizacaoQueue!: Table<any, number>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      colaboradores: '++id',
      tarefas: '++id, colaboradorId',
      historicos: '++id, tarefaId, colaboradorId, dataExecucao',
      sincronizacaoQueue: '++id, sincronizado'
    });
  }
}

export const db = new AppDB();
```

#### indexeddb.service.ts (Injectable)
```typescript
import { Injectable } from '@angular/core';
import { db } from './db';
import { Colaborador } from '../models/colaborador.model';
import { Tarefa } from '../models/tarefa.model';
import { Historico } from '../models/historico.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  
  // Colaboradores
  async salvarColaborador(colaborador: Colaborador): Promise<number> {
    return await db.colaboradores.put(colaborador);
  }

  async obterColaborador(id: number): Promise<Colaborador | undefined> {
    return await db.colaboradores.get(id);
  }

  async listarColaboradores(): Promise<Colaborador[]> {
    return await db.colaboradores.toArray();
  }

  async deletarColaborador(id: number): Promise<void> {
    await db.colaboradores.delete(id);
  }

  // Tarefas
  async salvarTarefa(tarefa: Tarefa): Promise<number> {
    return await db.tarefas.put(tarefa);
  }

  async obterTarefa(id: number): Promise<Tarefa | undefined> {
    return await db.tarefas.get(id);
  }

  async listarTarefas(): Promise<Tarefa[]> {
    return await db.tarefas.toArray();
  }

  async listarTarefasPorColaborador(colaboradorId: number): Promise<Tarefa[]> {
    return await db.tarefas.where('colaboradorId').equals(colaboradorId).toArray();
  }

  async deletarTarefa(id: number): Promise<void> {
    await db.tarefas.delete(id);
  }

  // Históricos
  async salvarHistorico(historico: Historico): Promise<number> {
    return await db.historicos.put(historico);
  }

  async listarHistoricosDaTarefa(tarefaId: number): Promise<Historico[]> {
    return await db.historicos.where('tarefaId').equals(tarefaId).toArray();
  }

  async listarHistoricosDoColaborador(colaboradorId: number): Promise<Historico[]> {
    return await db.historicos.where('colaboradorId').equals(colaboradorId).toArray();
  }

  // Fila de Sincronização
  async adicionarNaFila(operacao: any): Promise<number> {
    return await db.sincronizacaoQueue.put(operacao);
  }

  async obterFilaNonSincronizada(): Promise<any[]> {
    return await db.sincronizacaoQueue.where('sincronizado').equals(false).toArray();
  }

  async marcarComoSincronizado(id: number): Promise<void> {
    await db.sincronizacaoQueue.update(id, { sincronizado: true });
  }

  async limparFilaSincronizada(): Promise<void> {
    await db.sincronizacaoQueue.where('sincronizado').equals(true).delete();
  }
}
```

### 4.4 API Service

#### api.service.ts
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Colaborador } from '../models/colaborador.model';
import { Tarefa } from '../models/tarefa.model';
import { Historico } from '../models/historico.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

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
```

### 4.5 Serviços de Negócio

#### colaborador.service.ts
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Colaborador } from '../models/colaborador.model';
import { ApiService } from './api.service';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  private colaboradores$ = new BehaviorSubject<Colaborador[]>([]);

  constructor(
    private apiService: ApiService,
    private indexedDBService: IndexedDBService
  ) {
    this.carregarColaboradores();
  }

  async criarColaborador(colaborador: Colaborador): Promise<void> {
    // 1. Salvar no IndexedDB imediatamente
    const id = await this.indexedDBService.salvarColaborador(colaborador);
    
    // 2. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Colaborador',
      entityId: id,
      operacao: 'CREATE',
      dados: JSON.stringify(colaborador),
      sincronizado: false
    });

    // 3. Recarregar lista local
    await this.carregarColaboradores();
  }

  async atualizarColaborador(colaborador: Colaborador): Promise<void> {
    // 1. Atualizar no IndexedDB
    await this.indexedDBService.salvarColaborador(colaborador);
    
    // 2. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Colaborador',
      entityId: colaborador.id,
      operacao: 'UPDATE',
      dados: JSON.stringify(colaborador),
      sincronizado: false
    });

    // 3. Recarregar lista local
    await this.carregarColaboradores();
  }

  async deletarColaborador(id: number): Promise<void> {
    // 1. Deletar do IndexedDB
    await this.indexedDBService.deletarColaborador(id);
    
    // 2. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Colaborador',
      entityId: id,
      operacao: 'DELETE',
      dados: null,
      sincronizado: false
    });

    // 3. Recarregar lista local
    await this.carregarColaboradores();
  }

  async carregarColaboradores(): Promise<void> {
    const colaboradores = await this.indexedDBService.listarColaboradores();
    this.colaboradores$.next(colaboradores);
  }

  getColaboradores$(): Observable<Colaborador[]> {
    return this.colaboradores$.asObservable();
  }

  async obterColaborador(id: number): Promise<Colaborador | undefined> {
    return await this.indexedDBService.obterColaborador(id);
  }
}
```

#### tarefa.service.ts (Exemplo simplificado)
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tarefa } from '../models/tarefa.model';
import { ApiService } from './api.service';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class TarefaService {
  private tarefas$ = new BehaviorSubject<Tarefa[]>([]);

  constructor(
    private apiService: ApiService,
    private indexedDBService: IndexedDBService
  ) {
    this.carregarTarefas();
  }

  async criarTarefa(tarefa: Tarefa): Promise<void> {
    const id = await this.indexedDBService.salvarTarefa(tarefa);
    
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Tarefa',
      entityId: id,
      operacao: 'CREATE',
      dados: JSON.stringify(tarefa),
      sincronizado: false
    });

    await this.carregarTarefas();
  }

  async executarTarefa(id: number): Promise<void> {
    // 1. Recuperar tarefa
    const tarefa = await this.indexedDBService.obterTarefa(id);
    if (!tarefa) return;

    // 2. Atualizar data próxima (reprogramação automática)
    const novaDataProxima = new Date(tarefa.dataAgendada);
    novaDataProxima.setDate(novaDataProxima.getDate() + tarefa.periodicidadeDias);
    
    tarefa.dataProxima = novaDataProxima;
    tarefa.dataAgendada = novaDataProxima;

    // 3. Salvar tarefa reprogramada
    await this.indexedDBService.salvarTarefa(tarefa);

    // 4. Registrar no histórico
    const historico = {
      tarefaId: id,
      colaboradorId: tarefa.colaboradorId,
      descricaoTarefa: tarefa.descricao,
      nomeColaborador: '', // Preenchido depois
      dataExecucao: new Date(),
      horaExecucao: new Date().toLocaleTimeString(),
      dataCriacao: new Date()
    };

    await this.indexedDBService.salvarHistorico(historico);

    // 5. Adicionar à fila de sincronização
    await this.indexedDBService.adicionarNaFila({
      entityType: 'Tarefa',
      entityId: id,
      operacao: 'EXECUTE',
      dados: JSON.stringify({ tarefa, historico }),
      sincronizado: false
    });

    await this.carregarTarefas();
  }

  async carregarTarefas(): Promise<void> {
    const tarefas = await this.indexedDBService.listarTarefas();
    this.tarefas$.next(tarefas);
  }

  getTarefas$(): Observable<Tarefa[]> {
    return this.tarefas$.asObservable();
  }
}
```

### 4.6 Sincronização Service

#### sincronizacao.service.ts
```typescript
import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import { ApiService } from './api.service';
import { interval, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SincronizacaoService {
  private sincronizando$ = new BehaviorSubject<boolean>(false);
  private ultimaSincronizacao$ = new BehaviorSubject<Date | null>(null);

  constructor(
    private indexedDBService: IndexedDBService,
    private apiService: ApiService
  ) {
    this.iniciarPooling();
  }

  private iniciarPooling(): void {
    // Sincronizar a cada 30 segundos
    interval(30000).subscribe(() => {
      this.sincronizar();
    });
  }

  async sincronizar(): Promise<void> {
    this.sincronizando$.next(true);

    try {
      const fila = await this.indexedDBService.obterFilaNonSincronizada();

      for (const operacao of fila) {
        try {
          const sucesso = await this.processarOperacao(operacao);
          
          if (sucesso) {
            await this.indexedDBService.marcarComoSincronizado(operacao.id);
          }
        } catch (erro) {
          console.error('Erro ao sincronizar operação:', erro);
        }
      }

      await this.indexedDBService.limparFilaSincronizada();
      this.ultimaSincronizacao$.next(new Date());
    } finally {
      this.sincronizando$.next(false);
    }
  }

  private async processarOperacao(operacao: any): Promise<boolean> {
    const dados = JSON.parse(operacao.dados);

    switch (operacao.entityType) {
      case 'Colaborador':
        if (operacao.operacao === 'CREATE') {
          await this.apiService.criarColaborador(dados).toPromise();
        } else if (operacao.operacao === 'UPDATE') {
          await this.apiService.atualizarColaborador(dados.id, dados).toPromise();
        } else if (operacao.operacao === 'DELETE') {
          await this.apiService.deletarColaborador(operacao.entityId).toPromise();
        }
        break;

      case 'Tarefa':
        if (operacao.operacao === 'CREATE') {
          await this.apiService.criarTarefa(dados).toPromise();
        } else if (operacao.operacao === 'UPDATE') {
          await this.apiService.atualizarTarefa(dados.id, dados).toPromise();
        } else if (operacao.operacao === 'EXECUTE') {
          await this.apiService.executarTarefa(operacao.entityId).toPromise();
        } else if (operacao.operacao === 'DELETE') {
          await this.apiService.deletarTarefa(operacao.entityId).toPromise();
        }
        break;

      default:
        return false;
    }

    return true;
  }

  getSincronizando$(): Observable<boolean> {
    return this.sincronizando$.asObservable();
  }

  getUltimaSincronizacao$(): Observable<Date | null> {
    return this.ultimaSincronizacao$.asObservable();
  }

  async sincronizarAgora(): Promise<void> {
    await this.sincronizar();
  }
}
```

### 4.7 Validadores Frontend

#### validadores-customizados.ts
```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidadoresCustomizados {
  
  static celularValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const celular = control.value.replace(/\D/g, '');
      
      // Validar se tem 11 dígitos (formato brasileiro)
      if (celular.length !== 11) {
        return { celularInvalido: true };
      }
      
      // Validar se o segundo dígito é 9 (celular)
      if (celular[1] !== '9') {
        return { naoEhCelular: true };
      }
      
      return null;
    };
  }

  static enderecoValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const endereco = control.value.trim();
      
      // Mínimo 10 caracteres
      if (endereco.length < 10) {
        return { enderecoMuitoCurto: true };
      }
      
      return null;
    };
  }

  static periodicidadeValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const periodicidade = parseInt(control.value, 10);
      
      // Deve ser entre 1 e 365 dias
      if (periodicidade < 1 || periodicidade > 365) {
        return { periodicidadeInvalida: true };
      }
      
      return null;
    };
  }

  static dataFuturaValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const data = new Date(control.value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (data < hoje) {
        return { dataPassada: true };
      }
      
      return null;
    };
  }
}
```

### 4.8 Exemplo de Component (Tarefa Form)

#### tarefa-form.component.ts
```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TarefaService } from '../../services/tarefa.service';
import { ColaboradorService } from '../../services/colaborador.service';
import { Tarefa } from '../../models/tarefa.model';
import { Colaborador } from '../../models/colaborador.model';
import { ValidadoresCustomizados } from '../../validators/validadores-customizados';

@Component({
  selector: 'app-tarefa-form',
  templateUrl: './tarefa-form.component.html',
  styleUrls: ['./tarefa-form.component.css']
})
export class TarefaFormComponent implements OnInit {
  formulario!: FormGroup;
  colaboradores: Colaborador[] = [];
  carregando = false;
  erro: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private tarefaService: TarefaService,
    private colaboradorService: ColaboradorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.criarFormulario();
  }

  ngOnInit(): void {
    this.carregarColaboradores();
  }

  private criarFormulario(): void {
    this.formulario = this.formBuilder.group({
      descricao: ['', [Validators.required, Validators.minLength(5)]],
      colaboradorId: ['', Validators.required],
      periodicidadeDias: ['', [Validators.required, ValidadoresCustomizados.periodicidadeValida()]],
      dataAgendada: ['', [Validators.required, ValidadoresCustomizados.dataFuturaValida()]]
    });
  }

  async carregarColaboradores(): Promise<void> {
    const colaborador$ = this.colaboradorService.getColaboradores$();
    colaborador$.subscribe(colaboradores => {
      this.colaboradores = colaboradores;
    });
  }

  async salvar(): Promise<void> {
    if (this.formulario.invalid) {
      this.erro = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    this.carregando = true;
    this.erro = null;

    try {
      const tarefa: Tarefa = this.formulario.value;
      await this.tarefaService.criarTarefa(tarefa);
      this.router.navigate(['/tarefas']);
    } catch (erro) {
      this.erro = 'Erro ao salvar tarefa. Tente novamente.';
      console.error(erro);
    } finally {
      this.carregando = false;
    }
  }

  cancelar(): void {
    this.router.navigate(['/tarefas']);
  }
}
```

---

## 5. Fluxos de Operação

### 5.1 Fluxo de Criação de Colaborador

```
┌─────────────────────────────────────┐
│   Usuário preenche formulário       │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ Validações Frontend (obrigatório)   │
│ - Nome, Sobrenome obrigatórios      │
│ - Celular no formato válido         │
│ - Endereço com mínimo 10 caracteres │
└────────────────┬────────────────────┘
                 ↓ (Válido)
┌─────────────────────────────────────┐
│   Salvar no IndexedDB                │
│   (sucesso imediato da UI)           │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Adicionar à Fila de Sincronização  │
│  (status: não sincronizado)         │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  Atualizar lista na UI (RxJS)       │
└────────────────┬────────────────────┘
                 ↓
        (Aguarda sincronização)
                 ↓
┌─────────────────────────────────────┐
│  Polling (a cada 30s)               │
│  Enviar para API                    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  API: Validações Backend            │
│  Salvar no SQL Server               │
└────────────────┬────────────────────┘
                 ↓ (Sucesso)
┌─────────────────────────────────────┐
│  Marcar como Sincronizado no IDB    │
└─────────────────────────────────────┘
```

### 5.2 Fluxo de Execução de Tarefa (Reprogramação Automática)

```
┌──────────────────────────────────┐
│   Usuário clica em "Executar"    │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│ Frontend: Recuperar Tarefa do IDB │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│ Calcular próxima data:           │
│ DataProxima = DataAtual +        │
│              PeriodicidadeDias   │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│ Atualizar Tarefa no IndexedDB    │
│ - dataAgendada = novaData        │
│ - dataProxima = novaData         │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│ Criar Histórico no IndexedDB     │
│ - tarefaId: ID da tarefa        │
│ - colaboradorId: ID do executor │
│ - dataExecucao: NOW             │
│ - horaExecucao: NOW             │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│ Adicionar à Fila de Sync         │
│ (Operação: EXECUTE)             │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│ UI Atualizada (Tarefas + Hist.)  │
└────────────┬─────────────────────┘
             ↓
      (Polling - 30s)
             ↓
┌──────────────────────────────────┐
│ API: Executar Tarefa             │
│ - Atualizar Tarefa no SQL        │
│ - Criar Histórico no SQL         │
│ - Disparar Reprogramação Backend │
│   (Service: ReprogramacaoSvc)    │
└──────────────────────────────────┘
```

### 5.3 Fluxo de Sincronização

```
┌────────────────────────────────────┐
│  Iniciar Polling (30 segundos)     │
└────────────┬──────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Verificar Fila no IndexedDB        │
│  WHERE sincronizado = false        │
└────────────┬──────────────────────┘
             ↓
     (Se encontrou itens)
             ↓
┌────────────────────────────────────┐
│  Para cada operação na fila:       │
│  - Recuperar dados completos       │
│  - Determinar tipo (CRUD/EXECUTE)  │
└────────────┬──────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Chamar endpoint apropriado da API│
│  - POST/PUT/DELETE com dados      │
└────────────┬──────────────────────┘
             ↓
     (Se sucesso HTTP 2xx)
             ↓
┌────────────────────────────────────┐
│  Marcar como sincronizado no IDB   │
└────────────┬──────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Limpar registros sincronizados    │
│  (opcional)                        │
└────────────┬──────────────────────┘
             ↓
┌────────────────────────────────────┐
│  Atualizar timestamp última synch  │
└────────────┬──────────────────────┘
             ↓
   (Aguarda próximo ciclo)
```

---

## 6. Validações

### 6.1 Validações Frontend (Obrigatórias)
- **Colaborador:**
  - Nome: obrigatório, máx 100 caracteres
  - Sobrenome: obrigatório, máx 100 caracteres
  - Celular: obrigatório, formato válido (11 dígitos, começa com 9 no Brasil)
  - Endereço: obrigatório, mínimo 10 caracteres, máx 500

- **Tarefa:**
  - Descricção: obrigatória, mínimo 5 caracteres, máx 500
  - Colaborador: obrigatória seleção
  - Periodicidade: obrigatória, entre 1 e 365 dias
  - Data Agendada: obrigatória, não pode ser data passada

### 6.2 Validações Backend (Reforço)
- Validar DTOs com Data Annotations
- Verificar integridade referencial
- Confirmar que tarefa tem apenas um executante por vez
- Validar periodicidade e datas

### 6.3 Exemplo (Data Annotations em DTOs)
```csharp
public class TarefaDTO
{
    [Required(ErrorMessage = "Descrição é obrigatória")]
    [StringLength(500, MinimumLength = 5, 
        ErrorMessage = "Descrição deve ter entre 5 e 500 caracteres")]
    public string Descricao { get; set; }

    [Range(1, 365, ErrorMessage = "Periodicidade deve estar entre 1 e 365 dias")]
    public int PeriodicidadeDias { get; set; }

    [Required(ErrorMessage = "Data agendada é obrigatória")]
    [DataType(DataType.DateTime)]
    public DateTime DataAgendada { get; set; }
}
```

---

## 7. Tecnologias Específicas

### 7.1 Backend
- **.NET 6 ou 7**: Framework moderno, performance
- **Entity Framework Core**: ORM, migrações automáticas
- **SQL Server**: Banco robusto, índices
- **Dependency Injection**: Nativo no .NET
- **Async/Await**: Operações não-bloqueantes

### 7.2 Frontend
- **Angular 15+**: Framework robusto
- **RxJS**: Reactive programming, observables
- **TypeScript**: Type-safe
- **Dexie.js**: IndexedDB wrapper intuitivo
- **Reactive Forms**: Validações dinâmicas

### 7.3 Comunicação
- **HTTP Client**: Requisições REST
- **CORS**: Habilitado no backend
- **Polling**: 30 segundos entre sincronizações
- **WebSocket** (alternativa): Real-time para futuras melhorias

---

## 8. Checklist de Implementação

### Fase 1: Preparação (Semana 1)
- [ ] Criar solução .NET (Backend)
- [ ] Criar projeto Angular
- [ ] Configurar git e repositório
- [ ] Instalar dependências (npm, NuGet)

### Fase 2: Backend - Estrutura Base (Semana 1-2)
- [ ] Criar models (Colaborador, Tarefa, Histórico)
- [ ] Configurar DbContext (EF Core)
- [ ] Criar migrations do banco
- [ ] Criar DTOs
- [ ] Registrar serviços (DI)

### Fase 3: Backend - API (Semana 2-3)
- [ ] Implementar ColaboradorController
- [ ] Implementar TarefaController
- [ ] Implementar HistoricoController
- [ ] Configurar CORS
- [ ] Testes básicos de API

### Fase 4: Frontend - Estrutura (Semana 2-3)
- [ ] Criar componentes principais
- [ ] Configurar Dexie.js e IndexedDB
- [ ] Criar models TypeScript
- [ ] Implementar IndexedDBService
- [ ] Implementar ApiService

### Fase 5: Frontend - Serviços (Semana 3-4)
- [ ] ColaboradorService
- [ ] TarefaService
- [ ] HistoricoService
- [ ] SincronizacaoService
- [ ] Validadores customizados

### Fase 6: Frontend - Componentes (Semana 4-5)
- [ ] Formulário de Colaborador
- [ ] Listagem de Colaboradores
- [ ] Formulário de Tarefa
- [ ] Listagem de Tarefas
- [ ] Componente de Execução de Tarefa
- [ ] Visualizador de Histórico

### Fase 7: Integração e Testes (Semana 5-6)
- [ ] Testar fluxo completo (criar, sincronizar, executar)
- [ ] Testes offline (desligar API, verificar IDB)
- [ ] Testes de reprogramação automática
- [ ] Performance IndexedDB
- [ ] Tratamento de erros

### Fase 8: Polimento (Semana 6)
- [ ] UI/UX refinements
- [ ] Mensagens de erro/sucesso
- [ ] Loading states
- [ ] Indicador de sincronização
- [ ] Documentação

---

## 9. Diagrama de Dados (Referência)

Os relacionamentos principais são:

```
┌──────────────────┐
│ COLABORADORES    │
├──────────────────┤
│ Id (PK)          │
│ Nome             │
│ Sobrenome        │
│ Celular          │
│ Endereco         │
│ DataCriacao      │
│ DataAtualizacao  │
│ Ativo            │
└────────┬─────────┘
         │ (1)
         │
         │ (N)
         │
┌────────▼──────────────┐
│ TAREFAS              │
├──────────────────────┤
│ Id (PK)              │
│ Descricao            │
│ ColaboradorId (FK)   │
│ PeriodicidadeDias   │
│ DataAgendada         │
│ DataProxima          │
│ Ativo                │
│ DataCriacao          │
│ DataAtualizacao      │
└────────┬──────────────┘
         │ (1)
         │
         │ (N)
         │
┌────────▼───────────────┐
│ HISTORICOS            │
├───────────────────────┤
│ Id (PK)               │
│ TarefaId (FK)         │
│ ColaboradorId (FK)    │
│ DataExecucao          │
│ HoraExecucao          │
│ DataCriacao           │
└───────────────────────┘
```

---

## 10. Próximas Etapas

1. **Implementar Backend**: Começar com models, DbContext e migrations
2. **Implementar Frontend Base**: Services, models e IndexedDB
3. **Conectar componentes**: Integrar frontend com backend
4. **Testes E2E**: Validar fluxos completos
5. **Deploy**: Preparar para produção
6. **Monitoramento**: Logs e métricas de sincronização
