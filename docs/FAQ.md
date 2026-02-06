# ❓ FAQ

## 🚀 Começar

**P: Por onde começo?**  
R: Siga [docs/SETUP.md](SETUP.md).

**P: Preciso de SQL Server pago?**  
R: Não, SQL Server Express é gratuito.

**P: Quais são os pré-requisitos?**  
R: Node.js, npm, .NET SDK 6.0+, Angular CLI 21+, SQL Server Express

---

## 🚀 Problemas

**P: Backend não inicia?**  
R: Verifique se SQL Server está rodando:
```powershell
Start-Service MSSQLSERVER
```

**P: Erro "Cannot connect to api"?**  
R: Certifique-se que o backend está rodando:
```powershell
cd Backend && dotnet run
```

**P: Frontend não abre (localhost:4200)?**  
R: Verifique se ng serve está rodando:
```powershell
cd Frontend/teste-lightning-app && ng serve
```

---

## 💾 Banco de Dados

**P: Qual banco de dados é usado?**  
R: TesteLightningDB com 3 tabelas:
- Colaboradores
- Tarefas
- Historicos

**P: Como resetar o banco?**  
R: ⚠️ Isso apaga todos os dados:
```powershell
sqlcmd -S . -Q "DROP DATABASE TesteLightningDB"
```

Depois recrie seguindo [docs/SETUP.md](SETUP.md).

---

## 🔄 Offline

**P: Como funciona a sincronização offline?**  
R: 
- Dados salvam imediatamente no IndexedDB (navegador)
- A cada 30s, sync automático envia para o servidor
- Se falhar, tenta novamente automaticamente

---

## 📁 Estrutura

**Backend:** `Backend/` com Models, Services, Controllers, Data  
**Frontend:** `Frontend/teste-lightning-app/src/` com services, components, models
