/** Template padrão SOAP para novo prontuário. */
export const TEMPLATE_SOAP = {
  queixa_principal: "",
  historico: `S — SUBJETIVO (relato do paciente)
• Queixa principal:
• História da doença atual (HDA):
• Antecedentes pessoais:
• Antecedentes familiares:
• Medicamentos em uso:
• Alergias:
• Hábitos (tabagismo / álcool / atividade física):
`,
  diagnostico: `O — OBJETIVO (exame físico e exames)
• Estado geral:
• Sinais vitais (PA / FC / FR / Tax / SatO2):
• Exame físico dirigido:
• Exames complementares:

A — AVALIAÇÃO (diagnóstico e hipóteses)
• Hipótese diagnóstica principal:
• Diagnósticos diferenciais:
• CID-10:
`,
  procedimento: `P — PLANO (conduta)
• Conduta terapêutica:
• Procedimentos realizados:
• Solicitação de exames:
• Encaminhamentos:
• Retorno:
`,
  observacoes: "",
  prescricao: `Prescrição médica:

1) 
2) 
3) 

Orientações gerais:
- 
- 
`,
};
