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
  const empresaLookupResult = await runWithTableFallback<EmpresaTableName, EmpresaRow>(
    EMPRESA_TABLES,
    resolvedEmpresaTable,
    (table) => {
      resolvedEmpresaTable = table;
    },
    async (table) =>
      await supabase
        .from(table)
        .select("*")
        .eq("user_id", payload.user_id)
        .maybeSingle(),
  );

  if (empresaLookupResult.error) throw empresaLookupResult.error;

  const empresaWriteResult = empresaLookupResult.data
    ? await supabase
        .from(resolvedEmpresaTable!)
        .update(payload)
        .eq("id", empresaLookupResult.data.id)
        .select()
        .single()
    : await supabase.from(resolvedEmpresaTable!).insert(payload).select().single();

  if (empresaWriteResult.error) throw empresaWriteResult.error;
  if (!empresaWriteResult.data) throw new Error("Não foi possível salvar os dados da empresa.");
  const empresaRow = empresaWriteResult.data;

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

  if (configResult.error && isMissingTableError(configResult.error)) {
    return {
      ...empresaRow,
      configuracao: null,
    };
  }

  if (configResult.error) throw configResult.error;

  const configWriteResult = configResult.data
    ? configResult
    : await supabase
        .from(resolvedConfigTable!)
        .insert({ empresa_id: empresaRow.id, preferencias: {} })
        .select()
        .single();

  if (configWriteResult.error) throw configWriteResult.error;

  return {
    ...empresaRow,
    configuracao: configWriteResult.data,
  };
}