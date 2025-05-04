// patterns.ts

export const patterns: RegExp[] = [
  /AIza[0-9A-Za-z\-_]{35}/g, // API Key de Google
  /ya29\.[0-9A-Za-z\-_]+/g, // OAuth2 tokens de Google
  /AKIA[0-9A-Z]{16}/g, // AWS Access Key
  /(?:aws|AWS)?_?secret_?access_?key[^a-zA-Z0-9]?[=:]\s*['"]?[0-9a-zA-Z/+]{40}['"]?/g, // AWS Secret Key
  /(?:aws)?_?session_?token[^a-zA-Z0-9]?[=:]\s*['"]?[A-Za-z0-9/+=]{16,}['"]?/g, // AWS Session Token
  /sk_(live|test)_[0-9a-zA-Z]{24}/g, // Stripe Secret Key
  /pk_(live|test)_[0-9a-zA-Z]{24}/g, // Stripe Public Key
  /ghp_[0-9a-zA-Z]{36}/g, // GitHub Personal Access Token
  /gho_[0-9a-zA-Z]{36}/g, // GitHub OAuth Token
  /SK[0-9a-fA-F]{32}/g, // Generic Secret Key
  /xox[baprs]-[0-9a-zA-Z]{10,48}/g, // Slack Token
  /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/g, // SendGrid API Key
  /[0-9a-f]{32}-us[0-9]{1,2}/g, // Firebase Token
  /firebase[_\-]?secret[^a-zA-Z0-9]?[=:]\s*['"]?[A-Za-z0-9\-_=]{32,}['"]?/g, // Firebase Secret
  /heroku[_\-]?api[_\-]?key[^a-zA-Z0-9]?[=:]\s*['"]?[a-f0-9]{32}['"]?/g, // Heroku API Key
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // Bearer Token
  /\b(secret|token|api[_-]?key|access[_-]?token|client[_-]?secret|authorization|auth)[\s:=]+['"]?[A-Za-z0-9_\-\.=]{8,}['"]?/gi, // Generico de claves y tokens
  /\baccess_token=([a-zA-Z0-9\-_]+)/gi, // Tokens de acceso
  /['"][a-f0-9]{32,64}['"]/gi, // Cadenas alfanuméricas de 32 a 64 caracteres
  /\b[a-f0-9]{40,128}\b/g, // Token con 40 a 128 caracteres hexadecimales
  /\b[A-Za-z0-9_\-]{20,50}\.[A-Za-z0-9_\-]{20,50}\.[A-Za-z0-9_\-]{20,50}\b/g, // JWT tokens
  /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/g, // Claves privadas (RSA, DSA, etc)
  /-----BEGIN PRIVATE KEY-----/g, // Cualquier clave privada
  /\b([A-Za-z0-9+\/]{40,}=*)\b/g, // Base64 encoded tokens
  /\b(client_secret|consumer_secret|auth_token|refresh_token|session_token)[^=\n]{0,20}['"][^'"]{10,}['"]/gi, // Tokens genéricos con valores
  /[a-zA-Z0-9_]+\s*=\s*['"][A-Za-z0-9\-_]+['"]/g, // Captura cualquier asignación de variable (ej: api_key = "12345abcdef")
];
