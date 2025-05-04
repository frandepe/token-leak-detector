#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import { scanDirectory } from "./services/scanner";

// Crear una nueva instancia de Command
const program = new Command();

// Configurar el programa
program
  .name("token-leak-detector")
  .version("1.3.0")
  .description(
    "Herramienta para detectar posibles tokens o secretos en archivos fuente."
  )
  .requiredOption("-p, --path <path>", "Path to scan")
  .option("-o, --output <output>", "Output file")
  .option(
    "-i, --ignore <patterns>",
    "Comma separated list of patterns to ignore"
  )
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
  ? options.ignore.split(",").map((pattern: string) => pattern.trim())
  : [];

// Mostrar información sobre la ejecución
console.log(`Scanning path: ${options.path}`);
if (ignorePatterns.length > 0) {
  console.log(`Ignoring patterns: ${ignorePatterns.join(", ")}`);
}

try {
  // Ejecutar el escaneo
  const scanResult = scanDirectory(options.path, ignorePatterns);

  // Filtrar los resultados para omitir el archivo "src\\config\\patterns.ts"
  const filteredFindings = scanResult.findings.filter((finding: any) => {
    return !(
      finding.file === "src\\config\\patterns.ts" ||
      finding.file === "src\\config\\patterns.js"
    );
  });

  // Formatear los resultados para una mejor visualización
  const formattedResults = {
    scannedAt: scanResult.scannedAt,
    findings: filteredFindings.map((finding: any) => {
      const result: any = {
        file: finding.file,
      };

      // Eliminar completamente regexMatches de los resultados
      // No agregamos ni mantenemos regexMatches
      // if (finding.matches && finding.matches.length > 0) {
      //   result.regexMatches = finding.matches;  // Eliminar esta parte
      // }

      if (finding.astFindings && finding.astFindings.length > 0) {
        result.codeAnalysis = finding.astFindings.map((f: any) => ({
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
  } else {
    if (options.verbose) {
      console.log(JSON.stringify(formattedResults, null, 2));
    } else {
      // Mostrar un resumen más conciso
      console.log(`\nScan completed at: ${formattedResults.scannedAt}`);
      console.log(`Files with findings: ${formattedResults.findings.length}`);

      formattedResults.findings.forEach((finding: any) => {
        console.log(`\nFile: ${finding.file}`);

        // No mostrar regexMatches, ya que hemos eliminado ese campo
        if (finding.codeAnalysis) {
          console.log(`  Code issues: ${finding.codeAnalysis.length}`);
          finding.codeAnalysis.forEach((issue: any) => {
            console.log(
              `    - [${issue.severity.toUpperCase()}] ${
                issue.description
              } (line ${issue.line})`
            );
          });
        }
      });
    }
  }
} catch (error: any) {
  console.error("Error during scan:", error.message);
  process.exit(1);
}
