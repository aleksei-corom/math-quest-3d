#!/usr/bin/env node
/**
 * sync-question-bank.mjs — mantiene sincronizada la bank de preguntas entre
 * la variante web (Three.js) y la variante Godot 4.
 *
 * Qué compara:
 *   1. Bloques por mundo (posición, tipo, color hex)  — js/questions/questionBank.js ↔ data/question_bank.gd
 *   2. Metadatos de mundos (tema, cielo, suelo)        — js/config.js             ↔ data/question_bank.gd
 *   3. Cobertura de grados por generador (5..11)       — js/questions/questionBank.js ↔ data/question_generators.gd
 *   4. Inventario de cadenas de los generadores (textos de preguntas/pistas/
 *      opciones): multiconjunto de literales, con exclusión documentada de
 *      claves estructurales y de las omisiones intencionales del port.
 *
 * Uso:
 *   node tools/sync-question-bank.mjs [--web <dir>] [--godot <dir>] [--write-data] [--json] [--help]
 *
 *   --web        raíz de la variante web   (por defecto: repo actual)
 *   --godot      raíz del proyecto Godot   (por defecto: godot-port/, ../godot-port/,
 *                ../math-quest-3d-godot/; si no existe, error de instalación)
 *   --write-data regenera datos del lado Godot DESDE el JS: la región const
 *                BLOCKS completa y los campos theme/sky/ground de const WORLDS
 *                (label/icon son propios de Godot y se preservan intactos).
 *                Solo escribe si hay cambios; luego re-verifica y sale con el
 *                estado final (0 = sincronizado; el drift de generadores no es
 *                regenerable y queda señalado para arreglo manual).
 *   --json       salida machine-readable
 *
 * Códigos de salida: 0 = sincronizado · 1 = drift detectado · 2 = error de setup
 *
 * Notas de diseño:
 *   - Por defecto es solo lectura: ante drift imprime un diff accionable.
 *     --write-data reescribe SOLO datos deterministas (bloques/colores/temas);
 *     los generadores son código en ambos lados y nunca se regeneran.
 *   - Las dificultades (getRange/drand/dpick) existen en el JS pero NUNCA se
 *     invocan (dead code): se excluyen del port y de esta comparación.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WORLDS = ["overworld", "mines", "nether", "end"];

// Cadenas que existen en un solo lado por decisión de diseño (no son drift):
const IGNORE_GODOT = ["fuera de rango", "Mundo desconocido"]; // warnings del port
const IGNORE_JS_EXACT = new Set(["normal"]); // default de getDifficulty() (dead code)
const IGNORE_EXACT_ANY = new Set(["%.2f%%"]); // implementación de pct en GDScript (misma salida)
// GDScript cita nombres que en JS son identificadores desnudos (match/Callable):
const IGNORE_GD_STRUCT = new Set(["overworld", "mines", "nether", "end", "linear", "quadratic", "probability"]);
const STRUCT_KEYS = new Set(["q", "a", "hint", "type", "options"]); // claves {..} solo cotizadas en GDScript
// Literales de 1 carácter = operadores de concatenación/formato ("+", "%")…
// (regla documentada: el contenido real de las preguntas siempre tiene palabras)
const isNoiseLiteral = (s) => s.length <= 1;

function fail(msg) {
	console.error("[sync] ERROR: " + msg);
	process.exit(2);
}

function parseArgs(argv) {
	const args = { web: null, godot: null, json: false, help: false, writeData: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--web") args.web = argv[++i];
		else if (a === "--godot") args.godot = argv[++i];
		else if (a === "--write-data") args.writeData = true;
		else if (a === "--json") args.json = true;
		else if (a === "--help" || a === "-h") args.help = true;
		else fail("argumento desconocido: " + a + " (usa --help)");
	}
	return args;
}

function usage() {
	console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0] + "*/");
}

