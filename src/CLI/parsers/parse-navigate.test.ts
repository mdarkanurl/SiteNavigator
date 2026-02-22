import assert from "node:assert/strict";

import { parseNavigate } from "./parse-navigate";

const result = parseNavigate(["https://example.com"]);

assert.equal(result.success, true);
if (!result.success) {
  throw new Error("Expected parseNavigate to succeed");
}

assert.deepEqual(result.intent, {
  type: "NAVIGATE",
  payload: {
    url: "https://example.com/",
  },
});

console.log("parseNavigate test passed");
