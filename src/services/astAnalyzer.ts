import * as fs from "fs";
import * as ts from "typescript";
import { COMMON_PASSWORDS, PASSWORD_VARIABLE_NAMES } from "../config/patterns";

interface Finding {
  type: string;
  code: string;
  location: {
    line: number;
    column: number;
  };
  file: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export function analyzeFile(filePath: string): Finding[] {
  const findings: Finding[] = [];

  try {
    const code = fs.readFileSync(filePath, "utf8");

    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true
      );

      function visitNode(node: ts.Node) {
        // Buscar comentarios en el código fuente
        const comments = ts.getLeadingCommentRanges(code, node.getFullStart());

        if (comments) {
          comments.forEach((comment) => {
            const commentText = code.substring(comment.pos, comment.end).trim();

            // Buscar si contiene un posible token o clave
            const keyPattern = /(apiKey|token|key|auth)[:\s]*["']([^"']+)["']/i;
            const match = keyPattern.exec(commentText);

            if (match) {
              const keyComment = match[0];
              const { line, character } =
                sourceFile.getLineAndCharacterOfPosition(comment.pos);

              findings.push({
                type: "sensitive_data_in_comment",
                code: keyComment,
                location: {
                  line: line + 1,
                  column: character + 1,
                },
                file: filePath,
                severity: "high", // Aquí puedes ajustar el nivel de severidad
                description: `Clave o token encontrado en un comentario: "${keyComment}"`,
              });
            }
          });
        }

        // Analizar otros tipos de nodos, como if statements, variables, etc.
        if (ts.isIfStatement(node)) {
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
                  /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:'",./<>?]+$/.test(
                    stringValue
                  ))
              ) {
                const comparisonCode = code.substring(
                  test.getStart(),
                  test.getEnd()
                );

                const { line, character } =
                  sourceFile.getLineAndCharacterOfPosition(test.getStart());

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
              }
            }
          }
        }

        if (ts.isVariableDeclaration(node)) {
          const id = node.name;
          const init = node.initializer;

          if (ts.isIdentifier(id) && init && ts.isStringLiteral(init)) {
            const varName = id.text.toLowerCase();
            const isPasswordVar = PASSWORD_VARIABLE_NAMES.some((name) =>
              varName.includes(name)
            );

            if (isPasswordVar) {
              const declarationCode = code.substring(
                node.getStart(),
                node.getEnd()
              );

              const { line, character } =
                sourceFile.getLineAndCharacterOfPosition(node.getStart());

              findings.push({
                type: "hardcoded_password",
                code: declarationCode,
                location: {
                  line: line + 1,
                  column: character + 1,
                },
                file: filePath,
                severity: "high", // Esto se puede ajustar según tus criterios
                description: `Contraseña hardcodeada detectada en variable "${id.text}"`,
              });
            }
          }
        }

        if (ts.isCallExpression(node)) {
          const expression = node.expression;

          // Detección para fetch con claves en URL
          if (ts.isIdentifier(expression) && expression.text === "fetch") {
            const args = node.arguments;

            if (args.length > 0) {
              const urlArg = args[0];

              if (ts.isStringLiteral(urlArg)) {
                const urlValue = urlArg.text;

                const tokenPattern = /[?&](token|apiKey|key|auth)=([^&]+)/i;
                if (tokenPattern.test(urlValue)) {
                  const fetchCode = code.substring(
                    node.getStart(),
                    node.getEnd()
                  );
                  const { line, character } =
                    sourceFile.getLineAndCharacterOfPosition(node.getStart());

                  findings.push({
                    type: "sensitive_data_in_url",
                    code: fetchCode,
                    location: {
                      line: line + 1,
                      column: character + 1,
                    },
                    file: filePath,
                    severity: "high", // Aquí también puedes aplicar tu lógica
                    description: `Clave o token enviado en la URL detectado en la llamada fetch: "${urlValue}"`,
                  });
                }
              }
            }
          }

          // Detección para axios y axios.get/post/... con claves en URL o params
          if (
            (ts.isIdentifier(expression) && expression.text === "axios") ||
            (ts.isPropertyAccessExpression(expression) &&
              ts.isIdentifier(expression.expression) &&
              expression.expression.text === "axios")
          ) {
            const args = node.arguments;

            // Caso: axios("https://...") con token en la URL
            if (args.length > 0 && ts.isStringLiteral(args[0])) {
              const urlValue = args[0].text;
              const tokenPattern = /[?&](token|apiKey|key|auth)=([^&]+)/i;

              if (tokenPattern.test(urlValue)) {
                const axiosCode = code.substring(
                  node.getStart(),
                  node.getEnd()
                );
                const { line, character } =
                  sourceFile.getLineAndCharacterOfPosition(node.getStart());

                findings.push({
                  type: "sensitive_data_in_url",
                  code: axiosCode,
                  location: {
                    line: line + 1,
                    column: character + 1,
                  },
                  file: filePath,
                  severity: "high", // Aquí también puedes aplicar tu lógica
                  description: `Clave o token enviado en la URL detectado en llamada axios: "${urlValue}"`,
                });
              }
            }

            // Caso: axios.get/post("...", { params: { token: "..." } })
            if (args.length > 1 && ts.isObjectLiteralExpression(args[1])) {
              const configObject = args[1];
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
                      ["token", "apiKey", "key", "auth"].includes(
                        paramProp.name.text
                      ) &&
                      ts.isStringLiteral(paramProp.initializer)
                    ) {
                      const axiosCode = code.substring(
                        node.getStart(),
                        node.getEnd()
                      );
                      const { line, character } =
                        sourceFile.getLineAndCharacterOfPosition(
                          node.getStart()
                        );

                      findings.push({
                        type: "sensitive_data_in_url",
                        code: axiosCode,
                        location: {
                          line: line + 1,
                          column: character + 1,
                        },
                        file: filePath,
                        severity: "high", // Aquí también puedes aplicar tu lógica
                        description: `Clave o token enviado en "params" en llamada axios: ${paramProp.name.text}`,
                      });
                    }
                  });
                }
              });
            }

            // Caso: axios({ url: "..." }) con token en la URL
            if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
              const config = args[0];

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
                    const axiosCode = code.substring(
                      node.getStart(),
                      node.getEnd()
                    );
                    const { line, character } =
                      sourceFile.getLineAndCharacterOfPosition(node.getStart());

                    findings.push({
                      type: "sensitive_data_in_url",
                      code: axiosCode,
                      location: {
                        line: line + 1,
                        column: character + 1,
                      },
                      file: filePath,
                      severity: "high", // Aquí también puedes aplicar tu lógica
                      description: `Clave o token enviado en la URL detectado en llamada axios: "${urlValue}"`,
                    });
                  }
                }
              });
            }
          }
        }

        ts.forEachChild(node, visitNode);
      }

      visitNode(sourceFile);
    } catch (parseError) {
      console.error(`Error parsing file ${filePath}:`, parseError);
    }

    return findings;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    return findings;
  }
}
