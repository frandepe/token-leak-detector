"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDirectory = scanDirectory;
const fs = require("fs");
const path = require("path");
const matchSecrets_1 = require("./matchSecrets");
const astAnalyzer_1 = require("./astAnalyzer");
// Definimos las extensiones de archivo permitidas para el escaneo
const allowedExtensions = [
    ".js",
    ".ts",
    ".json",
    ".env",
    ".txt",
    ".jsx",
    ".tsx",
];
// Función principal para escanear un directorio y encontrar archivos con posibles secretos
function scanDirectory(dirPath, ignorePatterns) {
    const result = [];
    // Función interna recursiva que escanea los subdirectorios
    function scanDir(currentPath) {
        // Leemos el contenido del directorio actual
        const items = fs.readdirSync(currentPath);
        // Iteramos sobre cada archivo o subdirectorio en el directorio actual
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            // Verificamos si el directorio o archivo está en la lista de ignorePatterns
            if (ignorePatterns.some((pattern) => {
                // Si el patrón contiene separadores de ruta, comparamos con la ruta completa
                if (pattern.includes(path.sep)) {
                    return fullPath.includes(pattern);
                }
                // Si es solo un nombre de archivo, comparamos con el nombre base del archivo
                else {
                    return path.basename(fullPath) === pattern;
                }
            })) {
                continue; // Si el archivo o directorio debe ser ignorado, lo saltamos
            }
            // Si el item es un directorio, lo escaneamos recursivamente
            if (stat.isDirectory()) {
                scanDir(fullPath); // Llamada recursiva para escanear el subdirectorio
            }
            else {
                const ext = path.extname(item);
                if (allowedExtensions.includes(ext)) {
                    // Análisis basado en expresiones regulares
                    const content = fs.readFileSync(fullPath, "utf8"); // Leemos el contenido del archivo
                    const regexMatches = (0, matchSecrets_1.matchSecrets)(content); // Usamos la función 'matchSecrets' para encontrar posibles secretos
                    // Análisis basado en AST para archivos JavaScript/TypeScript
                    let astFindings = [];
                    if ([".js", ".ts", ".jsx", ".tsx"].includes(ext)) {
                        astFindings = (0, astAnalyzer_1.analyzeFile)(fullPath);
                    }
                    // Combinamos los resultados
                    if (regexMatches.length > 0 || astFindings.length > 0) {
                        result.push({
                            file: fullPath, // Ruta completa del archivo
                            matches: regexMatches, // Las coincidencias encontradas con regex
                            astFindings: astFindings, // Las coincidencias encontradas con AST
                        });
                    }
                }
            }
        }
    }
    // Iniciamos el escaneo del directorio principal
    scanDir(dirPath);
    // Devolvemos los resultados del escaneo junto con la fecha de escaneo
    return {
        scannedAt: new Date().toISOString(),
        findings: result,
    };
}
