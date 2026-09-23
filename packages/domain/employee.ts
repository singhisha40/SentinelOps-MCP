import { supabase } from "../../apps/mcp-server/src/db/client.js";

export async function getEmployee(id: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to get employee: ${error.message}`);
  }

  return data;
}