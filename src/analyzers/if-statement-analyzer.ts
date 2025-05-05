import * as ts from "typescript";
import { COMMON_PASSWORDS } from "../config/patterns";
import { Finding } from "../interfaces/analysis";

export function analyzeIfStatements(
  node: ts.IfStatement,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];
  const test = node.expression;

  if (ts.isBinaryExpression(test)) {
    const leftIsString = ts.isStringLiteral(test.left);
    const rightIsString = ts.isStringLiteral(test.right);

    if (leftIsString || rightIsString) {
      const stringValue = leftIsString
        ? test.left.text
        : rightIsString
        ? test.right.text
        : "";

      let severity: "high" | "medium" | "low" = "high";

      // Criterios para ajustar el nivel de severidad
      if (COMMON_PASSWORDS.includes(stringValue)) {
        severity = "high";
      } else if (stringValue.length < 6) {
        severity = "medium";
      } else {
        severity = "low";
      }

      if (
        COMMON_PASSWORDS.includes(stringValue) ||
        (stringValue.length >= 3 &&
          /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:'",./<>?]+$/.test(stringValue))
      ) {
        const comparisonCode = code.substring(test.getStart(), test.getEnd());
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          test.getStart()
        );

        if (!processedLines.has(line)) {
          findings.push({
            type: "insecure_password_comparison",
            code: comparisonCode,
            location: {
              line: line + 1,
              column: character + 1,
            },
            file: filePath,
            severity,
            description: `Comparación insegura de contraseña detectada: "${stringValue}"`,
          });
          processedLines.add(line);
        }
      }
    }
  }

  return findings;
}
