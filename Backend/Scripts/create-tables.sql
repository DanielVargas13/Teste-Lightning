-- Script SQL para criar o banco TesteLightningDB e todas as tabelas
-- Execute este arquivo em: SQL Server Management Studio ou sqlcmd
-- 
-- Uso:
--   sqlcmd -S . -U sa -P YourPassword < create-tables.sql
--   sqlcmd -S . -E < create-tables.sql   (Windows Auth)

USE master;
GO

-- Criar banco de dados (se não existir)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TesteLightningDB')
BEGIN
    CREATE DATABASE TesteLightningDB;
END
GO

USE TesteLightningDB;
GO

-- ============================================================================
-- Tabela: Colaborador
-- ============================================================================
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
    PRINT 'Tabela [Colaborador] criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela [Colaborador] já existe.';
END
GO

-- ============================================================================
-- Tabela: Tarefa
-- ============================================================================
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
    PRINT 'Tabela [Tarefa] criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela [Tarefa] já existe.';
END
GO

-- ============================================================================
-- Tabela: Historico
-- ============================================================================
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
    PRINT 'Tabela [Historico] criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'Tabela [Historico] já existe.';
END
GO

-- ============================================================================
-- Verificação Final
-- ============================================================================
PRINT '';
PRINT '========================================';
PRINT 'Tabelas criadas com sucesso!';
PRINT '========================================';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME;
GO
