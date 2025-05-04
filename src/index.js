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
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const scanner_1 = require("./services/scanner");
const program = new commander_1.Command();
program
    .option("-p, --path <path>", "Path to scan") // Opción para especificar la ruta a escanear
    .option("-o, --output <output>", "Output file") // Opción para especificar el archivo de salida
    .option("-i, --ignore <ignore>", "Comma separated list of patterns to ignore"); // Opción para especificar patrones a ignorar
program.parse(process.argv);
const options = program.opts();
const { path, output, ignore } = options;
// Comprobamos si se proporcionó una ruta para escanear
if (!path) {
    console.log("Please provide a path to scan.");
    process.exit(1);
}
// Si se proporcionó un ignore, lo procesamos y convertimos en un array
const ignorePatterns = ignore ? ignore.split(",") : [];
// Llamamos a la función scanDirectory pasando el ignorePatterns
const scanResult = (0, scanner_1.scanDirectory)(path, ignorePatterns);
// Si se especificó un archivo de salida, escribimos el resultado en ese archivo
if (output) {
    fs.writeFileSync(output, JSON.stringify(scanResult, null, 2));
}
else {
    console.log(scanResult);
}