function readText(path) {
	if (!existsSync(path)) fail("no existe: " + path);
	return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

// ── extracción lado JS ─────────────────────────────────────────────────

function jsWorldSegments(text, anchor, indent) {
	// segmenta por "\n<indent><world>: {" dentro de un objeto JS
	const pad = " ".repeat(indent);
	const marks = [];
	for (const w of WORLDS) {
		const idx = text.indexOf("\n" + pad + w + ": {", anchor);
		if (idx < 0) fail("js: no se encontró el mundo '" + w + "' tras el ancla");
		marks.push({ world: w, idx });
	}
	const out = [];
	for (let i = 0; i < marks.length; i++) {
		const end = i + 1 < marks.length ? marks[i + 1].idx : text.indexOf("\n};", marks[i].idx);
		out.push({ world: marks[i].world, seg: text.slice(marks[i].idx, end) });
	}
	return out;
}

function extractJsBlocks(bankText) {
	const anchor = bankText.indexOf("const QuestionBank");
	if (anchor < 0) fail("js: no se encontró 'const QuestionBank'");
	const blocks = {};
	const re = /position:\s*\{\s*x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*z:\s*(-?\d+)\s*\},\s*type:\s*'([^']+)',\s*color:\s*0x([0-9a-fA-F]+)/g;
	for (const { world, seg } of jsWorldSegments(bankText, anchor, 4)) {
		blocks[world] = [];
		let m;
		re.lastIndex = 0;
		while ((m = re.exec(seg)) !== null) {
			blocks[world].push({
				pos: [Number(m[1]), Number(m[2]), Number(m[3])],
				type: m[4],
				color: m[5].toLowerCase(),
			});
		}
	}
	return blocks;
}

function extractJsThemesAndColors(bankText, configText) {
	const themeMap = {};
	const tm = /QUESTION_THEMES\s*=\s*\{([\s\S]*?)\n\};/.exec(configText);
	if (!tm) fail("js/config.js: no se encontró QUESTION_THEMES");
	for (const m of tm[1].matchAll(/(\w+):\s*'([^']+)'/g)) themeMap[m[1]] = m[2];

	const wcAnchor = configText.indexOf("WORLD_COLORS");
	if (wcAnchor < 0) fail("js/config.js: no se encontró WORLD_COLORS");
	const out = {};
	const bankAnchor = bankText.indexOf("const QuestionBank");
	for (const { world, seg } of jsWorldSegments(bankText, bankAnchor, 4)) {
		const themeKey = /theme:\s*QUESTION_THEMES\.(\w+)/.exec(seg);
		const wcSeg = jsWorldSegments(configText, wcAnchor, 8).find((s) => s.world === world);
		const sky = wcSeg ? /sky:\s*0x([0-9a-fA-F]+)/.exec(wcSeg.seg) : null;
		const ground = wcSeg ? /ground:\s*0x([0-9a-fA-F]+)/.exec(wcSeg.seg) : null;
		out[world] = {
			theme: themeKey ? themeMap[themeKey[1]] ?? null : null,
			sky: sky ? sky[1].toLowerCase() : null,
			ground: ground ? ground[1].toLowerCase() : null,
		};
	}
	return out;
}

function extractJsGrades(generatorsText) {
	const marks = ["linear(grade){", "quadratic(grade){", "probability(grade){", "mixed(grade){"]
		.map((k) => generatorsText.indexOf(k))
		.filter((i) => i >= 0);
	if (marks.length < 4) fail("js: no se encontraron los 4 generadores");
	const names = ["linear", "quadratic", "probability", "mixed"];
	const out = {};
	for (let i = 0; i < names.length; i++) {
		const region = generatorsText.slice(marks[i], i + 1 < marks.length ? marks[i + 1] : generatorsText.length);
		const grades = new Set();
		for (const m of region.matchAll(/(\d+):\s*\(\s*\)\s*=>/g)) grades.add(Number(m[1]));
		out[names[i]] = [...grades].sort((a, b) => a - b);
	}
	return out;
}

