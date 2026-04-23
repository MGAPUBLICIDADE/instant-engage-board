import { supabase } from "@/integrations/supabase/client";

const EMPRESA_TABLES = ["empresas", "empresa"] as const;
const CONFIG_TABLES = ["configuracao_empresa", "configuracoes_empresa"] as const;

type EmpresaTableName = (typeof EMPRESA_TABLES)[number];
type ConfigTableName = (typeof CONFIG_TABLES)[number];
type QueryError = { code?: string | null; message?: string | null };
type QueryResult<TData> = { data: TData | null; error: QueryError | null };
type EmpresaRow = Record<string, unknown> & { id: string };
type ConfigRow = Record<string, unknown>;

let resolvedEmpresaTable: EmpresaTableName | null = null;
let resolvedConfigTable: ConfigTableName | null = null;

function isMissingTableError(error: QueryError | null | undefined) {
  return error?.code === "PGRST205";
}

async function runWithTableFallback<TName extends string, TData>(
  candidates: readonly TName[],
  cachedTable: TName | null,
  setCachedTable: (table: TName) => void,
  operation: (table: TName) => Promise<QueryResult<TData>>,
) {
  const orderedTables = cachedTable
    ? [cachedTable, ...candidates.filter((table) => table !== cachedTable)]
    : [...candidates];

  let lastResult: QueryResult<TData> | null = null;

  for (const table of orderedTables) {
    const result = await operation(table);
    if (!isMissingTableError(result.error)) {
      setCachedTable(table);
      return result;
    }
    lastResult = result;
  }

  if (lastResult) return lastResult;
  throw new Error("Não foi possível localizar as tabelas da empresa.");
}

export async function fetchEmpresaWithConfig(userId: string) {
  const empresaResult = await runWithTableFallback<EmpresaTableName, EmpresaRow>(
    EMPRESA_TABLES,
    resolvedEmpresaTable,
    (table) => {
      resolvedEmpresaTable = table;
    },
    async (table) =>
      await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
  );

  if (empresaResult.error) throw empresaResult.error;
  if (!empresaResult.data) return null;
  const empresaRow = empresaResult.data;

  const configResult = await runWithTableFallback<ConfigTableName, ConfigRow>(
    CONFIG_TABLES,
    resolvedConfigTable,
    (table) => {
      resolvedConfigTable = table;
    },
    async (table) =>
      await supabase
        .from(table)
        .select("*")
        .eq("empresa_id", empresaRow.id)
        .maybeSingle(),
  );

  if (configResult.error && !isMissingTableError(configResult.error)) throw configResult.error;

  return {
    ...empresaRow,
    configuracao: configResult.data ?? null,
  };
}

export async function saveEmpresaWithConfig(payload: { user_id: string } & Record<string, unknown>) {
  const empresaResult = await runWithTableFallback<EmpresaTableName, EmpresaRow>(
    EMPRESA_TABLES,
    resolvedEmpresaTable,
    (table) => {
      resolvedEmpresaTable = table;
    },
    async (table) =>
      await supabase
        .from(table)
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single(),
  );

  if (empresaResult.error) throw empresaResult.error;
  if (!empresaResult.data) throw new Error("Não foi possível salvar os dados da empresa.");
  const empresaRow = empresaResult.data;

  const configResult = await runWithTableFallback<ConfigTableName, ConfigRow>(
    CONFIG_TABLES,
    resolvedConfigTable,
    (table) => {
      resolvedConfigTable = table;
    },
    async (table) =>
      await supabase
        .from(table)
        .upsert(
          { empresa_id: empresaRow.id, preferencias: {} },
          { onConflict: "empresa_id" },
        )
        .select()
        .single(),
  );

  if (configResult.error) throw configResult.error;

  return {
    ...empresaRow,
    configuracao: configResult.data,
  };
}