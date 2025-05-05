import * as ts from "typescript";
import { Finding } from "../interfaces/analysis";

export function analyzeComments(
  node: ts.Node,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];

  const comments = ts.getLeadingCommentRanges(code, node.getFullStart());

  if (comments) {
    comments.forEach((comment) => {
      const commentText = code.substring(comment.pos, comment.end).trim();

      // Buscar si contiene un posible token o clave
      const keyPattern = /(apiKey|token|key|auth)[:\s]*["']([^"']+)["']/i;
      const match = keyPattern.exec(commentText);

      if (match) {
        const keyComment = match[0];
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          comment.pos
        );

        if (!processedLines.has(line)) {
          findings.push({
            type: "sensitive_data_in_comment",
            code: keyComment,
            location: {
              line: line + 1,
              column: character + 1,
            },
            file: filePath,
            severity: "high",
            description: `Clave o token encontrado en un comentario: "${keyComment}"`,
          });
          processedLines.add(line);
        }
      }
    });
  }

  return findings;
}