function extractJsStrings(generatorsText) {
	const start = generatorsText.indexOf("const QuestionGenerators");
	if (start < 0) fail("js: no se encontró 'const QuestionGenerators'");
	let region = generatorsText.slice(start);
	region = region
		.split("\n")
		.filter((l) => !/^\s*\/\//.test(l))
		.join("\n");
	const counts = new Map();
	for (const m of region.matchAll(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g)) {
		let s = m[0].slice(1, -1).replace(/\\(.)/g, "$1");
		if (s === "" || STRUCT_KEYS.has(s) || IGNORE_JS_EXACT.has(s) || IGNORE_EXACT_ANY.has(s) || isNoiseLiteral(s)) continue;
		counts.set(s, (counts.get(s) ?? 0) + 1);
	}
	return counts;
}

// ── extracción lado Godot ──────────────────────────────────────────────

function gdConstRegion(text, marker) {
	const start = text.indexOf(marker);
	if (start < 0) fail("godot: no se encontró '" + marker + "'");
	const end = text.indexOf("\n}", start);
	if (end < 0) fail("godot: const sin cierre para '" + marker + "'");
	return text.slice(start, end);
}

function extractGdBlocks(bankText) {
	const region = gdConstRegion(bankText, "const BLOCKS := {");
	const blocks = {};
	for (const wm of region.matchAll(/\t"(\w+)": \[([\s\S]*?)\n\t\]/g)) {
		blocks[wm[1]] = [];
		for (const m of wm[2].matchAll(/\{"position": Vector3\((-?\d+), (-?\d+), (-?\d+)\), "type": "([^"]+)", "color": Color\("([0-9a-fA-F]+)"\)\}/g)) {
			blocks[wm[1]].push({
				pos: [Number(m[1]), Number(m[2]), Number(m[3])],
				type: m[4],
				color: m[5].toLowerCase(),
			});
		}
	}
	return blocks;
}

function extractGdWorlds(bankText) {
	const region = gdConstRegion(bankText, "const WORLDS := {");
	const out = {};
	for (const wm of region.matchAll(/\t"(\w+)": \{([\s\S]*?)\n\t\}/g)) {
		const body = wm[2];
		const theme = /"theme": "([^"]+)"/.exec(body);
		const sky = /"sky": Color\("([0-9a-fA-F]+)"\)/.exec(body);
		const ground = /"ground": Color\("([0-9a-fA-F]+)"\)/.exec(body);
		out[wm[1]] = {
			theme: theme ? theme[1] : null,
			sky: sky ? sky[1].toLowerCase() : null,
			ground: ground ? ground[1].toLowerCase() : null,
		};
	}
	return out;
}

function extractGdGrades(genText) {
	const names = ["_linear_one", "_quadratic_one", "_probability_one"];
	const out = {};
	for (let i = 0; i < names.length; i++) {
		const start = genText.indexOf("func " + names[i]);
		if (start < 0) fail("godot: no se encontró func " + names[i]);
		const end = i + 1 < names.length ? genText.indexOf("func " + names[i + 1]) : genText.indexOf("func mixed");
		const region = genText.slice(start, end < 0 ? genText.length : end);
		const grades = new Set();
		for (const m of region.matchAll(/^\t\t(\d+):$/gm)) grades.add(Number(m[1]));
		out[["linear", "quadratic", "probability"][i]] = [...grades].sort((a, b) => a - b);
	}
	out.mixed = []; // mixed no tiene ramas por grado (gira sobre los otros 3)
	return out;
}

function extractGdStrings(genText) {
	const counts = new Map();
	const lines = genText.split("\n").filter((l) => !/^\s*#/.test(l));
	for (const line of lines) {
		for (const m of line.matchAll(/"(?:[^"\\]|\\.)*"/g)) {
			let s = m[0].slice(1, -1).replace(/\\(.)/g, "$1");
			if (s === "" || STRUCT_KEYS.has(s) || IGNORE_EXACT_ANY.has(s) || IGNORE_GD_STRUCT.has(s) || isNoiseLiteral(s)) continue;
			if (IGNORE_GODOT.some((k) => s.includes(k))) continue;
			counts.set(s, (counts.get(s) ?? 0) + 1);
		}
	}
	return counts;
}

// ── comparación ────────────────────────────────────────────────────────

function diffBlocks(jsBlocks, gdBlocks) {
	const issues = [];
	for (const w of WORLDS) {
		const a = jsBlocks[w] ?? [];
		const b = gdBlocks[w] ?? [];
		if (!gdBlocks[w]) { issues.push(`godot: falta el mundo '${w}' en BLOCKS`); continue; }
		const n = Math.max(a.length, b.length);
		for (let i = 0; i < n; i++) {
			const fmt = (x) => (x ? `Vector3(${x.pos.join(", ")}) '${x.type}' #${x.color}` : "<ausente>");
			if (!a[i] || !b[i] || a[i].pos.join() !== b[i].pos.join() || a[i].type !== b[i].type || a[i].color !== b[i].color) {
				issues.push(`bloques[${w}][${i}]  web: ${fmt(a[i])}  |  godot: ${fmt(b[i])}`);
			}
		}
	}
	return issues;
}

