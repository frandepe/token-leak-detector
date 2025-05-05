export const patterns: RegExp[] = [
  // /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g, // JWT tokens con separaciones de 3 puntos
  // /\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g, // JWT tokens con separaciones de 2 puntos

  /AIza[0-9A-Za-z\-_]{35}/g, // API Key de Google
  /ya29\.[0-9A-Za-z\-_]+/g, // OAuth2 tokens de Google
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key
  /CF_API_KEY\s*=\s*['"]?[A-Za-z0-9-_]{37}['"]?/gi, // Cloudflare Tokens
  /do_\w{64}/g, // DigitalOcean Tokens
  /(?:aws|AWS)?_?secret_?access_?key[^a-zA-Z0-9]?[=:]\s*['"]?[0-9a-zA-Z/+]{40}['"]?/g, // AWS Secret Key
  /(?:aws)?_?session_?token[^a-zA-Z0-9]?[=:]\s*['"]?[A-Za-z0-9/+=]{16,}['"]?/g, // AWS Session Token
  /sk_(live|test)_[0-9a-zA-Z]{24}/g, // Stripe Secret Key
  /pk_(live|test)_[0-9a-zA-Z]{24}/g, // Stripe Public Key
  /ghp_[0-9a-zA-Z]{36}/g, // GitHub Personal Access Token
  /gho_[0-9a-zA-Z]{36}/g, // GitHub OAuth Token
  /SK[0-9a-fA-F]{32}/g, // Generic Secret Key
  /xox[baprs]-[0-9a-zA-Z]{10,48}/g, // Slack Token
  /AC[a-z0-9]{32}/gi, // Twilio SID/Secret
  /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/g, // SendGrid API Key
  // /[0-9a-f]{32}-us[0-9]{1,2}/g, // Firebase Token esto genera un desastre en el codigo
  /firebase[_\-]?secret[^a-zA-Z0-9]?[=:]\s*['"]?[A-Za-z0-9\-_=]{32,}['"]?/g, // Firebase Secret
  /heroku[_\-]?api[_\-]?key[^a-zA-Z0-9]?[=:]\s*['"]?[a-f0-9]{32}['"]?/g, // Heroku API Key
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // Bearer Token
  /(?<!process\.env\.)(?<!import\.meta\.env\.)\b(api[_-]?key|token|secret|access[_-]?token|authorization|auth)[\s:=]+['"][A-Za-z0-9_\-\.=]{8,}['"]/gi, // Generico de claves y tokens, excluye tanto process.env como import.meta.env
  /\baccess_token=([a-zA-Z0-9\-_]+)/gi, // Tokens de acceso
  // /['"][a-f0-9]{32,64}['"]/gi, // Cadenas alfanuméricas de 32 a 64 caracteres
  // /\b[a-f0-9]{40,128}\b/g, // Token con 40 a 128 caracteres hexadecimales
  /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/g, // Claves privadas (RSA, DSA, etc)
  /-----BEGIN PRIVATE KEY-----/g, // Cualquier clave privada
  /\b(client_secret|consumer_secret|auth_token|refresh_token|session_token)[^=\n]{0,20}['"][^'"]{10,}['"]/gi, // Tokens genéricos con valores
  // Exclusión de importaciones de módulos (importaciones de componentes)
  // Excluir las rutas de importación comunes de componentes
  // /import\s+\{?([A-Za-z0-9_-]+)\}?[\s\S]*['"]([A-Za-z0-9_-]+)['"]/g, // Excluye rutas de importación de componentes
  // Comentar esta línea para evitar falsos positivos con asignaciones (ej: api_key = "12345abcdef")
  // /[a-zA-Z0-9_]+\s*=\s*['"][A-Za-z0-9\-_]+['"]/g, // Captura cualquier asignación de variable (ej: api_key = "12345abcdef") puede incluir falso positivo
];

export const passwordPatterns: RegExp[] = [
  /\b(password|pwd|clave|secret|db_pass|token)[\s]*=[\s]*['"][^"']{6,}['"]/g, // Detecta contraseñas con palabras clave
  /(?:const|let|var)\s+\w+\s*=\s*["'][^"']*["']\s*;/g, // Asignaciones de variables con valores
  /[\w]+\s*=\s*["'][^"']{8,}["']/g, // Cualquier asignación de cadenas largas
];

// Detectar comparaciones de contraseñas con valores fijos, como "123456"
export const insecurePasswordComparisonPattern: RegExp[] = [
  /\b(?:if|else if)\s*\(.*\s*==\s*["'][a-zA-Z0-9]{6,}["']\s*\)/g, // Igualdad con contraseñas duras (sin triple igual)
  /\b(?:if|else if)\s*\(.*\s*===\s*["'][a-zA-Z0-9]{6,}["']\s*\)/g, // Comparaciones con contraseñas de texto duro
  /\b(?:if|else if)\s*\(.*\s*==\s*["'][^"']+["']\s*\)/g, // Comparaciones con cualquier cadena de texto (como "qwerty")
  /\b(?:if|else if)\s*\(.*\s*===\s*["'][^"']+["']\s*\)/g, // Comparaciones estrictas con cadenas de texto
];

export const PASSWORD_VARIABLE_NAMES = [
  "password",
  "pwd",
  "pass",
  "secret",
  "credentials",
  "key",
  "apiKey",
  "auth",
  "token",
  "accessToken",
  "refreshToken",
  "clientSecret",
  "userPassword",
  "passphrase",
  "api_secret",
  "dbPassword",
  "userPass",
  "login",
  "sessionKey",
  "securityKey",
  "loginPassword",
  "passwordHash",
  "privateKey",
  "publicKey",
  "authToken",
  "bearerToken",
  "sessionToken",
  "sshKey",
  "cookie",
  "api_token",
];

export const COMMON_PASSWORDS = [
  "123456",
  "password",
  "qwerty",
  "admin",
  "welcome",
  "admin123",
  "letmein",
  "12345678",
  "password123",
  "12345",
  "1234",
  "1q2w3e4r",
  "abc123",
  "password1",
  "qwerty123",
  "iloveyou",
  "monkey",
  "dragon",
  "sunshine",
  "princess",
  "football",
  "111111",
  "123123",
  "welcome123",
  "trustno1",
  "123qwe",
  "1qaz2wsx",
  "letmein123",
  "qwertyuiop",
  "123321",
  "qazwsx",
  "password1",
  "shadow",
  "1password",
  "qwerty1",
];
