# Token Leak Detector

**Token Leak Detector** es una herramienta para detectar posibles tokens, claves API y otros secretos en tu código fuente. Actualmente, está diseñada para trabajar con proyectos escritos en **JavaScript** y **TypeScript**.

## Instalación

Instala el paquete globalmente usando npm:

npm install -g token-leak-detector

## Uso básico

Una vez instalado, puedes ejecutar la herramienta desde la línea de comandos con el siguiente comando:

```bash
npx token-leak-detector --path <ruta-del-codigo> --output <nombre-del-archivo-de-reporte.json>
```

Opciones

```bash

Usage: token-leak-detector [options]

Options:
  -p, --path <path>      Ruta del archivo o carpeta a escanear. Ej: ./src
  -o, --output <archivo>  Archivo donde guardar el resultado del escaneo en formato JSON
  -i, --ignore <archivos> Archivos a ignorar, separados por comas (ej. "token.ts,secret.ts")
  -h, --help              Muestra ayuda con las opciones disponibles.

```

## Tipos de vulnerabilidades detectadas

🔐 Contraseñas hardcodeadas (hardcoded*password)<br>
\*\*\_const db_pass = "abc123";*\*\*

⚠️ Comparaciones inseguras de contraseñas (insecure*password_comparison)<br>
\*\*\_if (pass === "123456") { ... }*\*\*

🌐 Tokens o claves sensibles en URLs (sensitive*data_in_url), incluyendo:<br>
\*\*\_fetch("https://api.example.com?token=abc123")***<br>
**_axios.get("https://api.example.com", { params: { token: "abc123" } })_\*\*

🔍 7. Análisis de comentarios peligrosos<br>
**_// TODO: quitar esta key antes de subir<br>
// apiKey: "1234"_**

## Ejemplo de uso

Escanea el directorio src y guarda los resultados en un archivo llamado report.json (se genera automáticamente):

```bash
npx token-leak-detector --path ./src --output report.json --ignore "authConfig.ts"
```

## Ejemplo de reporte

El archivo de salida (por ejemplo report.json) tendrá la siguiente estructura:

```json
{
  "scannedAt": "2025-05-04T20:21:43.103Z",
  "totalFindings": 7,
  "findings": [
    {
      "file": "src/routes/authenticate.ts",
      "codeAnalysis": [
        {
          "type": "hardcoded_password",
          "code": "password = \"A1dm1n!123\"",
          "line": 3,
          "column": 7,
          "severity": "high",
          "description": "Contraseña hardcodeada detectada en variable \"password\""
        }
      ]
    },
    {
      "file": "src/routes/user.ts",
      "codeAnalysis": [
        {
          "type": "hardcoded_password",
          "code": "db_pass: string = \"root2025\"",
          "line": 3,
          "column": 5,
          "severity": "high",
          "description": "Contraseña hardcodeada detectada en variable \"db_pass\""
        },
        {
          "type": "sensitive_data_in_url",
          "code": "fetch(\"https://api.example.com?token=AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\")",
          "line": 7,
          "column": 28,
          "severity": "high",
          "description": "Clave o token enviado en la URL detectado en la llamada fetch"
        }
      ]
    },
    {
      "file": "src/routes/payment.ts",
      "codeAnalysis": [
        {
          "type": "insecure_password_comparison",
          "code": "st_sprite === \"st_test_1237dc\"",
          "line": 4,
          "column": 5,
          "severity": "high",
          "description": "Comparación insegura de contraseña detectada: \"st_test_1237dc\""
        },
        {
          "type": "insecure_password_comparison",
          "code": "PAYPAL_CLIENT_SECRET == \"EJIXvJko-ExampleSecret-AGIXJAI01\"",
          "line": 7,
          "column": 5,
          "severity": "high",
          "description": "Comparación insegura de contraseña detectada: \"EJIXvJko-ExampleSecret-AGIXJAI01\""
        },
        {
          "type": "sensitive_data_in_comment",
          "code": "apiKeyGH: \"ghp_abCDEfgHIJKlmNOPqrSTuvWXyZaBcDeFgHiJ\"",
          "line": 33,
          "column": 1,
          "severity": "high",
          "description": "Clave o token encontrado en un comentario: \"apiKeyGH: \"ghp_abCDEfgHIJKlmNOPqrSTuvWXyZaBcDeFgHiJ\"\""
        }
      ]
    },
    {
      "file": "src/routes/userProfile.ts",
      "codeAnalysis": [
        {
          "type": "insecure_password_comparison",
          "code": "userPassword == \"qwerty!23\"",
          "line": 6,
          "column": 5,
          "severity": "high",
          "description": "Comparación insegura de contraseña detectada: \"qwerty!23\""
        }
      ]
    }
  ]
}
```

### Autor

Este proyecto fue creado y mantenido por **Franco De Paulo**.<br>
Puedes visitar [Mi Web](https://frandepe.vercel.app/)
