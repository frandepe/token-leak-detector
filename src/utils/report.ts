// Archivo sin utilizar actualmente
import * as fs from "fs";

// Definimos la interfaz 'Report' que describe la estructura del reporte generado
interface Report {
  scannedAt: string; // Fecha y hora en la que se realizó el escaneo
  findings: any; // Resultados del escaneo, pueden ser más específicos dependiendo del tipo de datos
}

// Función para generar el reporte con los resultados del escaneo y guardarlo en un archivo
async function generateReport(results: any, outputPath: string): Promise<void> {
  // Creamos el objeto 'report' que contiene los resultados y la fecha de escaneo
  const report: Report = {
    scannedAt: new Date().toISOString(), // Obtenemos la fecha actual en formato ISO
    findings: results, // Los resultados del escaneo, que incluyen archivos y coincidencias
  };

  // Escribimos el reporte en un archivo JSON en la ruta especificada
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
}

export { generateReport };
