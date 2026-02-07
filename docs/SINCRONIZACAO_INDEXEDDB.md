# Sincronização IndexedDB com Backend (Polling)

## Visão Geral

O sistema agora implementa sincronização bidirecional do IndexedDB com o backend:

### **➡️ Polling de Recebimento** (Backend → IndexedDB)
- Busca dados atualizados do backend a cada 30 segundos
- Detecta mudanças usando `dataAtualizacao` ou `versao`
- Atualiza o IndexedDB com novos dados
- Remove dados deletados no backend

### **⬅️ Polling de Envio** (IndexedDB → Backend)
- Envia operações pendentes (CREATE, UPDATE, DELETE, EXECUTE)
- Tenta 3 vezes antes de falhar
- Marca operações como sincronizadas

---

## 🔄 Como Funciona

### Fluxo de Sincronização

```
┌─────────────────────────────────────────┐
│  Intervalo (a cada 30 segundos)        │
└────────────────┬────────────────────────┘
                 ↓
       ┌─────────────────────┐
       │  sincronizar()      │
       └────────────┬────────┘
                    ↓
        ┌──────────────────────┐
        │ Sincronizar Backend  │
        │ (Recebimento)        │
        └────────────┬─────────┘
                     ↓
    ┌─────────────────────────────────┐
    │ 1. Colaboradores               │
    │ 2. Tarefas                     │
    │ 3. Históricos                  │
    └────────────┬────────────────────┘
                 ↓
        ┌──────────────────────┐
        │ Sincronizar Fila     │
        │ (Envio)              │
        └──────────────────────┘
```

---

## 📝 Uso em Componentes

### Exemplo 1: Monitorar Sincronização Geral

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SincronizacaoService } from '../services/sincronizacao.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-status-sincronizacao',
  template: `
    <div *ngIf="statusSincronizacao$ | async as status" class="status-panel">
      <div>Sincronizando: {{ status.sincronizando }}</div>
      <div>Última: {{ status.ultimaSincronizacao | date:'short' }}</div>
      <div>Pendentes: {{ status.pendentes }}</div>
      <div>Erros: {{ status.erros }}</div>
      <div>Sucesso: {{ status.sucesso }}</div>
    </div>
  `
})
export class StatusSincronizacaoComponent implements OnInit, OnDestroy {
  statusSincronizacao$ = this.sincronizacao.getStatusGeral$();
  private destroy$ = new Subject<void>();

