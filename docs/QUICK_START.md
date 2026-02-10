# Quick Start

## 1. Verificar Pré-requisitos

```bash
node --version    # v18+
dotnet --version  # v8.0+
```

## 2. Backend

```bash
cd Backend
dotnet run
```

Rodará em: http://localhost:5157 (Swagger em /swagger)

## 3. Frontend (novo terminal)

```bash
cd Frontend/teste-lightning-app
npm start
```

Acesse: http://localhost:4200

## 4. Testar

1. **Navegue** para Colaboradores
2. **Clique** em "Novo Colaborador"
3. **Preencha** Nome, Sobrenome, Celular, Endereço
4. **Envie**
   - Dados aparecem instantaneamente (IndexedDB)
   - Status muda para "Sincronizando"
   - Após ~10s, marca como "Sincronizado"

## Modo Offline

1. DevTools (F12) → Network → Marque "Work offline"
2. Crie um novo colaborador
3. Dados salvam localmente e sincronizam quando voltar online

## Troubleshooting

Ver [FAQ.md](FAQ.md)
