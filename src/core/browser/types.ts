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
