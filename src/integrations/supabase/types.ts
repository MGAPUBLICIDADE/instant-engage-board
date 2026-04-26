export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agenda_config: {
        Row: {
          almoco_fim: string | null
          almoco_inicio: string | null
          ativo: boolean | null
          created_at: string | null
          duracao_consulta_min: number
          empresa_id: string | null
          hora_fim: string
          hora_inicio: string
          id: string
          intervalo_min: number
          medico_id: string | null
          turno_manha: boolean | null
          turno_noite: boolean | null
          turno_tarde: boolean | null
          updated_at: string
        }
        Insert: {
          almoco_fim?: string | null
          almoco_inicio?: string | null
          ativo?: boolean | null
          created_at?: string | null
          duracao_consulta_min?: number
          empresa_id?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          intervalo_min?: number
          medico_id?: string | null
          turno_manha?: boolean | null
          turno_noite?: boolean | null
          turno_tarde?: boolean | null
          updated_at?: string
        }
        Update: {
          almoco_fim?: string | null
          almoco_inicio?: string | null
          ativo?: boolean | null
          created_at?: string | null
          duracao_consulta_min?: number
          empresa_id?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          intervalo_min?: number
          medico_id?: string | null
          turno_manha?: boolean | null
          turno_noite?: boolean | null
          turno_tarde?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_config_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          agendamento_origem_id: string | null
          convenio: string | null
          created_at: string | null
          data: string
          duracao_min: number
          empresa_id: string | null
          hora: string
          id: string
          medico_id: string | null
          motivo: string | null
          observacoes: string | null
          paciente_id: string | null
          procedimento: string | null
          remarcado_de_id: string | null
          status: string | null
          tipo_atendimento: string | null
          tipo_consulta: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          agendamento_origem_id?: string | null
          convenio?: string | null
          created_at?: string | null
          data: string
          duracao_min?: number
          empresa_id?: string | null
          hora: string
          id?: string
          medico_id?: string | null
          motivo?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          procedimento?: string | null
          remarcado_de_id?: string | null
          status?: string | null
          tipo_atendimento?: string | null
          tipo_consulta?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          agendamento_origem_id?: string | null
          convenio?: string | null
          created_at?: string | null
          data?: string
          duracao_min?: number
          empresa_id?: string | null
          hora?: string
          id?: string
          medico_id?: string | null
          motivo?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          procedimento?: string | null
          remarcado_de_id?: string | null
          status?: string | null
          tipo_atendimento?: string | null
          tipo_consulta?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_agendamento_origem_id_fkey"
            columns: ["agendamento_origem_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_remarcado_de_id_fkey"
            columns: ["remarcado_de_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimento_estado: {
        Row: {
          created_at: string | null
          data: string | null
          empresa_id: string
          etapa: string | null
          horario: string | null
          id: string
          nome: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          empresa_id: string
          etapa?: string | null
          horario?: string | null
          id?: string
          nome?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          empresa_id?: string
          etapa?: string | null
          horario?: string | null
          id?: string
          nome?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      atendimentos: {
        Row: {
          agendamento_id: string | null
          anamnese: string | null
          canal: string | null
          created_at: string | null
          data: string | null
          diagnostico: string | null
          empresa_id: string | null
          hora: string | null
          id: string
          medico_id: string | null
          observacoes: string | null
          paciente_id: string | null
          prescricao: string | null
          prioridade: string | null
          responsavel: string | null
          status: string | null
          ultima_mensagem: string | null
          ultimo_contato_em: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          agendamento_id?: string | null
          anamnese?: string | null
          canal?: string | null
          created_at?: string | null
          data?: string | null
          diagnostico?: string | null
          empresa_id?: string | null
          hora?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          prescricao?: string | null
          prioridade?: string | null
          responsavel?: string | null
          status?: string | null
          ultima_mensagem?: string | null
          ultimo_contato_em?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          agendamento_id?: string | null
          anamnese?: string | null
          canal?: string | null
          created_at?: string | null
          data?: string | null
          diagnostico?: string | null
          empresa_id?: string | null
          hora?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          prescricao?: string | null
          prioridade?: string | null
          responsavel?: string | null
          status?: string | null
          ultima_mensagem?: string | null
          ultimo_contato_em?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueio_datas: {
        Row: {
          created_at: string | null
          data: string
          dia_inteiro: boolean
          empresa_id: string | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          medico_id: string | null
          motivo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          data: string
          dia_inteiro?: boolean
          empresa_id?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          medico_id?: string | null
          motivo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          data?: string
          dia_inteiro?: boolean
          empresa_id?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          medico_id?: string | null
          motivo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bloqueio_datas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bloqueio_datas_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueio_semana: {
        Row: {
          ativo: boolean
          created_at: string | null
          dia_semana: number | null
          empresa_id: string | null
          hora_fim: string
          hora_inicio: string
          id: string
          medico_id: string | null
          motivo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          dia_semana?: number | null
          empresa_id?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          medico_id?: string | null
          motivo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          dia_semana?: number | null
          empresa_id?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          medico_id?: string | null
          motivo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bloqueio_semana_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bloqueio_semana_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      conhecimento_clinica: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          conteudo_texto: string | null
          created_at: string | null
          embedding: string | null
          empresa_id: string | null
          id: string
          tipo: string | null
          titulo: string | null
          url_arquivo: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          conteudo_texto?: string | null
          created_at?: string | null
          embedding?: string | null
          empresa_id?: string | null
          id?: string
          tipo?: string | null
          titulo?: string | null
          url_arquivo?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          conteudo_texto?: string | null
          created_at?: string | null
          embedding?: string | null
          empresa_id?: string | null
          id?: string
          tipo?: string | null
          titulo?: string | null
          url_arquivo?: string | null
        }
        Relationships: []
      }
      empresas: {
        Row: {
          cidade: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      medicos: {
        Row: {
          ativo: boolean
          conselho_uf: string | null
          cor: string | null
          cpf: string | null
          created_at: string | null
          crm: string | null
          email: string | null
          empresa_id: string | null
          especialidade: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          conselho_uf?: string | null
          cor?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          email?: string | null
          empresa_id?: string | null
          especialidade?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          conselho_uf?: string | null
          cor?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          email?: string | null
          empresa_id?: string | null
          especialidade?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          ativo: boolean
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          empresa_id: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: string | null
          sexo: string | null
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          empresa_id?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          empresa_id?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string | null
          sexo?: string | null
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          agendamento_id: string | null
          created_at: string | null
          diagnostico: string | null
          empresa_id: string | null
          historico: string | null
          id: string
          medico_id: string | null
          observacoes: string | null
          paciente_id: string | null
          prescricao: string | null
          procedimento: string | null
          queixa_principal: string | null
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string | null
          diagnostico?: string | null
          empresa_id?: string | null
          historico?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          prescricao?: string | null
          procedimento?: string | null
          queixa_principal?: string | null
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string | null
          diagnostico?: string | null
          empresa_id?: string | null
          historico?: string | null
          id?: string
          medico_id?: string | null
          observacoes?: string | null
          paciente_id?: string | null
          prescricao?: string | null
          procedimento?: string | null
          queixa_principal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instancias: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string | null
          id: string
          instance_id: string | null
          nome_instancia: string | null
          numero_whatsapp: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          instance_id?: string | null
          nome_instancia?: string | null
          numero_whatsapp?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          instance_id?: string | null
          nome_instancia?: string | null
          numero_whatsapp?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_empresa_id: { Args: never; Returns: string }
      get_user_empresa_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
