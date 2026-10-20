import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../db/client.js", () => ({ supabase: {} }));
vi.mock("../audit/audit.js", () => ({ audit: vi.fn() }));
vi.mock("../../../../packages/domain/employee.js", () => ({
  getEmployee: vi.fn(),
}));
vi.mock("../../../../packages/domain/ticket.js", async (importOriginal) => ({
  // keep the real pure state rules (canCloseTicket, ...)
  ...(await importOriginal<
    typeof import("../../../../packages/domain/ticket.js")
  >()),
  getTicket: vi.fn(),
  assignTicket: vi.fn(),
  closeTicket: vi.fn(),
  reopenTicket: vi.fn(),
}));

import {
  assignTicket,
  closeTicket,
  getTicket,
  reopenTicket,
} from "../../../../packages/domain/ticket.js";
import { getEmployee } from "../../../../packages/domain/employee.js";
import { audit } from "../audit/audit.js";
import { registerAssignTicketTool } from "./assignTicket.js";
import { registerCloseTicketTool } from "./closeTicket.js";
import { registerReopenTicketTool } from "./reopenTicket.js";
import {
  actAs,
  auditResults,
  captureTools,
  makeTicket,
} from "../testing/testHelpers.js";

const assign = captureTools(registerAssignTicketTool)["assign_ticket"]!;
const close = captureTools(registerCloseTicketTool)["close_ticket"]!;
const reopen = captureTools(registerReopenTicketTool)["reopen_ticket"]!;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTicket).mockResolvedValue(makeTicket() as any);
  vi.mocked(assignTicket).mockResolvedValue(
    makeTicket({ assigned_to: "EMP004" }) as any
  );
  vi.mocked(closeTicket).mockResolvedValue(
    makeTicket({ status: "CLOSED" }) as any
  );
  vi.mocked(reopenTicket).mockResolvedValue(makeTicket() as any);
  vi.mocked(getEmployee).mockResolvedValue({
    id: "EMP004",
    role: "IT_SUPPORT",
  } as any);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assign_ticket", () => {
  it("is denied for employees, even on their own ticket", async () => {
    actAs("EMPLOYEE");

    const result = await assign({ id: "TCK001", assigneeId: "EMP004" });

    expect(result.isError).toBe(true);
    expect(assignTicket).not.toHaveBeenCalled();
    expect(auditResults(vi.mocked(audit))).toEqual(["auth_rejection"]);
  });

  it("lets IT support assign a ticket to IT staff", async () => {
    actAs("IT_SUPPORT");

    const result = await assign({ id: "TCK001", assigneeId: "EMP004" });

    expect(result.isError).toBeUndefined();
    expect(assignTicket).toHaveBeenCalledWith("TCK001", "EMP004");
    expect(auditResults(vi.mocked(audit))).toEqual(["success"]);
  });

  it("refuses to assign a ticket to an ordinary employee", async () => {
    actAs("IT_SUPPORT");
    vi.mocked(getEmployee).mockResolvedValue({
      id: "EMP002",
      role: "EMPLOYEE",
    } as any);

    const result = await assign({ id: "TCK001", assigneeId: "EMP002" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("cannot be assigned tickets");
    expect(assignTicket).not.toHaveBeenCalled();
  });

  it("refuses to assign to an employee that does not exist", async () => {
    actAs("IT_SUPPORT");
    vi.mocked(getEmployee).mockRejectedValue(
      new Error("Failed to get employee: not found")
    );

    const result = await assign({ id: "TCK001", assigneeId: "GHOST" });

    expect(result.isError).toBe(true);
    expect(assignTicket).not.toHaveBeenCalled();
    expect(auditResults(vi.mocked(audit))).toEqual(["failure"]);
  });

  it("refuses to assign a closed ticket", async () => {
    actAs("IT_ADMINISTRATOR");
    vi.mocked(getTicket).mockResolvedValue(
      makeTicket({ status: "CLOSED" }) as any
    );

    const result = await assign({ id: "TCK001", assigneeId: "EMP004" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("closed ticket");
    expect(assignTicket).not.toHaveBeenCalled();
  });
});

describe("close_ticket", () => {
  it("lets an employee close their own ticket", async () => {
    actAs("EMPLOYEE");

    const result = await close({ id: "TCK001" });

    expect(result.isError).toBeUndefined();
    expect(closeTicket).toHaveBeenCalledWith("TCK001");
  });

  it("does not let an employee close someone else's ticket", async () => {
    actAs("EMPLOYEE");
    vi.mocked(getTicket).mockResolvedValue(
      makeTicket({ employee_id: "EMP002" }) as any
    );

    const result = await close({ id: "TCK001" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      "Employee does not own this resource"
    );
    expect(closeTicket).not.toHaveBeenCalled();
    expect(auditResults(vi.mocked(audit))).toEqual(["auth_rejection"]);
  });

  it("lets IT staff close any employee's ticket", async () => {
    actAs("IT_SUPPORT");
    vi.mocked(getTicket).mockResolvedValue(
      makeTicket({ employee_id: "EMP002" }) as any
    );

    const result = await close({ id: "TCK001" });

    expect(result.isError).toBeUndefined();
    expect(closeTicket).toHaveBeenCalled();
  });

  it("rejects closing a ticket that is already closed", async () => {
    actAs("EMPLOYEE");
    vi.mocked(getTicket).mockResolvedValue(
      makeTicket({ status: "CLOSED" }) as any
    );

    const result = await close({ id: "TCK001" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Ticket is already closed");
    expect(closeTicket).not.toHaveBeenCalled();
  });
});

describe("reopen_ticket", () => {
  it.each(["CLOSED", "RESOLVED"])(
    "lets an employee reopen their own %s ticket",
    async (status) => {
      actAs("EMPLOYEE");
      vi.mocked(getTicket).mockResolvedValue(makeTicket({ status }) as any);

      const result = await reopen({ id: "TCK001" });

      expect(result.isError).toBeUndefined();
      expect(reopenTicket).toHaveBeenCalledWith("TCK001");
    }
  );

  it.each(["OPEN", "IN_PROGRESS"])(
    "rejects reopening a ticket that is %s",
    async (status) => {
      actAs("IT_SUPPORT");
      vi.mocked(getTicket).mockResolvedValue(makeTicket({ status }) as any);

      const result = await reopen({ id: "TCK001" });

      expect(result.isError).toBe(true);
      expect(reopenTicket).not.toHaveBeenCalled();
    }
  );

  it("does not let an employee reopen someone else's ticket", async () => {
    actAs("EMPLOYEE");
    vi.mocked(getTicket).mockResolvedValue(
      makeTicket({ employee_id: "EMP002", status: "CLOSED" }) as any
    );

    const result = await reopen({ id: "TCK001" });

    expect(result.isError).toBe(true);
    expect(reopenTicket).not.toHaveBeenCalled();
  });
});