  constructor(private sincronizacao: SincronizacaoService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Exemplo 2: Monitorar Sincronização por Tipo de Dado

```typescript
import { Component, OnInit } from '@angular/core';
import { SincronizacaoService } from '../services/sincronizacao.service';

@Component({
  selector: 'app-sync-details',
  template: `
    <div class="sync-details">
      <p>Colaboradores sincronizados: {{ lastSyncColaboradores$ | async | date:'short' }}</p>
      <p>Tarefas sincronizadas: {{ lastSyncTarefas$ | async | date:'short' }}</p>
      <p>Históricos sincronizados: {{ lastSyncHistoricos$ | async | date:'short' }}</p>
    </div>
  `
})
export class SyncDetailsComponent {
  lastSyncColaboradores$ = this.sincronizacao.getUltimaSincronizacaoColaboradores$();
  lastSyncTarefas$ = this.sincronizacao.getUltimaSincronizacaoTarefas$();
  lastSyncHistoricos$ = this.sincronizacao.getUltimaSincronizacaoHistoricos$();

  constructor(private sincronizacao: SincronizacaoService) {}
}
```

### Exemplo 3: Forçar Sincronização Manual

```typescript
import { Component } from '@angular/core';
import { SincronizacaoService } from '../services/sincronizacao.service';

@Component({
  selector: 'app-manual-sync',
  template: `
    <button (click)="sincronizarAgora()">Sincronizar Agora</button>
  `
})
export class ManualSyncComponent {
  constructor(private sincronizacao: SincronizacaoService) {}

  async sincronizarAgora(): Promise<void> {
    await this.sincronizacao.sincronizarAgora();
    console.log('Sincronização completa!');
  }
}
```

### Exemplo 4: Ajustar Intervalo de Polling

```typescript
export class AppInitializerComponent implements OnInit {
  constructor(private sincronizacao: SincronizacaoService) {}

  ngOnInit(): void {
    // Alterar para 60 segundos (60000ms)
    this.sincronizacao.setIntervaloPooling(60000);
  }
}
```

---

## 🔍 Detecção de Mudanças

O sistema detecta mudanças usando os seguintes critérios (em ordem):

### 1️⃣ Timestamp de Modificação
Se `dataAtualizacao` existe tanto localmente quanto no backend:
```typescript
remotoTime > localTime → Atualizar
```

### 2️⃣ Versão
Se `versao` existe em ambos:
```typescript
remoto.versao > local.versao → Atualizar
```

### 3️⃣ Comparação Profunda
Fallback: comparar serialização JSON
```typescript
JSON.stringify(local) !== JSON.stringify(remoto) → Atualizar
```

---

## 📊 Observables Disponíveis

### Status Geral
```typescript
this.sincronizacao.getStatusGeral$()
// Retorna: { sincronizando, ultimaSincronizacao, pendentes, erros, sucesso }
```

### Por Tipo de Dado
```typescript
this.sincronizacao.getUltimaSincronizacaoColaboradores$()
this.sincronizacao.getUltimaSincronizacaoTarefas$()
this.sincronizacao.getUltimaSincronizacaoHistoricos$()
```

### Operações
```typescript
this.sincronizacao.getSincronizando$()
this.sincronizacao.getUltimaSincronizacao$()
this.sincronizacao.getOperacoesPendentes$()
this.sincronizacao.getErros$()
this.sincronizacao.getSucessos$()
```

---

## 🔧 Métodos Públicos

### `sincronizarAgora()`
Executa sincronização imediatamente (não aguarda próximo intervalo)
```typescript
await this.sincronizacao.sincronizarAgora();
```

### `resetarContadores()`
Limpa contadores de erro e sucesso
```typescript
this.sincronizacao.resetarContadores();
```

### `setIntervaloPooling(ms)`
Altera intervalo de polling
```typescript
this.sincronizacao.setIntervaloPooling(15000); // 15 segundos
```

---

## 💾 Armazenamento de Metadados

O IndexedDB armazena um registro de quando cada tipo de dado foi sincronizado:

### Tabela: `sincronizacaoMetadata`
```
{
  tipo: 'Colaborador' | 'Tarefa' | 'Historico',
  ultimaSincronizacao: ISO String,
  ...outrosDados
}
```

Isso permite recuperar o último timestamp de sincronização mesmo após recarregar a página.

---

## 🚀 Inicialização Automática

O sistema é inicializado automaticamente quando o `SincronizacaoService` é injetado em qualquer componente:

1. Carrega metadados anteriores
2. Executa sincronização imediatamente
3. Configura intervalo de polling (30s por padrão)

---

## ⚙️ Configuração no Backend

O backend deve fornecer as seguintes rotas (já existentes):

```
GET  /api/colaborador              → Lista colaboradores
GET  /api/tarefa                   → Lista tarefas
GET  /api/historico/tarefa/{id}    → Históricos da tarefa

POST /api/colaborador              → Criar colaborador
PUT  /api/colaborador/{id}         → Atualizar colaborador
DELETE /api/colaborador/{id}       → Deletar colaborador

POST /api/tarefa                   → Criar tarefa
PUT  /api/tarefa/{id}              → Atualizar tarefa
DELETE /api/tarefa/{id}            → Deletar tarefa
POST /api/tarefa/{id}/executar     → Executar tarefa
```

### Importante
Os modelos do backend devem incluir:
- `dataAtualizacao` (DateTime) - para detectar mudanças
- Ou `versao` (number) - como alternativa

Exemplo no C#:
```csharp
public class Colaborador {
    public int Id { get; set; }
    public string Nome { get; set; }
    public DateTime DataAtualizacao { get; set; } // Importante!
}
```

---

## 📋 Fluxo Exemplo: Criar Colaborador Offline

1. **Usuário cria colaborador** → Adicionado à fila de sincronização do IndexedDB
2. **Offline** → Fila permanece pendente
3. **Online + Intervalo de Polling** → Sistema tenta enviar para backend
4. **Backend processa** → Retorna colaborador com ID
5. **Frontend atualiza** → IndexedDB e BehaviorSubjects são atualizados
6. **Próximo polling** → Detecta que dados estão sincronizados
7. **Estado final** → Colaborador permanentemente salvo

---

## 🐛 Debug

Ative logs no console para monitorar sincronização:

```typescript
// Console mostrará:
// "Sincronização de colaboradores concluída. 5 itens."
// "Sincronização de tarefas concluída. 12 itens."
// "Sincronização de históricos concluída."
// "Erro ao sincronizar: ..."
```

---

## 📈 Performance

- **Colaboradores**: Sincroniza lista completa (~100ms por 50 itens)
- **Tarefas**: Sincroniza lista completa (~100ms por 50 itens)
- **Históricos**: Sincroniza por tarefa (paralizado por backend)
- **Intervalo**: 30 segundos (configurável)

Ajuste o intervalo conforme necessário:
- **Alta frequência**: 10 segundos (mais tráfego de rede)
- **Padrão**: 30 segundos (recomendado)
- **Baixa frequência**: 60+ segundos (menos recursos)
