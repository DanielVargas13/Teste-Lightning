# 🔧 Guia de Setup

## ⚡ Pré-requisitos

Verifique se tem instalado:
```powershell
node --version          # v20.0.0+
npm --version          # v10.0.0+
ng version             # Angular CLI 21.0.0+
dotnet --version       # .NET 6 SDK
```

## 1️⃣ Configurar Banco de Dados

### SQL Server Connection Strings

Escolha uma string de conexão e atualize `Backend/appsettings.json`:

**SQL Server Express (padrão):**
```json
"Server=(local)\\SQLEXPRESS;Database=TesteLightningDB;Trusted_Connection=true;Encrypt=false;"
```

**SQL Server LocalDB:**
```json
"Server=(localdb)\\mssqllocaldb;Database=TesteLightningDB;Trusted_Connection=true;"
```

**SQL Server Developer Edition:**
```json
"Server=localhost;Database=TesteLightningDB;Trusted_Connection=true;Encrypt=false;"
```

### Criar Banco e Tabelas

Abra SQL Server Management Studio e execute:

```sql
CREATE DATABASE TesteLightningDB;
USE TesteLightningDB;

-- Tabela: Colaboradores
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

-- Tabela: Tarefas
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

-- Tabela: Historicos
CREATE TABLE Historicos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TarefaId INT NOT NULL,
    DataExecucao DATETIME DEFAULT GETDATE(),
    HoraExecucao TIME DEFAULT CAST(GETDATE() AS TIME),
    DataCriacao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TarefaId) REFERENCES Tarefas(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Historicos_TarefaId ON Historicos(TarefaId);
CREATE INDEX IX_Historicos_DataExecucao ON Historicos(DataExecucao);
```

## 2️⃣ Iniciar Backend

```powershell
cd Backend
dotnet restore
dotnet run
```

**API estará em:** http://localhost:5000  
**Swagger docs em:** http://localhost:5000/swagger

## 3️⃣ Iniciar Frontend

```powershell
cd Frontend/teste-lightning-app
ng serve
```

**App estará em:** http://localhost:4200

## ✅ Pronto!

Abra o navegador em **http://localhost:4200** e comece a usar.
