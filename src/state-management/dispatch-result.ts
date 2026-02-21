export type DispatchResult =
  | { success: true; message?: string; data?: unknown }
  | { success: false; error: string };
