export type AppState = {
  browserStarted: boolean;
  pageLoaded: boolean;
  currentUrl: string | null;
};

export function createInitialState(): AppState {
  return {
    browserStarted: false,
    pageLoaded: false,
    currentUrl: null,
  };
}
