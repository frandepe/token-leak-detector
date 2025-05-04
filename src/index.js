#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = require("fs");
const scanner_1 = require("./services/scanner");
// Crear una nueva instancia de Command
const program = new commander_1.Command();
// Configurar el programa
program
    .name("token-leak-detector")
    .version("1.3.0")
    .description("Herramienta para detectar posibles tokens o secretos en archivos fuente.")
    .requiredOption("-p, --path <path>", "Path to scan")
    .option("-o, --output <output>", "Output file")
    .option("-i, --ignore <patterns>", "Comma separated list of patterns to ignore")
    .option("-v, --verbose", "Show detailed output")
    .parse();
// Obtener las opciones
const options = program.opts();
// Verificar que se proporcionó una ruta
if (!options.path) {
    console.error("Error: Please provide a path to scan using --path option");
    program.help();
    process.exit(1);
}
// Procesar los patrones a ignorar
const ignorePatterns = options.ignore
    ? options.ignore.split(",").map((pattern) => pattern.trim())
    : [];
// Mostrar información sobre la ejecución
console.log(`Scanning path: ${options.path}`);
if (ignorePatterns.length > 0) {
    console.log(`Ignoring patterns: ${ignorePatterns.join(", ")}`);
}
try {
    // Ejecutar el escaneo
    const scanResult = (0, scanner_1.scanDirectory)(options.path, ignorePatterns);
    // Filtrar los resultados para omitir el archivo "src\\config\\patterns.ts"
    const filteredFindings = scanResult.findings.filter((finding) => {
        return finding.file !== "src\\config\\patterns.ts"; // Omitir el archivo específico
    });
    // Formatear los resultados para una mejor visualización
    const formattedResults = {
        scannedAt: scanResult.scannedAt,
        findings: filteredFindings.map((finding) => {
            const result = {
                file: finding.file,
            };
            if (finding.matches && finding.matches.length > 0) {
                result.regexMatches = finding.matches;
            }
            if (finding.astFindings && finding.astFindings.length > 0) {
                result.codeAnalysis = finding.astFindings.map((f) => ({
                    type: f.type,
                    code: f.code,
                    line: f.location.line,
                    column: f.location.column,
                    severity: f.severity,
                    description: f.description,
                }));
            }
            return result;
        }),
    };
    // Guardar o mostrar los resultados
    if (options.output) {
        fs.writeFileSync(options.output, JSON.stringify(formattedResults, null, 2));
        console.log(`Results saved to: ${options.output}`);
    }
    else {
        if (options.verbose) {
            console.log(JSON.stringify(formattedResults, null, 2));
        }
        else {
            // Mostrar un resumen más conciso
            console.log(`\nScan completed at: ${formattedResults.scannedAt}`);
            console.log(`Files with findings: ${formattedResults.findings.length}`);
            formattedResults.findings.forEach((finding) => {
                console.log(`\nFile: ${finding.file}`);
                if (finding.regexMatches) {
                    console.log(`  Regex matches: ${finding.regexMatches.length}`);
                }
                if (finding.codeAnalysis) {
                    console.log(`  Code issues: ${finding.codeAnalysis.length}`);
                    finding.codeAnalysis.forEach((issue) => {
                        console.log(`    - [${issue.severity.toUpperCase()}] ${issue.description} (line ${issue.line})`);
                    });
                }
            });
        }
    }
}
catch (error) {
    console.error("Error during scan:", error.message);
    process.exit(1);
}
