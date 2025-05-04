"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
const fs = require("fs");
// Función para generar el reporte con los resultados del escaneo y guardarlo en un archivo
async function generateReport(results, outputPath) {
    // Creamos el objeto 'report' que contiene los resultados y la fecha de escaneo
    const report = {
        scannedAt: new Date().toISOString(), // Obtenemos la fecha actual en formato ISO
        findings: results, // Los resultados del escaneo, que incluyen archivos y coincidencias
    };
    // Escribimos el reporte en un archivo JSON en la ruta especificada
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
}
