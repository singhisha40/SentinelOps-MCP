import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../packages/domain/device.js", () => ({
  listDevices: vi.fn(),
}));

import { listDevices } from "../../../../packages/domain/device.js";
import { registerListDevicesTool } from "./listDevices.js";

describe("list_devices tool", () => {
  it("forces an employee to use their own employee ID", async () => {
    vi.mocked(listDevices).mockResolvedValue([]);

    let handler: ((args: { employeeId?: string }) => Promise<any>) | undefined;

    const fakeServer = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          registeredHandler: (
            args: { employeeId?: string }
          ) => Promise<any>
        ) => {
          handler = registeredHandler;
        }
      ),
    };

    registerListDevicesTool(fakeServer);

    expect(handler).toBeDefined();

    await handler!({
      employeeId: "EMP002",
    });

    expect(listDevices).toHaveBeenCalledWith("EMP001");
  });
});