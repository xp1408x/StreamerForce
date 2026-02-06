import { z } from 'zod';
import { defineSkill } from '@vercel/agent-skills'; // O el SDK que estés usando

export const webArchitect = defineSkill({
  id: 'web-architect',
  description: 'Optimiza código web usando SWR, Dynamic Imports y Arquitectura Sistémica.',
  
  // Parámetros que Copilot decidirá enviar
  schema: z.object({
    task: z.enum(['refactor-to-swr', 'apply-dynamic-import', 'build-systemic-route']),
    componentCode: z.string().describe('El código actual a mejorar'),
    componentName: z.string().optional(),
  }),

  run: async ({ task, componentCode, componentName }) => {
    // Aquí podrías incluso llamar a un linter o retornar el plan de acción
    return {
      suggestedTask: task,
      applyDesignTokens: true,
      standard: "Vercel/Next.js Performance Patterns"
    };
  },
});