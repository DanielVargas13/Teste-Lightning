# FAQ - Troubleshooting

## Setup

**Pré-requisitos?**  
Node.js v18+, .NET 8+, SQL Server Express (gratuito)

**Por onde começo?**  
Siga [QUICK_START.md](QUICK_START.md)

**Preciso de SQL Server pago?**  
Não, SQL Server Express é gratuito.

## Backend

**Backend não inicia?**  
```bash
dotnet --version         # Verifique se está v8.0+
sqlcmd -S .             # Teste conexão SQL Server
```

**"Cannot connect to api"?**  
Certifique-se backend está em http://localhost:5157 e rodando (`dotnet run`)

**Swagger não abre?**  
Acesse http://localhost:5157/swagger (não /swagger/index.html)

**Porta 5157 em uso?**  
Mude a porta em `Backend/Properties/launchSettings.json`

## Frontend

**Frontend não carrega?**  
- Verifique: `node --version` (v18+)
- Espere 30s se estiver iniciando
- Tente: `npm install` novamente
- Limpe cache: `npm cache clean --force`

**Erro CORS?**  
Certifique-se backend está rodando em http://localhost:5157

**Erro "BUILD FAILED" ao executar ng serve?**  
```bash
npm install
npm update
```

## Sincronização

**Como funciona?**  
Dados salvam no IndexedDB. A cada 30s sincronizam com servidor automaticamente.

**Perdeu conexão?**  
Funciona offline. Quando reconectar, sincroniza automaticamente.

**Forçar sincronização?**  
Clique em "Sincronizar Agora" no status component (canto inferior da navbar)

**Sincronização não funciona?**
- Verifique se backend está rodando
- Verifique DevTools (F12) → Network para ver erros
- Tente "Sincronizar Agora"

## Banco de Dados

**Como criar as tabelas?**  
- **Manual:** Consultar [docs/SCRIPTS_SQL.md](SCRIPTS_SQL.md) para scripts prontos
- Execute via SSMS ou `sqlcmd`

**Resetar tudo?**  
```bash
sqlcmd -S . -Q "DROP DATABASE TesteLightningDB"
```

**Qual banco é usado?**  
`TesteLightningDB` com tabelas: Colaborador, Tarefa, Historico

**Mudar connection string?**  
Edite `Backend/appsettings.json` em `ConnectionStrings.DefaultConnection`

**Verificar tabelas criadas?**
```sql
USE TesteLightningDB;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo';
```

Deve retornar: `Colaborador`, `Tarefa`, `Historico`

**Ver dados locais (IndexedDB)?**  
Abra DevTools (F12) → Application → IndexedDB → teste-lightning-app

## Dados

**Adicionar colaborador não funciona?**
- Todos os campos são obrigatórios
- Celular: 11 dígitos
- Aguarde sincronização

**Tarefa não sincroniza?**
- Colaborador deve estar sincronizado primeiro
- Verifique conexão com servidor
- Tente "Sincronizar Agora"

**Deletar dados permanentemente?**
- Via UI: Delete o item (marca como inativo)
- Via DB: Execute DELETE direto no SQL Server
- Via LocalDB: DevTools → Application → IndexedDB → Delete database
