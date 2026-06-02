// build.js — inject env variable ke JS sebelum deploy
// Jalankan: node build.js
// Butuh: APPS_TOKEN di environment Vercel

const fs   = require("fs");
const path = require("path");

const token = process.env.APPS_TOKEN || "";
const dist  = path.join(__dirname, "dist");

// Copy semua file ke dist
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "dist" || entry.name === "node_modules" || entry.name === "build.js" || entry.name === "vercel.json") continue;
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

copyDir(__dirname, dist);

// Inject token ke scriptorder.js — prepend sebagai var global
const jsPath = path.join(dist, "js", "scriptorder.js");
const js     = fs.readFileSync(jsPath, "utf8");
// Jangan inject di dalam DOMContentLoaded — prepend di luar sebagai global var
fs.writeFileSync(jsPath, `var __APPS_TOKEN__ = "${token}";\n` + js);

// Inject token ke order.html — replace placeholder di inline script
const htmlPath = path.join(dist, "order.html");
let html = fs.readFileSync(htmlPath, "utf8");
// Tidak perlu inject ke HTML karena sudah pakai typeof __APPS_TOKEN__ dari scriptorder.js
// Tapi order.html punya inline script sendiri yang juga butuh token
html = html.replace(
  `var TOKEN = typeof __APPS_TOKEN__ !== "undefined" ? __APPS_TOKEN__ : "";`,
  `var __APPS_TOKEN__ = "${token}"; var TOKEN = __APPS_TOKEN__;`
);
fs.writeFileSync(htmlPath, html);

console.log("Build selesai. Token:", token ? "✓ ada" : "✗ kosong (set APPS_TOKEN di Vercel)");