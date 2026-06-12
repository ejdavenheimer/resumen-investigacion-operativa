/* =====================================================================
   IO Interactiva — núcleo
   Registro global de secciones + helpers de DOM y de fórmulas (KaTeX).
   Sin módulos ES ni fetch: funciona abriendo index.html con doble clic.
   ===================================================================== */
(function () {
  "use strict";

  const IO = (window.IO = window.IO || {});
  IO.sections = IO.sections || [];   // [{id, group, title, tag, render(el)}]
  IO.groups = IO.groups || [];       // orden de grupos en la nav

  /* Registrar una sección de contenido */
  IO.register = function (section) {
    IO.sections.push(section);
    if (IO.groups.indexOf(section.group) === -1) IO.groups.push(section.group);
  };

  /* ---------- Helpers de DOM ---------- */
  // h('div.clase#id', {attr:val}, [hijos | string])
  function h(tag, attrs, children) {
    let id = null;
    const classes = [];
    const m = tag.match(/^([a-zA-Z0-9]+)?([.#][\w-]+)*$/);
    const parts = tag.match(/[.#][\w-]+/g) || [];
    const name = (tag.match(/^[a-zA-Z0-9]+/) || ["div"])[0];
    parts.forEach((p) => {
      if (p[0] === ".") classes.push(p.slice(1));
      else id = p.slice(1);
    });
    const el = document.createElement(name);
    if (id) el.id = id;
    if (classes.length) el.className = classes.join(" ");
    if (attrs && typeof attrs === "object" && !Array.isArray(attrs) && !(attrs instanceof Node)) {
      Object.keys(attrs).forEach((k) => {
        if (k === "html") el.innerHTML = attrs[k];
        else if (k === "text") el.textContent = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function") el.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
      });
    } else {
      children = attrs;
    }
    appendChildren(el, children);
    return el;
  }
  function appendChildren(el, children) {
    if (children == null) return;
    if (!Array.isArray(children)) children = [children];
    children.forEach((c) => {
      if (c == null || c === false) return;
      if (typeof c === "string" || typeof c === "number") el.appendChild(document.createTextNode(String(c)));
      else el.appendChild(c);
    });
  }
  IO.h = h;

  /* Construye contenido desde HTML string (con soporte de $...$ y $$...$$ para math) */
  IO.html = function (str) {
    const wrap = document.createElement("div");
    wrap.innerHTML = str;
    return wrap;
  };

  /* ---------- Fórmulas con KaTeX ---------- */
  // Render inline: IO.m('x_1 + x_2')  -> <span>
  IO.m = function (tex, display) {
    const span = document.createElement(display ? "div" : "span");
    if (display) span.className = "mathblock";
    try {
      if (window.katex) katex.render(tex, span, { throwOnError: false, displayMode: !!display });
      else span.textContent = tex;
    } catch (e) {
      span.textContent = tex;
    }
    return span;
  };

  // Recorre un elemento y renderiza:
  //  - $$...$$  -> display
  //  - \(...\) o $...$ -> inline
  // Solo en nodos de texto, para no romper HTML.
  IO.renderMath = function (root) {
    if (!window.katex) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !/[$\\]/.test(node.nodeValue)) return NodeFilter.FILTER_SKIP;
        const p = node.parentNode;
        if (p && (p.tagName === "SCRIPT" || p.tagName === "STYLE" || p.classList.contains("katex"))) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const targets = [];
    let n;
    while ((n = walker.nextNode())) targets.push(n);

    targets.forEach((node) => {
      const tokens = tokenizeMath(node.nodeValue);
      // si no hay nada de math, no tocamos el nodo (pero sí des-escapamos \$ → $)
      const hasMath = tokens.some((t) => t.type !== "text");
      if (!hasMath) {
        const plain = tokens.map((t) => t.value).join("");
        if (plain !== node.nodeValue) node.nodeValue = plain;
        return;
      }
      const inMathblock = node.parentNode && node.parentNode.classList && node.parentNode.classList.contains("mathblock");
      const frag = document.createDocumentFragment();
      tokens.forEach((t) => {
        if (t.type === "text") { frag.appendChild(document.createTextNode(t.value)); return; }
        const display = t.type === "display";
        const span = document.createElement(display ? "div" : "span");
        if (display && !inMathblock) span.className = "mathblock";
        try { katex.render(t.value, span, { throwOnError: false, displayMode: display }); }
        catch (e) { span.textContent = (display ? "$$" : "$") + t.value + (display ? "$$" : "$"); }
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
  };

  // Tokeniza texto en {text|inline|display}. Respeta el $ escapado (\$) como
  // dólar literal: fuera de math se convierte en "$"; dentro de math se mantiene
  // como "\$" para que KaTeX lo dibuje como signo $.
  function tokenizeMath(text) {
    const tokens = [];
    let i = 0, buf = "";
    while (i < text.length) {
      const ch = text[i];
      if (ch === "\\" && text[i + 1] === "$") { buf += "$"; i += 2; continue; } // \$ -> $ literal
      if (ch === "$") {
        const display = text[i + 1] === "$";
        const delimLen = display ? 2 : 1;
        let j = i + delimLen, content = "", found = -1;
        while (j < text.length) {
          if (text[j] === "\\" && text[j + 1] === "$") { content += "\\$"; j += 2; continue; }
          if (display ? (text[j] === "$" && text[j + 1] === "$") : text[j] === "$") { found = j; break; }
          content += text[j]; j++;
        }
        if (found === -1) { buf += ch; i++; continue; } // sin cierre: literal
        if (buf) { tokens.push({ type: "text", value: buf }); buf = ""; }
        tokens.push({ type: display ? "display" : "inline", value: content });
        i = found + delimLen;
        continue;
      }
      buf += ch; i++;
    }
    if (buf) tokens.push({ type: "text", value: buf });
    return tokens;
  }

  /* ---------- Utilidades numéricas ---------- */
  // Convierte un decimal a fracción legible (para tablas simplex)
  IO.frac = function (x, maxDen) {
    maxDen = maxDen || 64;
    if (x == null || isNaN(x)) return "—";
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    const neg = x < 0; x = Math.abs(x);
    let bestN = 1, bestD = 1, bestErr = Infinity;
    for (let d = 1; d <= maxDen; d++) {
      const n = Math.round(x * d);
      const err = Math.abs(x - n / d);
      if (err < bestErr - 1e-12) { bestErr = err; bestN = n; bestD = d; if (err < 1e-9) break; }
    }
    if (bestD === 1) return (neg ? "-" : "") + bestN;
    return (neg ? "-" : "") + bestN + "/" + bestD;
  };

  IO.round = function (x, dp) {
    if (dp == null) dp = 4;
    const f = Math.pow(10, dp);
    return Math.round((x + Number.EPSILON) * f) / f;
  };

  // formateo "lindo": entero o hasta 2 decimales
  IO.num = function (x) {
    if (x == null || isNaN(x)) return "—";
    const r = IO.round(x, 2);
    return Number.isInteger(r) ? String(r) : String(r);
  };
})();
