import * as ts from "typescript";
import { Finding } from "../interfaces/analysis";

export function analyzeHttpRequests(
  node: ts.CallExpression,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];
  const expression = node.expression;

  // Analizar llamadas fetch
  if (ts.isIdentifier(expression) && expression.text === "fetch") {
    findings.push(
      ...analyzeFetchCall(node, code, sourceFile, filePath, processedLines)
    );
  }

  // Analizar llamadas axios
  if (
    (ts.isIdentifier(expression) && expression.text === "axios") ||
    (ts.isPropertyAccessExpression(expression) &&
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === "axios")
  ) {
    findings.push(
      ...analyzeAxiosCall(node, code, sourceFile, filePath, processedLines)
    );
  }

  return findings;
}

function analyzeFetchCall(
  node: ts.CallExpression,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];
  const args = node.arguments;

  if (args.length > 0) {
    const urlArg = args[0];

    if (ts.isStringLiteral(urlArg)) {
      const urlValue = urlArg.text;
      const tokenPattern = /[?&](token|apiKey|key|auth)=([^&]+)/i;

      if (tokenPattern.test(urlValue)) {
        const fetchCode = code.substring(node.getStart(), node.getEnd());
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );

        if (!processedLines.has(line)) {
          findings.push({
            type: "sensitive_data_in_url",
            code: fetchCode,
            location: {
              line: line + 1,
              column: character + 1,
            },
            file: filePath,
            severity: "high",
            description: `Clave o token enviado en la URL detectado en la llamada fetch: "${urlValue}"`,
          });
          processedLines.add(line);
        }
      }
    }
  }

  return findings;
}

function analyzeAxiosCall(
  node: ts.CallExpression,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];
  const args = node.arguments;

  // Caso: axios("https://...") con token en la URL
  if (args.length > 0 && ts.isStringLiteral(args[0])) {
    const urlValue = args[0].text;
    const tokenPattern = /[?&](token|apiKey|key|auth)=([^&]+)/i;

    if (tokenPattern.test(urlValue)) {
      const axiosCode = code.substring(node.getStart(), node.getEnd());
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );

      if (!processedLines.has(line)) {
        findings.push({
          type: "sensitive_data_in_url",
          code: axiosCode,
          location: {
            line: line + 1,
            column: character + 1,
          },
          file: filePath,
          severity: "high",
          description: `Clave o token enviado en la URL detectado en llamada axios: "${urlValue}"`,
        });
        processedLines.add(line);
      }
    }
  }

  // Caso: axios.get/post("...", { params: { token: "..." } })
  if (args.length > 1 && ts.isObjectLiteralExpression(args[1])) {
    findings.push(
      ...analyzeAxiosParams(
        node,
        args[1],
        code,
        sourceFile,
        filePath,
        processedLines
      )
    );
  }

  // Caso: axios({ url: "..." }) con token en la URL
  if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
    findings.push(
      ...analyzeAxiosConfig(
        node,
        args[0],
        code,
        sourceFile,
        filePath,
        processedLines
      )
    );
  }

  return findings;
}

function analyzeAxiosParams(
  node: ts.CallExpression,
  configObject: ts.ObjectLiteralExpression,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];

  configObject.properties.forEach((prop) => {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === "params" &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      prop.initializer.properties.forEach((paramProp) => {
        if (
          ts.isPropertyAssignment(paramProp) &&
          ts.isIdentifier(paramProp.name) &&
          ["token", "apiKey", "key", "auth"].includes(paramProp.name.text) &&
          ts.isStringLiteral(paramProp.initializer)
        ) {
          const axiosCode = code.substring(node.getStart(), node.getEnd());
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
          );

          if (!processedLines.has(line)) {
            findings.push({
              type: "sensitive_data_in_url",
              code: axiosCode,
              location: {
                line: line + 1,
                column: character + 1,
              },
              file: filePath,
              severity: "high",
              description: `Clave o token enviado en "params" en llamada axios: ${paramProp.name.text}`,
            });
            processedLines.add(line);
          }
        }
      });
    }
  });

  return findings;
}

function analyzeAxiosConfig(
  node: ts.CallExpression,
  config: ts.ObjectLiteralExpression,
  code: string,
  sourceFile: ts.SourceFile,
  filePath: string,
  processedLines: Set<number>
): Finding[] {
  const findings: Finding[] = [];

  config.properties.forEach((prop) => {
    if (
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === "url" &&
      ts.isStringLiteral(prop.initializer)
    ) {
      const urlValue = prop.initializer.text;
      const tokenPattern = /[?&](token|apiKey|key|auth)=([^&]+)/i;

      if (tokenPattern.test(urlValue)) {
        const axiosCode = code.substring(node.getStart(), node.getEnd());
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );

        if (!processedLines.has(line)) {
          findings.push({
            type: "sensitive_data_in_url",
            code: axiosCode,
            location: {
              line: line + 1,
              column: character + 1,
            },
            file: filePath,
            severity: "high",
            description: `Clave o token enviado en la URL detectado en llamada axios: "${urlValue}"`,
          });
          processedLines.add(line);
        }
      }
    }
  });

  return findings;
}
