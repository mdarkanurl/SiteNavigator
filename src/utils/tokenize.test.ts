import { tokenize } from "./tokenize";

describe("tokenize", () => {
  test("splits plain words by whitespace", () => {
    expect(tokenize("open docs now")).toEqual(["open", "docs", "now"]);
  });

  test("ignores extra whitespace", () => {
    expect(tokenize("  open    docs   now  ")).toEqual(["open", "docs", "now"]);
  });

  test("keeps double-quoted text as one token without quotes", () => {
    expect(tokenize('open "my docs folder" now')).toEqual(["open", "my docs folder", "now"]);
  });

  test("keeps single-quoted text as one token without quotes", () => {
    expect(tokenize("open 'my docs folder' now")).toEqual(["open", "my docs folder", "now"]);
  });

  test("supports mixed quoted and unquoted tokens", () => {
    expect(tokenize("input name 'John Doe' submit")).toEqual(["input", "name", "John Doe", "submit"]);
  });

  test("keeps escaped quote characters inside double-quoted token", () => {
    expect(tokenize('say "a\\\"b" now')).toEqual(["say", "a\\\"b", "now"]);
  });

  test("keeps escaped quote characters inside single-quoted token", () => {
    expect(tokenize("say 'a\\\'b' now")).toEqual(["say", "a\\\'b", "now"]);
  });

  test("returns empty array for empty input", () => {
    expect(tokenize("")).toEqual([]);
  });

  test("returns empty array for whitespace-only input", () => {
    expect(tokenize("    \t   ")).toEqual([]);
  });

  test("keeps unmatched quote as regular token", () => {
    expect(tokenize("open \"docs folder")).toEqual(["open", "\"docs", "folder"]);
  });
});
