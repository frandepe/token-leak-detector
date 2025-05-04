"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDirectory = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const matchSecrets_1 = require("./matchSecrets");
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
    console.log(ignorePatterns);
    // Función interna recursiva que escanea los subdirectorios
    function scanDir(currentPath) {
        // Leemos el contenido del directorio actual
        const items = fs.readdirSync(currentPath);
        // Iteramos sobre cada archivo o subdirectorio en el directorio actual
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            // Verificamos si el directorio o archivo está en la lista de ignorePatterns
            if (ignorePatterns.some((pattern) => fullPath.includes(pattern))) {
                continue; // Si el archivo o directorio debe ser ignorado, lo saltamos
            }
            // Si el item es un directorio, lo escaneamos recursivamente
            if (stat.isDirectory()) {
                scanDir(fullPath); // Llamada recursiva para escanear el subdirectorio
            }
            else {
                const ext = path.extname(item);
                if (allowedExtensions.includes(ext)) {
                    const content = fs.readFileSync(fullPath, "utf8"); // Leemos el contenido del archivo
                    const matches = (0, matchSecrets_1.matchSecrets)(content); // Usamos la función 'matchSecrets' para encontrar posibles secretos
                    if (matches.length > 0) {
                        result.push({
                            file: fullPath,
                            matches, // Las coincidencias encontradas en el archivo
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
exports.scanDirectory = scanDirectory;
