export type DispatchResult =
  | { success: true; message?: string }
  | { success: false; error: string };
