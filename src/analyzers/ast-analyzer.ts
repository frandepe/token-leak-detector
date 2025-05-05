import * as ts from "typescript";
import { Finding } from "../interfaces/analysis";
import { analyzeComments } from "./comment-analyzer";
import { analyzeIfStatements } from "./if-statement-analyzer";
import { analyzeVariables } from "./variable-analyzer";
import { analyzeHttpRequests } from "./http-request-analyzer";

export function analyzeAst(
  sourceFile: ts.SourceFile,
  code: string,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];

  function visitNode(node: ts.Node) {
    // Analizar comentarios
    findings.push(
      ...analyzeComments(node, code, sourceFile, filePath, processedLines)
    );

    // Analizar if statements
    if (ts.isIfStatement(node)) {
      findings.push(
        ...analyzeIfStatements(node, code, sourceFile, filePath, processedLines)
      );
    }

    // Analizar declaraciones de variables
    if (ts.isVariableDeclaration(node)) {
      findings.push(
        ...analyzeVariables(node, code, sourceFile, filePath, processedLines)
      );
    }

    // Analizar llamadas HTTP (fetch, axios)
    if (ts.isCallExpression(node)) {
      findings.push(
        ...analyzeHttpRequests(node, code, sourceFile, filePath, processedLines)
      );
    }

    // Llamada recursiva para visitar nodos hijo
    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return findings;
}
