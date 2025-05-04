import * as fs from "fs";
import * as path from "path";
import { matchSecrets } from "./matchSecrets";

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
export function scanDirectory(dirPath: string) {
  // Array que contendrá los resultados del escaneo
  const result: any[] = [];

  // Función interna recursiva que escanea los subdirectorios
  function scanDir(currentPath: string) {
    // Leemos el contenido del directorio actual
    const items = fs.readdirSync(currentPath);

    // Iteramos sobre cada archivo o subdirectorio en el directorio actual
    for (const item of items) {
      // Obtenemos la ruta completa del archivo o directorio
      const fullPath = path.join(currentPath, item);
      // Obtenemos información sobre el archivo o directorio (como si es un archivo o directorio)
      const stat = fs.statSync(fullPath);

      // Si el item es un directorio, lo escaneamos recursivamente
      if (stat.isDirectory()) {
        scanDir(fullPath); // Llamada recursiva para escanear el subdirectorio
      } else {
        // Si el item es un archivo, obtenemos su extensión
        const ext = path.extname(item);
        // Si la extensión está permitida, leemos su contenido
        if (allowedExtensions.includes(ext)) {
          const content = fs.readFileSync(fullPath, "utf8"); // Leemos el contenido del archivo
          // Usamos la función 'matchSecrets' para encontrar posibles secretos en el contenido
          const matches = matchSecrets(content);
          // Si se encontraron coincidencias, las agregamos al resultado
          if (matches.length > 0) {
            result.push({
              file: fullPath, // Ruta completa del archivo
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
    scannedAt: new Date().toISOString(), // Fecha y hora del escaneo en formato ISO
    findings: result, // Los archivos escaneados con sus coincidencias de secretos
  };
}
