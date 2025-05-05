import * as fs from "fs";
import * as ts from "typescript";
import { Finding } from "../interfaces/analysis";
import { analyzePasswordPatterns } from "../analyzers/password-pattern-analyzer";
import { analyzeAst } from "../analyzers/ast-analyzer";

export function analyzeFile(filePath: string): Finding[] {
  const findings: Finding[] = [];
  const processedLines = new Set<number>(); // Conjunto para almacenar las líneas procesadas

  try {
    const code = fs.readFileSync(filePath, "utf8");

    // Analizar patrones de contraseñas
    findings.push(...analyzePasswordPatterns(filePath, code, processedLines));

    try {
      // Analizar el AST
      const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true
      );

      findings.push(...analyzeAst(sourceFile, code, filePath, processedLines));
    } catch (err) {
      console.error("Error en el análisis del archivo:", err);
    }
  } catch (err) {
    console.error("Error al leer el archivo:", err);
  }

  return findings;
}
