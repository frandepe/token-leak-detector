"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFile = analyzeFile;
const fs = require("fs");
const acorn = require("acorn");
const walk = require("acorn-walk");
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
function analyzeFile(filePath) {
    const findings = [];
    try {
        // Leer el contenido del archivo
        const code = fs.readFileSync(filePath, "utf8");
        // Parsear el código a AST
        // Usamos un try-catch aquí porque algunos archivos podrían no ser JavaScript/TypeScript válido
        try {
            const ast = acorn.parse(code, {
                ecmaVersion: 2020,
                sourceType: "module",
                locations: true,
            });
            // Analizar el AST para encontrar comparaciones inseguras
            walk.simple(ast, {
                // Detectar comparaciones inseguras de contraseñas en if statements
                IfStatement(node) {
                    const test = node.test;
                    if (test &&
                        test.type === "BinaryExpression" &&
                        (test.operator === "==" || test.operator === "===")) {
                        // Verificar si alguno de los lados es un literal de string
                        const leftIsString = test.left.type === "Literal" &&
                            typeof test.left.value === "string";
                        const rightIsString = test.right.type === "Literal" &&
                            typeof test.right.value === "string";
                        if (leftIsString || rightIsString) {
                            const stringValue = leftIsString
                                ? test.left.value
                                : test.right.value;
                            // Verificar si el string es una contraseña común o tiene características de contraseña
                            if (COMMON_PASSWORDS.includes(stringValue) ||
                                (stringValue.length >= 3 &&
                                    /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:'",./<>?]+$/.test(stringValue))) {
                                // Extraer el código de la comparación
                                const comparisonCode = code.substring(test.start, test.end);
                                findings.push({
                                    type: "insecure_password_comparison",
                                    code: comparisonCode,
                                    location: {
                                        line: test.loc.start.line,
                                        column: test.loc.start.column,
                                    },
                                    file: filePath,
                                    severity: "high",
                                    description: `Comparación insegura de contraseña detectada: "${stringValue}"`,
                                });
                            }
                        }
                    }
                },
                // Detectar asignaciones de contraseñas hardcodeadas
                VariableDeclarator(node) {
                    const id = node.id;
                    const init = node.init;
                    if (id &&
                        id.type === "Identifier" &&
                        init &&
                        init.type === "Literal" &&
                        typeof init.value === "string" &&
                        init.value.length >= 3) {
                        const varName = id.name.toLowerCase();
                        const isPasswordVar = PASSWORD_VARIABLE_NAMES.some((name) => varName.includes(name));
                        if (isPasswordVar) {
                            const declarationCode = code.substring(node.start, node.end);
                            findings.push({
                                type: "hardcoded_password",
                                code: declarationCode,
                                location: {
                                    line: node.loc.start.line,
                                    column: node.loc.start.column,
                                },
                                file: filePath,
                                severity: "high",
                                description: `Contraseña hardcodeada detectada en variable "${id.name}"`,
                            });
                        }
                    }
                },
            });
        }
        catch (parseError) {
            // Si hay un error al parsear, simplemente lo registramos y continuamos
            console.error(`Error parsing file ${filePath}:`, parseError);
        }
        return findings;
    }
    catch (error) {
        console.error(`Error analyzing file ${filePath}:`, error);
        return findings;
    }
}
