import { supabase } from "../../apps/mcp-server/src/db/client.js";

export async function getTicket(id: string) {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to get ticket: ${error.message}`);
  }

  return data;
}
export async function searchTickets(
  query?: string,
  employeeId?: string
) {
  let request = supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    request = request.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  if (employeeId) {
    request = request.eq("employee_id", employeeId);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(`Failed to search tickets: ${error.message}`);
  }

  return data;
}

export async function createTicket(input: {
  id: string;
  employeeId: string;
  deviceId?: string;
  title: string;
  description: string;
  category?: string;
  priority: string;
}) {
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      id: input.id,
      employee_id: input.employeeId,
      device_id: input.deviceId ?? null,
      title: input.title,
      description: input.description,
      category: input.category ?? null,
      priority: input.priority,
      status: "OPEN",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`);
  }

  return data;
}

export async function updateTicket(input: {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
}) {
  const updates: {
    title?: string;
    description?: string;
    category?: string | null;
    priority?: string;
    status?: string;
    assigned_to?: string | null;
    updated_at?: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    updates.title = input.title;
  }

  if (input.description !== undefined) {
    updates.description = input.description;
  }

  if (input.category !== undefined) {
    updates.category = input.category;
  }

  if (input.priority !== undefined) {
    updates.priority = input.priority;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  if (input.assignedTo !== undefined) {
    updates.assigned_to = input.assignedTo;
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`);
  }

  return data;
}

export const TICKET_STATUS = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

// Pure state-transition rules, kept separate so they are easy to unit test.
export function canCloseTicket(status: string): boolean {
  return status !== TICKET_STATUS.CLOSED;
}

export function canReopenTicket(status: string): boolean {
  return (
    status === TICKET_STATUS.CLOSED || status === TICKET_STATUS.RESOLVED
  );
}

export function canAssignTicket(status: string): boolean {
  return status !== TICKET_STATUS.CLOSED;
}

async function setTicketFields(
  id: string,
  fields: { status?: string; assigned_to?: string },
  action: string
) {
  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to ${action} ticket: ${error.message}`);
  }

  return data;
}

export async function assignTicket(id: string, assigneeId: string) {
  return setTicketFields(id, { assigned_to: assigneeId }, "assign");
}

export async function closeTicket(id: string) {
  return setTicketFields(id, { status: TICKET_STATUS.CLOSED }, "close");
}

export async function reopenTicket(id: string) {
  return setTicketFields(id, { status: TICKET_STATUS.OPEN }, "reopen");
}