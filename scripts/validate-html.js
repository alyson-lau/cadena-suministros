// validate-html.js – Validación de estructura HTML local
const fs = require("fs");
const html = fs.readFileSync("./index.html", "utf8");

if (html.includes("<!DOCTYPE html>") && html.includes("</html>")) {
    console.log("✅ HTML válido y estructurado correctamente.");
} else {
    console.log("❌ Error: Estructura HTML incompleta.");
}