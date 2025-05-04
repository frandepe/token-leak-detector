"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchSecrets = matchSecrets;
const patterns_1 = require("../config/patterns");
// Función que recibe un contenido en texto y busca coincidencias de secretos usando los patrones definidos
function matchSecrets(content) {
    // Creamos un array vacío donde almacenaremos todas las coincidencias encontradas
    const matches = [];
    // Iteramos sobre cada patrón definido en el archivo de configuración "patterns"
    for (const regex of patterns_1.patterns) {
        // Usamos el método match para encontrar todas las coincidencias del patrón en el contenido
        const found = content.match(regex);
        // Si se encontraron coincidencias, las agregamos al array "matches"
        if (found) {
            matches.push(...found); // Usamos el operador spread "..." para añadir las coincidencias encontradas
        }
    }
    return matches;
}