function diffWorlds(jsW, gdW) {
	const issues = [];
	for (const w of WORLDS) {
		const a = jsW[w];
		const b = gdW[w];
		if (!b) { issues.push(`godot: falta el mundo '${w}' en WORLDS`); continue; }
		for (const field of ["theme", "sky", "ground"]) {
			if (a[field] !== b[field]) {
				issues.push(`mundo '${w}'.${field}  web: ${JSON.stringify(a[field])}  |  godot: ${JSON.stringify(b[field])}`);
			}
		}
	}
	return issues;
}

function diffGrades(jsG, gdG) {
	const issues = [];
	for (const gen of ["linear", "quadratic", "probability", "mixed"]) {
		const a = (jsG[gen] ?? []).join(",");
		const b = (gdG[gen] ?? []).join(",");
		if (a !== b) issues.push(`grados(${gen})  web: [${a}]  |  godot: [${b}]`);
	}
	return issues;
}

function diffStrings(jsStr, gdStr) {
	const onlyJs = [];
	const onlyGd = [];
	const keys = new Set([...jsStr.keys(), ...gdStr.keys()]);
	for (const k of [...keys].sort()) {
		const a = jsStr.get(k) ?? 0;
		const b = gdStr.get(k) ?? 0;
		if (a !== b) {
			if (a > 0) onlyJs.push({ text: k, js: a, godot: b });
			else onlyGd.push({ text: k, js: a, godot: b });
		}
	}
	return { onlyJs, onlyGd };
}

// ── regeneración (--write-data) ────────────────────────────────────────────────

/**
 * Regenera en el texto de question_bank.gd SOLO datos deterministas desde el JS:
 *   - la región const BLOCKS completa (posición/tipo/color por mundo), y
 *   - los campos theme/sky/ground de const WORLDS (label/icon son de Godot).
 * Devuelve el texto nuevo sin escribir; el llamador decide si hay cambios.
 */
function regenerateBankGd(bankText, jsBlocks, jsWorlds) {
	const q = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

	// 1) const BLOCKS := { … } — reconstruir entero
	const bStart = bankText.indexOf("const BLOCKS := {");
	if (bStart < 0) fail("godot: no se encontró 'const BLOCKS := {'");
	const bEnd = bankText.indexOf("\n}", bStart);
	if (bEnd < 0) fail("godot: const BLOCKS sin cierre");
	const lines = ["const BLOCKS := {"];
	for (const w of WORLDS) {
		const arr = jsBlocks[w] ?? [];
		if (arr.length === 0) fail(`js: mundo '${w}' sin bloques; no se regenera BLOCKS`);
		lines.push(`\t"${w}": [`);
		for (const b of arr) {
			lines.push(`\t	{"position": Vector3(${b.pos.join(", ")}), "type": "${q(b.type)}", "color": Color("${b.color}")},`);
		}
		lines.push("\t],");
	}
	lines.push("}");
	let out = bankText.slice(0, bStart) + lines.join("\n") + bankText.slice(bEnd + 2);

	// 2) const WORLDS := { … } — parchear solo theme/sky/ground, preservar label/icon
	const wStart = out.indexOf("const WORLDS := {");
	if (wStart < 0) fail("godot: no se encontró 'const WORLDS := {'");
	for (const w of WORLDS) {
		const i = out.indexOf(`\t"${w}": {`, wStart);
		if (i < 0) continue; // mundo ausente → lo reporta el diff final
		const j = out.indexOf("\n\t}", i);
		if (j < 0) continue;
		let seg = out.slice(i, j);
		const js = jsWorlds[w] ?? {};
		if (js.theme != null) seg = seg.replace(/"theme": "[^"]*"/, `"theme": "${q(js.theme)}"`);
		if (js.sky != null) seg = seg.replace(/"sky": Color\("[0-9a-fA-F]*"\)/, `"sky": Color("${js.sky}")`);
		if (js.ground != null) seg = seg.replace(/"ground": Color\("[0-9a-fA-F]*"\)/, `"ground": Color("${js.ground}")`);
		out = out.slice(0, i) + seg + out.slice(j);
	}
	return out;
}

// ── main ───────────────────────────────────────────────────────────────

