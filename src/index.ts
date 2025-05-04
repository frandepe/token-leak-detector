// Importamos la librería "commander" para manejar las opciones de línea de comandos
import { Command } from "commander";
import * as fs from "fs";

// Importamos la función scanDirectory que escaneará los archivos dentro del directorio
import { scanDirectory } from "./services/scanner";

const program = new Command();

// Definimos las opciones disponibles para el comando
program
  .option("-p, --path <path>", "Path to scan") // Opción para especificar la ruta a escanear
  .option("-o, --output <output>", "Output file"); // Opción para especificar el archivo de salida

// Parseamos los argumentos de la línea de comandos
program.parse(process.argv);

// Obtenemos las opciones ingresadas por el usuario desde los argumentos
const options = program.opts();
const { path, output } = options;

// Comprobamos si se proporcionó una ruta para escanear
if (!path) {
  console.log("Please provide a path to scan.");
  // Si no se proporcionó una ruta, mostramos un mensaje y terminamos el proceso
  process.exit(1);
}

// Si se proporcionó una ruta, llamamos a la función scanDirectory para escanear el directorio
const scanResult = scanDirectory(path);

// Si se especificó un archivo de salida, escribimos el resultado en ese archivo
if (output) {
  // Escribimos el resultado del escaneo en el archivo especificado en formato JSON
  fs.writeFileSync(output, JSON.stringify(scanResult, null, 2));
} else {
  // Si no se especificó un archivo de salida, mostramos el resultado en la consola
  console.log(scanResult);
}
