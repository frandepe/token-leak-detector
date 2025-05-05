// Archivo sin utilizar actualmente
import * as fs from "fs";
import * as path from "path";
import { patterns } from "../config/patterns";

interface TokenMatch {
  file: string; // Ruta del archivo donde se encontraron coincidencias
  matches: string[]; // Lista de las coincidencias encontradas en el archivo
}

// Función asíncrona para escanear los archivos de un directorio en busca de patrones específicos
async function scanFilesForTokens(scanPath: string): Promise<TokenMatch[]> {
  let results: TokenMatch[] = []; // Array donde se guardarán los resultados del escaneo

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
      const subResults = await scanFilesForTokens(filePath);
      // Añadimos los resultados del subdirectorio al array de resultados
      results = [...results, ...subResults];
    } else if (
      stats.isFile() && // Si es un archivo (no un directorio)
      (file.endsWith(".js") || file.endsWith(".ts")) // Solo escaneamos archivos .js y .ts
    ) {
      // Leemos el contenido del archivo en formato UTF-8
      const fileContent = fs.readFileSync(filePath, "utf8");

      // Usamos un Set para almacenar solo coincidencias únicas (evita duplicados)
      const matches: Set<string> = new Set();

      // Iteramos sobre todos los patrones definidos en "patterns"
      for (const pattern of patterns) {
        // Utilizamos matchAll para encontrar todas las coincidencias del patrón en el contenido del archivo
        const found = [...fileContent.matchAll(pattern)].map((m) => m[0]);

        // Agregamos cada coincidencia encontrada al Set
        found.forEach((match) => matches.add(match)); // Solo se agrega una vez cada coincidencia
      }

      // Si hay coincidencias encontradas, las añadimos a los resultados
      if (matches.size > 0) {
        results.push({
          file: filePath, // Ruta del archivo donde se encontraron las coincidencias
          matches: Array.from(matches), // Convertimos el Set de coincidencias a un array
        });
      }
    }
  }

  // Devolvemos el array con los resultados de la búsqueda
  return results;
}

// Exportamos la función para que pueda ser utilizada en otros archivos
export { scanFilesForTokens };
