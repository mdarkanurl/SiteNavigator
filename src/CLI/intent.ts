export type Intent =
  | NavigateIntent
  | ShowIntent
  | HelpIntent
  | ExitIntent;

export type NavigateIntent = {
  type: "NAVIGATE";
  payload: {
    url: string;
  };
};

export type ShowIntent = {
  type: "SHOW";
  payload: {
    target: "code";
    fileName: string
  };
};

export type HelpIntent = {
  type: "HELP";
};

export type ExitIntent = {
  type: "EXIT";
};
