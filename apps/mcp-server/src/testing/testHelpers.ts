import { vi } from "vitest";

export type ToolHandler = (args: any) => Promise<any>;

/** Registers a tool module against a fake server and returns its handlers by tool name. */
export function captureTools(
  register: (server: any) => void
): Record<string, ToolHandler> {
  const handlers: Record<string, ToolHandler> = {};

  register({
    registerTool: (
      name: string,
      _config: unknown,
      handler: ToolHandler
    ) => {
      handlers[name] = handler;
    },
  });

  return handlers;
}

export function actAs(role: string) {
  vi.stubEnv("SENTINELOPS_ACTOR_ROLE", role);
}

export function makeTicket(overrides: Record<string, unknown> = {}) {
  return {
    id: "TCK001",
    employee_id: "EMP001",
    device_id: null,
    title: "VPN connection failing",
    description: "Unable to connect to the corporate VPN.",
    category: "NETWORK",
    priority: "HIGH",
    status: "OPEN",
    assigned_to: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    resolved_at: null,
    ...overrides,
  };
}

/** Text of every audit() call's result, for assertions. */
export function auditResults(auditMock: {
  mock: { calls: any[][] };
}): string[] {
  return auditMock.mock.calls.map((call) => call[0].result);
}