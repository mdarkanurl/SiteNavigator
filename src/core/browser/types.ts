import type { ClickIntent } from "../../CLI/intent";

export type ClickTarget = ClickIntent["payload"]["target"];

export type InteractiveItem = {
  id: number;
  tag: string;
  text: string;
  href: string | null;
  resolvedHref: string | null;
  selector: string;
};

export type WaitTarget =
  | {
      mode: "url";
      pattern: string;
      timeoutMs: number;
    }
  | {
      mode: "selector";
      selector: string;
      state: "attached" | "detached" | "visible" | "hidden";
      timeoutMs: number;
    };
