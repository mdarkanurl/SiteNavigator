
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const regex = /"([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|[^\s]+/g;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(input)) !== null) {
    const token = match[0];
    if (
      (token.startsWith("\"") && token.endsWith("\"")) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      tokens.push(token.slice(1, -1));
    } else {
      tokens.push(token);
    }
  }

  return tokens;
}