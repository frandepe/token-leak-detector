"use strict";
let userPassword;
// Ejemplos de comparaciones inseguras
if (userPassword === "123456") {
    console.log("Login successful");
}
if (userPassword == "qwerty") {
    console.log("ok");
}
if ("admin123" === userPassword) {
    console.log("ok");
}
if (userPassword === "welcome1") {
    console.log("ok");
}
const defaultPassword = "password1235";
let adminPass = "admin123";
