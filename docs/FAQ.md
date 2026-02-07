# ❓ Perguntas Frequentes

## Iniciar o Sistema

**P: Por onde começo?**  
R: Siga [QUICK_START.md](QUICK_START.md)

**P: Preciso de SQL Server pago?**  
R: Não, SQL Server Express é gratuito

**P: Quais são os pré-requisitos?**  
R: Node.js v18+, .NET 8+, SQL Server

---

## Problemas Comuns

**P: Backend não inicia?**  
R: Verifique se SQL Server está rodando:
```bash
# Windows
sqlcmd -S . # testa conexão
```

**P: "Cannot connect to api"?**  
R: Certifique-se backend está em http://localhost:5157 e está rodando

**P: Frontend não abre (localhost:4200)?**  
R: Verifique se `npm start` está rodando no diretório Frontend

---

## Sincronização Offline

**P: Como funciona?**  
R: Dados salvam localmente no navegador (IndexedDB). A cada 30 segundos, sincronizam com o servidor automaticamente.

**P: E se perder conexão?**  
R: Continua funcionando offline. Quando voltar a conexão, sincroniza automaticamente.

---

## Banco de Dados

**P: Como resetar tudo?**  
R: Delete o banco:
```bash
sqlcmd -S . -Q "DROP DATABASE TesteLightningDB"
```

Depois rode o backend novamente para recriar.

**P: Qual banco é usado?**  
R: TesteLightningDB com 3 tabelas: Colaboradores, Tarefas, Históricos
