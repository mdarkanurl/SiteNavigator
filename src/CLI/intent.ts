export type Intent =
  | NavigateIntent
  | CaptureIntent
  | ClickIntent
  | ShowIntent
  | HelpIntent
  | ExitIntent;

export type NavigateIntent = {
  type: "NAVIGATE";
  payload: {
    url: string;
  };
};

export type CaptureIntent = {
  type: "CAPTURE";
  payload: {
    selector: string;
  };
};

export type ClickIntent = {
  type: "CLICK";
  payload: {
    selector: string;
  };
};

export type ShowIntent = {
  type: "SHOW";
  payload: {
    target: "code";
  };
};

export type HelpIntent = {
  type: "HELP";
};

export type ExitIntent = {
  type: "EXIT";
};
