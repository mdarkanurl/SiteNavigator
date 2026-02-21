import { tokenize } from "../utils/tokenize";
import { ParseResult } from "./parse-result";
import { parseNavigate } from "./parsers/parse-navigate";
import { parseOpen } from "./parsers/parse-open";
import { parseShow } from "./parsers/parse-show";
import { parseClick } from "./parsers/parse-click";
import { parseLinks } from "./parsers/parse-links";
import { parseFollow } from "./parsers/parse-follow";
import { parseAct } from "./parsers/parse-act";
import { parseMove } from "./parsers/parse-move";
import { parsePrint } from "./parsers/parse-print";
import { parseScreenshot } from "./parsers/parse-screenshot";

export function parseInput(line: string): ParseResult {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
      success: false,
      error: "Empty command",
    };
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0];
  const args = tokens.slice(1);

  switch (command) {
    case "navigate":
      return parseNavigate(args);

    case "open":
      return parseOpen(args);

    case "show":
      return parseShow(args);

    case "click":
      return parseClick(args);

    case "links":
      return parseLinks(args);

    case "follow":
      return parseFollow(args);

    case "act":
      return parseAct(args);

    case "move":
      return parseMove(args);

    case "reload":
      return {
        success: true,
        intent: { type: "RELOAD" },
      };

    case "print":
      return parsePrint(args);

    case "screenshot":
      return parseScreenshot(args);

    case "help":
      return {
        success: true,
        intent: { type: "HELP" },
      };

    case "exit":
      return {
        success: true,
        intent: { type: "EXIT" },
      };

    default:
      return {
        success: false,
        error: `Unknown command: ${command}`,
      };
  }
}
