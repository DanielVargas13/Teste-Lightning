# Scripts SQL - Criação de Tabelas

Scripts prontos para criar o banco de dados e tabelas.

## Arquivo Pronto

Use o arquivo pronto em: [`Backend/Scripts/create-tables.sql`](../Backend/Scripts/create-tables.sql)

## Como Executar

```sql
-- Criar banco de dados (se não existir)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TesteLightningDB')
BEGIN
    CREATE DATABASE TesteLightningDB;
END
GO

USE TesteLightningDB;
GO
```

## Tabela: Colaborador

```sql
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Colaborador')
BEGIN
    CREATE TABLE [dbo].[Colaborador] (
        [Id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
        [Nome] NVARCHAR(100) NOT NULL,
        [Sobrenome] NVARCHAR(100) NOT NULL,
        [Celular] NVARCHAR(11) NOT NULL,
        [Endereco] NVARCHAR(200) NOT NULL,
        [DataCriacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [DataAtualizacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [Ativo] BIT NOT NULL DEFAULT 1
    );
    
    CREATE INDEX [IX_Colaborador_Ativo] ON [dbo].[Colaborador] ([Ativo]);
END
GO
```

## Tabela: Tarefa

```sql
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Tarefa')
BEGIN
    CREATE TABLE [dbo].[Tarefa] (
        [Id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
        [Descricao] NVARCHAR(500) NOT NULL,
        [ColaboradorId] INT NOT NULL,
        [PeriodicidadeDias] INT NOT NULL,
        [DataAgendada] DATETIME2 NOT NULL,
        [DataProxima] DATETIME2 NULL,
        [Ativo] BIT NOT NULL DEFAULT 1,
        [DataCriacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [DataAtualizacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_Tarefa_Colaborador] FOREIGN KEY ([ColaboradorId]) 
            REFERENCES [dbo].[Colaborador] ([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [IX_Tarefa_ColaboradorId] ON [dbo].[Tarefa] ([ColaboradorId]);
    CREATE INDEX [IX_Tarefa_Ativo] ON [dbo].[Tarefa] ([Ativo]);
END
GO
```

## Tabela: Historico

```sql
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Historico')
BEGIN
    CREATE TABLE [dbo].[Historico] (
        [Id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
        [TarefaId] INT NOT NULL,
        [DataExecucao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [HoraExecucao] TIME NOT NULL DEFAULT CONVERT(TIME, GETUTCDATE()),
        [DataCriacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_Historico_Tarefa] FOREIGN KEY ([TarefaId]) 
            REFERENCES [dbo].[Tarefa] ([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [IX_Historico_TarefaId] ON [dbo].[Historico] ([TarefaId]);
    CREATE INDEX [IX_Historico_DataExecucao] ON [dbo].[Historico] ([DataExecucao]);
END
GO
```

## Executar Todos os Scripts

Para facilitar, execute tudo de uma vez:

```sql
-- Criar banco de dados
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TesteLightningDB')
BEGIN
    CREATE DATABASE TesteLightningDB;
END
GO

USE TesteLightningDB;
GO

-- Tabela Colaborador
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Colaborador')
BEGIN
    CREATE TABLE [dbo].[Colaborador] (
        [Id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
        [Nome] NVARCHAR(100) NOT NULL,
        [Sobrenome] NVARCHAR(100) NOT NULL,
        [Celular] NVARCHAR(11) NOT NULL,
        [Endereco] NVARCHAR(200) NOT NULL,
        [DataCriacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [DataAtualizacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [Ativo] BIT NOT NULL DEFAULT 1
    );
    CREATE INDEX [IX_Colaborador_Ativo] ON [dbo].[Colaborador] ([Ativo]);
END
GO

-- Tabela Tarefa
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Tarefa')
BEGIN
    CREATE TABLE [dbo].[Tarefa] (
        [Id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
        [Descricao] NVARCHAR(500) NOT NULL,
        [ColaboradorId] INT NOT NULL,
        [PeriodicidadeDias] INT NOT NULL,
        [DataAgendada] DATETIME2 NOT NULL,
        [DataProxima] DATETIME2 NULL,
        [Ativo] BIT NOT NULL DEFAULT 1,
        [DataCriacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [DataAtualizacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_Tarefa_Colaborador] FOREIGN KEY ([ColaboradorId]) 
            REFERENCES [dbo].[Colaborador] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_Tarefa_ColaboradorId] ON [dbo].[Tarefa] ([ColaboradorId]);
    CREATE INDEX [IX_Tarefa_Ativo] ON [dbo].[Tarefa] ([Ativo]);
END
GO

-- Tabela Historico
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Historico')
BEGIN
    CREATE TABLE [dbo].[Historico] (
        [Id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
        [TarefaId] INT NOT NULL,
        [DataExecucao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [HoraExecucao] TIME NOT NULL DEFAULT CONVERT(TIME, GETUTCDATE()),
        [DataCriacao] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_Historico_Tarefa] FOREIGN KEY ([TarefaId]) 
            REFERENCES [dbo].[Tarefa] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_Historico_TarefaId] ON [dbo].[Historico] ([TarefaId]);
    CREATE INDEX [IX_Historico_DataExecucao] ON [dbo].[Historico] ([DataExecucao]);
END
GO

-- Verificar tabelas criadas
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
GO
```

## Como Executar

### Opção 1: SQL Server Management Studio (SSMS) ✅ Mais Fácil

1. Abra SSMS
2. Conecte ao seu SQL Server
3. Abra o arquivo: `Backend/Scripts/create-tables.sql`
4. Clique em "Execute" (ou Ctrl+E)

### Opção 2: Command Line (sqlcmd)

```bash
# Windows (autenticação do Windows)
sqlcmd -S . -E < Backend\Scripts\create-tables.sql

# Com usuário e senha
sqlcmd -S . -U sa -P YourPassword < Backend\Scripts\create-tables.sql

# Linux
sqlcmd -S localhost -U sa -P YourPassword < Backend/Scripts/create-tables.sql
```

## Verificar se Tabelas Foram Criadas

```sql
USE TesteLightningDB;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
```

Resultado esperado:
```
TABLE_NAME
-----------
Colaborador
Tarefa
Historico
```

## Resetar Banco (Deletar Tabelas)

```sql
-- Deletar dados (mantém estrutura)
TRUNCATE TABLE [dbo].[Historico];
TRUNCATE TABLE [dbo].[Tarefa];
TRUNCATE TABLE [dbo].[Colaborador];

-- Deletar tudo (estrutura + dados)
DROP TABLE IF EXISTS [dbo].[Historico];
DROP TABLE IF EXISTS [dbo].[Tarefa];
DROP TABLE IF EXISTS [dbo].[Colaborador];
DROP DATABASE IF EXISTS TesteLightningDB;
```
