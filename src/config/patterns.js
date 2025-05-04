"use strict";
// patterns.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.patterns = void 0;
exports.patterns = [
    /AIza[0-9A-Za-z\-_]{35}/g,
    /ya29\.[0-9A-Za-z\-_]+/g,
    /AKIA[0-9A-Z]{16}/g,
    /(?:aws|AWS)?_?secret_?access_?key[^a-zA-Z0-9]?[=:]\s*['"]?[0-9a-zA-Z/+]{40}['"]?/g,
    /(?:aws)?_?session_?token[^a-zA-Z0-9]?[=:]\s*['"]?[A-Za-z0-9/+=]{16,}['"]?/g,
    /sk_(live|test)_[0-9a-zA-Z]{24}/g,
    /pk_(live|test)_[0-9a-zA-Z]{24}/g,
    /ghp_[0-9a-zA-Z]{36}/g,
    /gho_[0-9a-zA-Z]{36}/g,
    /SK[0-9a-fA-F]{32}/g,
    /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
    /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/g,
    /[0-9a-f]{32}-us[0-9]{1,2}/g,
    /firebase[_\-]?secret[^a-zA-Z0-9]?[=:]\s*['"]?[A-Za-z0-9\-_=]{32,}['"]?/g,
    /heroku[_\-]?api[_\-]?key[^a-zA-Z0-9]?[=:]\s*['"]?[a-f0-9]{32}['"]?/g,
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
    /\b(secret|token|api[_-]?key|access[_-]?token|client[_-]?secret|authorization|auth)[\s:=]+['"]?[A-Za-z0-9_\-\.=]{8,}['"]?/gi,
    /\baccess_token=([a-zA-Z0-9\-_]+)/gi,
    /['"][a-f0-9]{32,64}['"]/gi,
    /\b[a-f0-9]{40,128}\b/g,
    /\b[A-Za-z0-9_\-]{20,50}\.[A-Za-z0-9_\-]{20,50}\.[A-Za-z0-9_\-]{20,50}\b/g,
    /-----BEGIN (RSA|DSA|EC|PGP|OPENSSH) PRIVATE KEY-----/g,
    /-----BEGIN PRIVATE KEY-----/g,
    /\b([A-Za-z0-9+\/]{40,}=*)\b/g,
    /\b(client_secret|consumer_secret|auth_token|refresh_token|session_token)[^=\n]{0,20}['"][^'"]{10,}['"]/gi,
    /[a-zA-Z0-9_]+\s*=\s*['"][A-Za-z0-9\-_]+['"]/g, // Captura cualquier asignación de variable (ej: api_key = "12345abcdef")
];
