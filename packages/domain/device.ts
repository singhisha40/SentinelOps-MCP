import { supabase } from "../../apps/mcp-server/src/db/client.js";

export async function getDevice(id: string) {
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to get device: ${error.message}`);
  }

  return data;
}

export async function listDevices(employeeId?: string) {
  let query = supabase
    .from("devices")
    .select("*")
    .order("id");

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list devices: ${error.message}`);
  }

  return data;
}