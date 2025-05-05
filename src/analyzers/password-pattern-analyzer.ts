import * as ts from "typescript";

import { patterns } from "../config/patterns";
import { Finding } from "../interfaces/analysis";

export function analyzePasswordPatterns(
  filePath: string,
  code: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(code))) {
      const matchedText = match[0];
      // console.log(`Coincidencia encontrada: ${matchedText}`);
      const startPos = match.index;
      const { line, character } = ts
        .createSourceFile(filePath, code, ts.ScriptTarget.Latest, true)
        .getLineAndCharacterOfPosition(startPos);

      if (!processedLines.has(line)) {
        findings.push({
          type: "password_pattern_match",
          code: matchedText,
          location: {
            line: line + 1,
            column: character + 1,
          },
          file: filePath,
          severity: "high",
          description: `Posible vulnerabilidad de contraseña detectada: "${matchedText}"`,
        });
        processedLines.add(line);
      }
    }
  });

  return findings;
}