function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) { usage(); process.exit(0); }

	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const webRoot = resolve(args.web ?? join(scriptDir, ".."));
	let godotRoot = args.godot ? resolve(args.godot) : null;
	if (!godotRoot) {
		for (const cand of ["godot-port", "../godot-port", "../math-quest-3d-godot"]) {
			const p = resolve(webRoot, cand);
			if (existsSync(join(p, "data", "question_bank.gd"))) { godotRoot = p; break; }
		}
	}
	if (!godotRoot || !existsSync(join(godotRoot, "data", "question_bank.gd"))) {
		fail("no se encontró el proyecto Godot (¿clonado en godot-port/?). Usa --godot <dir>.");
	}

	const bankJs = readText(join(webRoot, "js", "questions", "questionBank.js"));
	const configJs = readText(join(webRoot, "js", "config.js"));
	const bankGdPath = join(godotRoot, "data", "question_bank.gd");
	const rawGd = readFileSync(bankGdPath, "utf8"); // crudo para conservar EOL al escribir
	const bankGd = rawGd.replace(/\r\n/g, "\n");
	const genGd = readText(join(godotRoot, "data", "question_generators.gd"));

	const jsBlocks = extractJsBlocks(bankJs);
	const jsWorlds = extractJsThemesAndColors(bankJs, configJs);

	// --write-data: regenerar datos deterministas desde el JS y luego re-verificar
	let gdText = bankGd;
	let wrote = false;
	if (args.writeData) {
		const next = regenerateBankGd(bankGd, jsBlocks, jsWorlds);
		if (next !== bankGd) {
			writeFileSync(bankGdPath, rawGd.includes("\r\n") ? next.replace(/\n/g, "\r\n") : next, "utf8");
			wrote = true;
			gdText = next;
		}
	}
	const gdBlocks = extractGdBlocks(gdText);
	const gdWorlds = extractGdWorlds(gdText);
	const jsGrades = extractJsGrades(bankJs);
	const gdGrades = extractGdGrades(genGd);
	const jsStr = extractJsStrings(bankJs);
	const gdStr = extractGdStrings(genGd);

	const report = {
		blocks: diffBlocks(jsBlocks, gdBlocks),
		worlds: diffWorlds(jsWorlds, gdWorlds),
		grades: diffGrades(jsGrades, gdGrades),
		strings: diffStrings(jsStr, gdStr),
	};
	const drift =
		report.blocks.length +
		report.worlds.length +
		report.grades.length +
		report.strings.onlyJs.length +
		report.strings.onlyGd.length;

	if (args.json) {
		console.log(JSON.stringify({ ok: drift === 0, drift, wrote, ...report }, null, 2));
		process.exit(drift === 0 ? 0 : 1);
	}

	const line = "─".repeat(64);
	console.log("[sync] web:   " + webRoot);
	console.log("[sync] godot: " + godotRoot);
	if (args.writeData) {
		console.log(wrote
			? "[sync] --write-data: question_bank.gd REGENERADO desde el JS (bloques + theme/sky/ground)."
			: "[sync] --write-data: question_bank.gd ya estaba al día (sin escritura).");
	}
	console.log(line);
	console.log(`bloques:   web=${WORLDS.map((w) => (jsBlocks[w] ?? []).length).join("/")}  godot=${WORLDS.map((w) => (gdBlocks[w] ?? []).length).join("/")}`);
	console.log(`cadenas:   web=${[...jsStr.values()].reduce((a, b) => a + b, 0)}  godot=${[...gdStr.values()].reduce((a, b) => a + b, 0)}`);
	console.log(line);

	const sections = [
		["BLOQUES (posición/tipo/color)", report.blocks],
		["MUNDOS (tema/cielo/suelo)", report.worlds],
		["GRADOS POR GENERADOR", report.grades],
		["CADENAS solo en WEB (falta en Godot)", report.strings.onlyJs.map((x) => `${JSON.stringify(x.text)} (web×${x.js}, godot×${x.godot})`)],
		["CADENAS solo en GODOT (sobra/diverge)", report.strings.onlyGd.map((x) => `${JSON.stringify(x.text)} (web×${x.js}, godot×${x.godot})`)],
	];
	let any = false;
	for (const [title, items] of sections) {
		if (items.length === 0) continue;
		any = true;
		console.log("✗ " + title);
		for (const it of items) console.log("    " + it);
	}
	if (!any) {
		console.log("✓ SIN DRIFT — la bank de preguntas está sincronizada en ambos lados.");
		process.exit(0);
	}
	console.log(line);
	console.log(`✗ DRIFT DETECTADO (${drift} diferencia/s) — ` +
		(args.writeData
			? "lo regenerable ya se reparó; el resto (grados/cadenas) no es regenerable: arréclalo manualmente."
			: "alinea ambos lados y vuelve a correr."));
	process.exit(1);
}

main();
