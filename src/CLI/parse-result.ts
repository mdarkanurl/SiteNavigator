import { Intent } from "./intent";

export type ParseResult =
  | { success: true; intent: Intent }
  | { success: false; error: string };
