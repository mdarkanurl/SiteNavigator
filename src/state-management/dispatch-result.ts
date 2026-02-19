export type DispatchResult =
  | { success: true; message?: string, data?: any }
  | { success: false; error: string };
