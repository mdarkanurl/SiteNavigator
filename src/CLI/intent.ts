export type Intent =
  | NavigateIntent
  | ShowCodeIntent
  | ShowElementsIntent
  | ClickIntent
  | MoveBackIntent
  | MoveForwardIntent
  | ReloadIntent
  | PrintIntent
  | ScreenshotIntent
  | HelpIntent
  | ExitIntent;

export type NavigateIntent = {
  type: "NAVIGATE";
  payload: {
    url: string;
  };
};

export type ShowCodeIntent = {
  type: "SHOW";
  payload: {
    target: "code";
    fileName: string;
  };
};

export type ShowElementsIntent = {
  type: "SHOW";
  payload: {
    target: "elements";
    fileName: string | null;
  };
};

export type ClickIntent = {
  type: "CLICK";
  payload: {
    target: "click";
    element: string;
  };
};

export type MoveBackIntent = {
  type: "MOVE_BACK";
};

export type MoveForwardIntent = {
  type: "MOVE_FORWARD";
};

export type ReloadIntent = {
  type: "RELOAD";
};

export type PrintIntent = {
  type: "PRINT";
  payload: {
    target: "url" | "title";
  };
};

export type ScreenshotIntent = {
  type: "SCREENSHOT";
  payload: {
    fileName: string;
  };
};

export type HelpIntent = {
  type: "HELP";
};

export type ExitIntent = {
  type: "EXIT";
};
