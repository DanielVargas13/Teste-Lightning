import { z } from 'zod';

export const ColaboradorSchema = z.object({
  id: z.number().optional(),
  nome: z
    .string()
    .trim()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),
  sobrenome: z
    .string()
    .trim()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(100, 'Sobrenome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Sobrenome contém caracteres inválidos'),
  celular: z
    .string()
    .refine(
      (val) => {
        const celular = val.replace(/\D/g, '');
        return celular.length === 11;
      },
      'Celular deve conter 11 dígitos'
    ),
  endereco: z
    .string()
    .trim()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  ativo: z.boolean().optional().default(true),
  dataCriacao: z.date().optional(),
  dataAtualizacao: z.date().optional()
});

export const TarefaSchema = z.object({
  id: z.number().optional(),
  descricao: z
    .string()
    .trim()
    .min(5, 'Descrição deve ter no mínimo 5 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  colaboradorId: z
    .coerce
    .number('Colaborador deve ser um ID válido')
    .int('Colaborador deve ser um ID válido')
    .positive('Colaborador identificador deve ser positivo'),
  periodicidadeDias: z
    .coerce
    .number('Periodicidade deve ser um número inteiro')
    .int('Periodicidade deve ser um número inteiro')
    .min(1, 'Periodicidade deve ser no mínimo 1 dia')
    .max(365, 'Periodicidade deve ser no máximo 365 dias'),
  dataAgendada: z
    .coerce
    .date()
    .refine(
      (data) => {
        const hoje = new Date();
        hoje.setDate(hoje.getDate() - 1);
        return data >= hoje;
      },
      'Data agendada não pode ser no passado'
    ),
  dataProxima: z.date().optional(),
  ativo: z.boolean().optional().default(true),
  dataCriacao: z.date().optional(),
  dataAtualizacao: z.date().optional(),
  nomeColaborador: z.string().optional()
});

export const ValidadorCampos = {
  nome: z
    .string()
    .trim()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, 'Nome contém caracteres inválidos'),
  
  sobrenome: z
    .string()
    .trim()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(100, 'Sobrenome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]*$/, 'Sobrenome contém caracteres inválidos'),
  
  celular: z
    .string()
    .refine(
      (val) => {
        const celular = val.replace(/\D/g, '');
        return celular.length <= 11 && (celular.length === 0 || celular.length > 10);
      },
      'Celular deve conter 11 dígitos'
    ),
  
  endereco: z
    .string()
    .trim()
    .min(10, 'Endereço deve ter no mínimo 10 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  
  descricao: z
    .string()
    .trim()
    .min(5, 'Descrição deve ter no mínimo 5 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  periodicidadeDias: z
    .number()
    .min(1, 'Periodicidade deve ser no mínimo 1 dia')
    .max(365, 'Periodicidade deve ser no máximo 365 dias')
};

export type ColaboradorValidacao = z.infer<typeof ColaboradorSchema>;
export type TarefaValidacao = z.infer<typeof TarefaSchema>;
