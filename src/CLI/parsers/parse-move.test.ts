import { parseMove } from "./parse-move";

describe("parseMove", () => {
  test("returns MOVE_BACK intent", () => {
    expect(parseMove(["back"])).toEqual({
      success: true,
      intent: {
        type: "MOVE_BACK",
      },
    });
  });

  test("returns MOVE_FORWARD intent", () => {
    expect(parseMove(["forward"])).toEqual({
      success: true,
      intent: {
        type: "MOVE_FORWARD",
      },
    });
  });

  test("returns error for unsupported move command", () => {
    expect(parseMove(["left"])).toEqual({
      success: false,
      error: "move supports two commands: move back & move forward",
    });
  });
});
