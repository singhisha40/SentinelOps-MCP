import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../packages/domain/device.js", () => ({
  getDevice: vi.fn(),
}));

import { getDevice } from "../../../../packages/domain/device.js";
import { registerGetDeviceTool } from "./getDevice.js";

describe("get_device tool", () => {
  it("rejects EMP001 from accessing EMP002's device", async () => {
    vi.mocked(getDevice).mockResolvedValue({
      id: "DEV002",
      employee_id: "EMP002",
      device_type: "LAPTOP",
      manufacturer: "Lenovo",
      model: "ThinkPad T14",
      os: "Windows",
      os_version: "11",
      hostname: "BOB-LAPTOP",
      serial_number: "SN-BOB-002",
      status: "ACTIVE",
      last_seen: null,
    });

    let handler: ((args: { id: string }) => Promise<any>) | undefined;

    const fakeServer = {
      registerTool: vi.fn(
        (
          _name: string,
          _config: unknown,
          registeredHandler: (args: { id: string }) => Promise<any>
        ) => {
          handler = registeredHandler;
        }
      ),
    };

    registerGetDeviceTool(fakeServer);

    expect(handler).toBeDefined();

    const result = await handler!({ id: "DEV002" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      "Employee does not own this resource"
    );
  });
});