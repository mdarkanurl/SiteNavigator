export type Intent =
  | NavigateIntent
  | ShowCodeIntent
  | ShowElementsIntent
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
    fileName: string
  };
};

export type ShowElementsIntent = {
  type: "SHOW";
  payload: {
    target: "elements";
  };
};

export type HelpIntent = {
  type: "HELP";
};

export type ExitIntent = {
  type: "EXIT";
};
