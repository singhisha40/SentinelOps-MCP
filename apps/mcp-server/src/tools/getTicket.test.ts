import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../packages/domain/ticket.js", () => ({
    getTicket: vi.fn(),
}));

import { getTicket } from "../../../../packages/domain/ticket.js";
import { registerGetTicketTool } from "./getTicket.js";

describe("get_ticket tool", () => {
    it("rejects EMP001 from accessing EMP002's ticket", async () => {
        vi.mocked(getTicket).mockResolvedValue({
            id: "TCK001",
            employee_id: "EMP002",
            device_id: null,
            title: "Laptop problem",
            description: "Laptop is not starting",
            category: "HARDWARE",
            priority: "MEDIUM",
            status: "OPEN",
            assigned_to: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
            resolved_at: null,
        });

        let handler:
            | ((args: { id: string }) => Promise<any>)
            | undefined;

        const fakeServer = {
            registerTool: vi.fn(
                (
                    _name: string,
                    _config: unknown,
                    registeredHandler: (
                        args: { id: string }
                    ) => Promise<any>
                ) => {
                    handler = registeredHandler;
                }
            ),
        };

        registerGetTicketTool(fakeServer);

        expect(handler).toBeDefined();

        const result = await handler!({
            id: "TCK001",
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toBe(
            "Employee does not own this resource"
        );
    });
});