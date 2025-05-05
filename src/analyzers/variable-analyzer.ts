import * as ts from "typescript";
import { PASSWORD_VARIABLE_NAMES } from "../config/patterns";
import { Finding } from "../interfaces/analysis";

export function analyzeVariables(
  node: ts.VariableDeclaration,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];
  const id = node.name;
  const init = node.initializer;

  if (ts.isIdentifier(id) && init && ts.isStringLiteral(init)) {
    const varName = id.text.toLowerCase();
    const isPasswordVar = PASSWORD_VARIABLE_NAMES.some((name) =>
      varName.includes(name)
    );

    if (isPasswordVar) {
      const declarationCode = code.substring(node.getStart(), node.getEnd());
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );

      if (!processedLines.has(line)) {
        findings.push({
          type: "hardcoded_password",
          code: declarationCode,
          location: {
            line: line + 1,
            column: character + 1,
          },
          file: filePath,
          severity: "high",
          description: `Contraseña hardcodeada detectada en variable "${id.text}"`,
        });
        processedLines.add(line);
      }
    }
  }

  return findings;
}
