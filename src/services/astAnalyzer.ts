import * as fs from "fs";
import * as ts from "typescript";

// Lista de contraseñas comunes o débiles para detectar
const COMMON_PASSWORDS = [
  "123456",
  "password",
  "qwerty",
  "admin",
  "welcome",
  "admin123",
  "letmein",
  "12345678",
  "password123",
];

// Nombres de variables que podrían contener contraseñas
const PASSWORD_VARIABLE_NAMES = [
  "password",
  "pwd",
  "pass",
  "secret",
  "credentials",
  "key",
];

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
    // Leer el contenido del archivo
    const code = fs.readFileSync(filePath, "utf8");

    // Parsear el código TypeScript a AST
    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true
      );

      // Función recursiva para analizar el AST y detectar los hallazgos
      function visitNode(node: ts.Node) {
        if (ts.isIfStatement(node)) {
          // Analizar la condición de la sentencia `if`
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

              // Verificar si el string es una contraseña común o tiene características de contraseña
              if (
                COMMON_PASSWORDS.includes(stringValue) ||
                (stringValue.length >= 3 &&
                  /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:'",./<>?]+$/.test(
                    stringValue
                  ))
              ) {
                // Extraer el código de la comparación
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
                    line: line + 1, // +1 para convertir de índice basado en 0 a índice basado en 1
                    column: character + 1, // +1 para convertir de índice basado en 0 a índice basado en 1
                  },
                  file: filePath,
                  severity: "high",
                  description: `Comparación insegura de contraseña detectada: "${stringValue}"`,
                });
              }
            }
          }
        }

        // Detectar asignaciones de contraseñas hardcodeadas
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
                  line: line + 1, // +1 para convertir de índice basado en 0 a índice basado en 1
                  column: character + 1, // +1 para convertir de índice basado en 0 a índice basado en 1
                },
                file: filePath,
                severity: "high",
                description: `Contraseña hardcodeada detectada en variable "${id.text}"`,
              });
            }
          }
        }

        // Buscar llamadas HTTP que envíen claves o tokens en la URL o en el body
        if (ts.isCallExpression(node)) {
          const expression = node.expression;

          if (ts.isIdentifier(expression) && expression.text === "fetch") {
            const args = node.arguments;

            if (args.length > 0) {
              const urlArg = args[0];

              if (ts.isStringLiteral(urlArg)) {
                const urlValue = urlArg.text;

                // Buscar tokens o claves en la URL
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
                      line: line + 1, // +1 para convertir de índice basado en 0 a índice basado en 1
                      column: character + 1, // +1 para convertir de índice basado en 0 a índice basado en 1
                    },
                    file: filePath,
                    severity: "high",
                    description: `Clave o token enviado en la URL detectado en la llamada fetch: "${urlValue}"`,
                  });
                }
              }
            }
          }
        }

        // Recursivamente visitar los hijos del nodo actual
        ts.forEachChild(node, visitNode);
      }

      // Comenzar la visita de nodos en el AST
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
