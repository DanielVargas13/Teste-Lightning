# Teste Técnico: Solution Engineer (Grau 5) – Lightning

## 1. Problema de Negócio

O objetivo é o desenvolvimento de um sistema para cadastrar colaboradores e gerenciar tarefas com reprogramação automática.

### Definições das Entidades
* **Colaborador:** Pessoa que possui Nome, Sobrenome, Celular e Endereço.
* **Tarefa:** Descritivo vinculado a um colaborador com uma periodicidade definida em dias.

### Regras de Negócio e Pontos Importantes
* **Reprogramação Automática:** Se uma tarefa possui periodicidade de 7 dias, assim que o colaborador a executar, ela deve ser reprogramada automaticamente para dali a 7 dias.
* **Histórico de Realização:** Deve ser possível consultar o histórico (qual tarefa foi executada, por quem, dia e horário).
* **Vínculo Único:** Uma tarefa pode ter somente um executante programado e vinculado por vez.
* **Agendamento:** A data inicial pode ser manual, mas as próximas conclusões acionam a reprogramação baseada na periodicidade.

---

## 2. Tecnologias Empregadas

* **Frontend:** Angular
* **Backend:** C# .NET Entity Framework Core
* **Banco de Dados:** SQL Server

---

## 3. Persistência Local (Frontend)

Toda operação no frontend deve ser armazenada inicialmente no **IndexedDB** para então atualizar a UI.
> **Recomendação:** Uso da biblioteca [Dexie.js](https://dexie.org/).

---

## 4. Sincronização

Deve existir uma operação no frontend para sincronizar os dados do **IndexedDB** com a persistência no servidor (API C# + SQL Server).
* **Métodos permitidos:** Polling ou Socket.

---

## 5. Validações

* As validações de entradas de usuário podem ser realizadas **somente no frontend**.