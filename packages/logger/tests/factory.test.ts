import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mocks are available when vi.mock factory is hoisted
const { mockPino, mockPinoTransport, mockChildFn, mockPinoInstance } =
  vi.hoisted(() => {
    const mockChildFn = vi.fn();
    const mockPinoInstance = {
      child: mockChildFn,
      info: vi.fn(),
      error: vi.fn(),
    };
    const mockPinoTransport = vi.fn().mockReturnValue({});
    const mockPino = vi.fn().mockReturnValue(mockPinoInstance);

    return { mockPino, mockPinoTransport, mockChildFn, mockPinoInstance };
  });

vi.mock("pino", () => ({
  default: Object.assign(mockPino, {
    transport: mockPinoTransport,
  }),
}));

import { createLogger, createChildLogger } from "../src/factory.js";
import type { ChildLoggerOptions } from "../src/types.js";

describe("createLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPino.mockReturnValue(mockPinoInstance);
    mockPinoTransport.mockReturnValue({});
    mockChildFn.mockReturnValue({ info: vi.fn(), error: vi.fn() });
  });

  it("calls pino() to create a logger", () => {
    createLogger({ name: "test" });
    expect(mockPino).toHaveBeenCalledOnce();
  });

  it("passes the name as a pino option", () => {
    createLogger({ name: "worker" });
    const pinoArgs = mockPino.mock.calls[0]!;
    expect(pinoArgs[0]).toMatchObject({ name: "worker" });
  });

  it("passes the log level to pino", () => {
    createLogger({ name: "test", level: "debug" });
    const pinoArgs = mockPino.mock.calls[0]!;
    expect(pinoArgs[0]).toMatchObject({ level: "debug" });
  });

  it("calls pino.transport with the transport targets", () => {
    createLogger({ name: "test" });
    expect(mockPinoTransport).toHaveBeenCalledOnce();
  });

  it("pino.transport receives a targets array", () => {
    createLogger({ name: "test" });
    const transportArg = mockPinoTransport.mock.calls[0]![0];
    expect(Array.isArray(transportArg.targets)).toBe(true);
  });

  it("passes transport stream as second argument to pino", () => {
    createLogger({ name: "test" });
    const pinoArgs = mockPino.mock.calls[0]!;
    expect(pinoArgs[1]).toBeDefined();
  });

  it("returns the pino logger instance", () => {
    const logger = createLogger({ name: "test" });
    expect(logger).toBe(mockPinoInstance);
  });
});

describe("createChildLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPino.mockReturnValue(mockPinoInstance);
    mockPinoTransport.mockReturnValue({});
  });

  it("calls logger.child() to create a child logger", () => {
    const childInstance = { info: vi.fn(), error: vi.fn() };
    mockChildFn.mockReturnValue(childInstance);

    const parent = createLogger({ name: "test" });
    const options: ChildLoggerOptions = { context: "my-job" };
    createChildLogger(parent, options);
    expect(mockChildFn).toHaveBeenCalledOnce();
  });

  it("binds the context string to the child", () => {
    const childInstance = { info: vi.fn(), error: vi.fn() };
    mockChildFn.mockReturnValue(childInstance);

    const parent = createLogger({ name: "test" });
    createChildLogger(parent, { context: "auto-renew" });
    expect(mockChildFn).toHaveBeenCalledWith(
      expect.objectContaining({ context: "auto-renew" }),
    );
  });

  it("merges extra bindings into the child", () => {
    const childInstance = { info: vi.fn(), error: vi.fn() };
    mockChildFn.mockReturnValue(childInstance);

    const parent = createLogger({ name: "test" });
    createChildLogger(parent, {
      context: "db",
      bindings: { module: "postgres" },
    });
    expect(mockChildFn).toHaveBeenCalledWith(
      expect.objectContaining({ context: "db", module: "postgres" }),
    );
  });

  it("returns the child logger", () => {
    const childInstance = { info: vi.fn(), error: vi.fn() };
    mockChildFn.mockReturnValueOnce(childInstance);

    const parent = createLogger({ name: "test" });
    const child = createChildLogger(parent, { context: "test" });
    expect(child).toBe(childInstance);
  });
});
