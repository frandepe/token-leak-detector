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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFilesForTokens = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const patterns_1 = require("../config/patterns");
// Función asíncrona para escanear los archivos de un directorio en busca de patrones específicos
function scanFilesForTokens(scanPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = []; // Array donde se guardarán los resultados del escaneo
        // Leemos todos los archivos dentro del directorio especificado
        const files = fs.readdirSync(scanPath);
        // Iteramos sobre cada archivo dentro del directorio
        for (let file of files) {
            // Obtenemos la ruta completa del archivo
            const filePath = path.join(scanPath, file);
            // Obtenemos información del archivo, como si es un directorio o un archivo normal
            const stats = fs.statSync(filePath);
            // Excluimos los archivos "patterns.js" y "patterns.ts" de la búsqueda
            // Esto evita que el archivo de patrones sea escaneado como parte del código
            if (file === "patterns.js" || file === "patterns.ts") {
                continue;
            }
            // Si es un directorio, llamamos recursivamente a la función para escanear su contenido
            if (stats.isDirectory()) {
                const subResults = yield scanFilesForTokens(filePath);
                // Añadimos los resultados del subdirectorio al array de resultados
                results = [...results, ...subResults];
            }
            else if (stats.isFile() && // Si es un archivo (no un directorio)
                (file.endsWith(".js") || file.endsWith(".ts")) // Solo escaneamos archivos .js y .ts
            ) {
                // Leemos el contenido del archivo en formato UTF-8
                const fileContent = fs.readFileSync(filePath, "utf8");
                // Usamos un Set para almacenar solo coincidencias únicas (evita duplicados)
                const matches = new Set();
                // Iteramos sobre todos los patrones definidos en "patterns"
                for (const pattern of patterns_1.patterns) {
                    // Utilizamos matchAll para encontrar todas las coincidencias del patrón en el contenido del archivo
                    const found = [...fileContent.matchAll(pattern)].map((m) => m[0]);
                    // Agregamos cada coincidencia encontrada al Set
                    found.forEach((match) => matches.add(match)); // Solo se agrega una vez cada coincidencia
                }
                // Si hay coincidencias encontradas, las añadimos a los resultados
                if (matches.size > 0) {
                    results.push({
                        file: filePath,
                        matches: Array.from(matches), // Convertimos el Set de coincidencias a un array
                    });
                }
            }
        }
        // Devolvemos el array con los resultados de la búsqueda
        return results;
    });
}
exports.scanFilesForTokens = scanFilesForTokens;
