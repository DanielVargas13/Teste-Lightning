# Validações com Zod - Guia de Implementação

## Visão Geral
Este documento descreve a implementação de validações robustas e reutilizáveis nos formulários do frontend usando a biblioteca **Zod**.

## Alterações Realizadas

### 1. Instalação do Zod
```bash
npm install zod
```

### 2. Esquemas de Validação (`src/app/validators/validacao.schemas.ts`)

Criados esquemas Zod para as principais entidades do aplicativo:

#### **ColaboradorSchema**
- **Nome**: 2-100 caracteres, apenas letras/hífens/apóstrofos
- **Sobrenome**: 2-100 caracteres, apenas letras/hífens/apóstrofos  
- **Celular**: 11 dígitos, segundo dígito deve ser 9 (validação brasileira)
- **Endereço**: 10-200 caracteres
- **Status (Ativo)**: Booleano (padrão: true)

#### **TarefaSchema**
- **Descrição**: 5-500 caracteres
- **Colaborador ID**: Número inteiro positivo (obrigatório)
- **Periodicidade**: 1-365 dias
- **Data Agendada**: Data futura (não pode ser hoje ou passado)
- **Status (Ativo)**: Booleano (padrão: true)

#### **ValidadorCampos** 
Esquemas individuais para validação em tempo real de cada campo

### 3. Validação em Tempo Real

Os componentes de formulário agora incluem:

- **Validação ao sair do campo** (evento `blur`): Valida quando o usuário deixa o campo
- **Validação ao digitar** (evento `input`): Feedback imediato enquanto o usuário escreve
- **Mensagens de erro personalizadas**: Cada erro exibe uma mensagem clara e específica
- **Indicador visual**: Campos com erro ganham borda vermelha

### 4. Componentes Atualizados

#### **FormularioColaboradorComponent**
```typescript
// Validação completa com Zod
const resultado = ColaboradorSchema.safeParse(this.formulario);

// Validação em tempo real por campo
validarNome(): void { /* ... */ }
validarSobrenome(): void { /* ... */ }
validarCelular(): void { /* ... */ }
validarEndereco(): void { /* ... */ }
```

**Novo Template HTML:**
- Chamadas de validação em eventos `blur` e `input`
- Exibição de erros abaixo de cada campo
- Borda vermelha para campos inválidos
- Dicas de formato nos labels

#### **FormularioTarefaComponent**
```typescript
// Similar ao Colaborador
validarDescricao(): void { /* ... */ }
validarPeriodicidade(): void { /* ... */ }
validarColaborador(): void { /* ... */ }
validarDataAgendada(): void { /* ... */ }
```

**Novo Template HTML:**
- Validação para cada campo
- Exibição de constraints nos labels (ex: "5-500 caracteres")
- Validação de intervalo para data (não pode ser passada)

## Exemplos de Uso

### Validação de Formulário Completo
```typescript
async salvarColaborador() {
  const resultado = ColaboradorSchema.safeParse(this.formulario);
  
  if (!resultado.success) {
    // Processar erros por campo
    resultado.error.issues.forEach((err: any) => {
      const campo = err.path[0] as string;
      this.errosCampos[campo] = err.message;
    });
    return;
  }
  
  // Dados validados - salvar
  await this.colaboradorService.criarColaborador(resultado.data);
}
```

### Validação em Tempo Real
```typescript
validarNome(): void {
  this.errosCampos['nome'] = '';
  
  try {
    ValidadorCampos.nome.parse(this.formulario.nome);
  } catch (error) {
    if (error instanceof ZodError) {
      this.errosCampos['nome'] = (error.issues[0] as any)?.message;
    }
  }
}
```

### Template com Validação
```html
<input
  [(ngModel)]="formulario.nome"
  (blur)="validarNome()"
  (input)="validarNome()"
  [class.border-red-500]="errosCampos['nome']"
  name="nome"
/>
<p *ngIf="errosCampos['nome']" class="text-red-600">
  {{ errosCampos['nome'] }}
</p>
```

## Regras de Validação Detalhadas

### Colaborador

| Campo | Tipo | Constraints |
|-------|------|-------------|
| Nome | string | 2-100 caracteres, apenas letras/hífens/apóstrofos |
| Sobrenome | string | 2-100 caracteres, apenas letras/hífens/apóstrofos |
| Celular | string | 11 dígitos, formato: (11)9XXXXXXXX |
| Endereço | string | 10-200 caracteres |
| Ativo | boolean | true\|false (padrão: true) |

### Tarefa

| Campo | Tipo | Constraints |
|-------|------|-------------|
| Descrição | string | 5-500 caracteres |
| Colaborador ID | number | Número inteiro positivo |
| Periodicidade | number | 1-365 dias |
| Data Agendada | date | Data >= hoje |
| Ativo | boolean | true\|false (padrão: true) |

## Benefícios

✅ **Validações Centralizadas**: Esquemas Zod únicos para cliente e servidor  
✅ **Type-Safe**: Tipos TypeScript inferidos automaticamente  
✅ **Feedback em Tempo Real**: Usuários veem erros enquanto digitam  
✅ **Mensagens Claras**: Cada erro tem mensagem específica e útil  
✅ **Fácil Manutenção**: Alterar regras em um único lugar  
✅ **Reutilizável**: Mesmos esquemas para múltiplos componentes  

## Próximos Passos (Opcional)

1. **Backend**: Implementar os mesmos esquemas Zod no backend (C#)
2. **Sincronização**: Validações podem ser compartilhadas entre cliente/servidor
3. **Testes**: Adicionar testes unitários para os schemas Zod
4. **Customização**: Adicionar mais validadores específicos do negócio

## Referências

- [Documentação Zod](https://zod.dev)
- [Angular Forms](https://angular.io/guide/forms)
