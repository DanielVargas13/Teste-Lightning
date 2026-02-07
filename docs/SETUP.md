# 🔧 Configuração Inicial

## ⚡ Pré-requisitos

```bash
node --version    # v18+
dotnet --version  # v8.0+
```

## 📦 Passo 1: Banco de Dados

Edite `Backend/appsettings.json` com sua connection string do SQL Server:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(local)\\SQLEXPRESS;Database=TesteLightningDB;Trusted_Connection=true;Encrypt=false;"
}
```

**Opções de strings:**
- `(local)\\SQLEXPRESS` - SQL Server Express
- `(localdb)\\mssqllocaldb` - LocalDB
- `localhost` - SQL Server padrão

As tabelas serão criadas automaticamente nas próximas etapas.

## 🔧 Passo 2: Backend

```bash
cd Backend
dotnet restore
dotnet run
```

Banco será criado automaticamente. Acesse: http://localhost:5157/swagger

## 📱 Passo 3: Frontend

```bash
cd Frontend/teste-lightning-app
npm install
ng serve
```

Acesse: http://localhost:4200

## ✅ Concluído!

Sistema pronto para usar.
