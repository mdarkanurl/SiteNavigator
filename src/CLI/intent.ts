export type Intent =
  | NavigateIntent
  | OpenIntent
  | ShowCodeIntent
  | ShowElementsIntent
  | InputIntent
  | ClickIntent
  | LinksIntent
  | FollowIntent
  | ActIntent
  | WaitIntent
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

export type OpenIntent = {
  type: "OPEN";
  payload: {
    target: string;
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

export type InputIntent = {
  type: "INPUT";
  payload: {
    fields: Array<{
      target:
        | { mode: "text"; value: string }
        | { mode: "selector"; value: string }
        | { mode: "index"; value: number };
      value: string;
    }>;
    submitText: string;
  };
};

export type ClickIntent = {
  type: "CLICK";
  payload: {
    target:
      | { mode: "selector"; value: string }
      | { mode: "text"; value: string }
      | { mode: "href"; value: string }
      | { mode: "index"; value: number };
  };
};

export type LinksIntent = {
  type: "LINKS";
  payload: {
    filter: string | null;
  };
};

export type FollowIntent = {
  type: "FOLLOW";
  payload: {
    pattern: string;
  };
};

export type ActIntent = {
  type: "ACT";
  payload: {
    id: number;
  };
};

export type WaitIntent = {
  type: "WAIT";
  payload:
    | {
        target: {
          mode: "url";
          pattern: string;
          timeoutMs: number;
        };
      }
    | {
        target: {
          mode: "selector";
          selector: string;
          state: "attached" | "detached" | "visible" | "hidden";
          timeoutMs: number;
        };
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
