/* =====================================================================
   Widget: Resolución gráfica de PL (2 variables)
   Expone:
     IO.graphicalSolver(container, cfg)      -> solucionador editable con slider
     IO.graphicalWalkthrough(container, cfg) -> tutorial paso a paso (dibujo incremental)
     IO.specialCase(container, kind)         -> mini-ilustración de un caso particular
   cfg = { sense:'max'|'min', c:[c1,c2], vars:['x_1','x_2'],
           constraints:[{a:[a1,a2], op:'<='|'>='|'=', b, name}], editable, title, subtitle }
   ===================================================================== */
(function () {
  "use strict";
  const IO = window.IO;
  const EPS = 1e-7;
  const PALETTE = ["#0ea5e9", "#059669", "#d97706", "#db2777", "#7c3aed", "#0891b2", "#65a30d"];

  function deepCopy(cfg) {
    return {
      sense: cfg.sense || "max",
      c: cfg.c.slice(),
      vars: (cfg.vars || ["x_1", "x_2"]).slice(),
      constraints: cfg.constraints.map((r) => ({ a: r.a.slice(), op: r.op, b: r.b, name: r.name })),
      editable: cfg.editable !== false,
      title: cfg.title || "Resolución gráfica",
      subtitle: cfg.subtitle || "",
    };
  }

  /* ---------------- Núcleo matemático ---------------- */
  function intersect(l1, l2) {
    const [a1, b1, c1] = l1, [a2, b2, c2] = l2;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < EPS) return null;
    return [(c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det];
  }
  function satisfies(pt, cfg) {
    const [x, y] = pt;
    if (x < -1e-5 || y < -1e-5) return false;
    for (const r of cfg.constraints) {
      const lhs = r.a[0] * x + r.a[1] * y;
      if (r.op === "<=" && lhs > r.b + 1e-4) return false;
      if (r.op === ">=" && lhs < r.b - 1e-4) return false;
      if (r.op === "=" && Math.abs(lhs - r.b) > 1e-4) return false;
    }
    return true;
  }
  function solve(cfg) {
    const lines = cfg.constraints.map((r) => [r.a[0], r.a[1], r.b]);
    lines.push([1, 0, 0]); lines.push([0, 1, 0]);
    const verts = [];
    for (let i = 0; i < lines.length; i++)
      for (let j = i + 1; j < lines.length; j++) {
        const p = intersect(lines[i], lines[j]);
        if (p && isFinite(p[0]) && isFinite(p[1]) && satisfies(p, cfg))
          if (!verts.some((v) => Math.abs(v[0] - p[0]) < 1e-4 && Math.abs(v[1] - p[1]) < 1e-4)) verts.push(p);
      }
    if (verts.length) {
      const cx = verts.reduce((s, v) => s + v[0], 0) / verts.length;
      const cy = verts.reduce((s, v) => s + v[1], 0) / verts.length;
      verts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    }
    const Z = (p) => cfg.c[0] * p[0] + cfg.c[1] * p[1];
    let best = null;
    verts.forEach((v) => {
      const z = Z(v);
      if (!best) best = { v, z };
      else if (cfg.sense === "max" ? z > best.z + 1e-9 : z < best.z - 1e-9) best = { v, z };
    });
    const multiple = best && verts.filter((v) => Math.abs(Z(v) - best.z) < 1e-6).length > 1;
    // ¿no acotado? buscamos una dirección de recesión factible que mejore Z
    let unbounded = false;
    if (best) {
      for (let k = 0; k < 72 && !unbounded; k++) {
        const th = (k / 72) * 2 * Math.PI, d = [Math.cos(th), Math.sin(th)];
        const far = [best.v[0] + d[0] * 1e7, best.v[1] + d[1] * 1e7];
        if (satisfies(far, cfg)) {
          const zf = Z(far);
          if (cfg.sense === "max" ? zf > best.z + 1 : zf < best.z - 1) unbounded = true;
        }
      }
    }
    return { verts, best, multiple, unbounded, feasible: verts.length > 0, Z };
  }

  function computeRange(cfg, sol) {
    let maxX = 1, maxY = 1;
    sol.verts.forEach((v) => { maxX = Math.max(maxX, v[0]); maxY = Math.max(maxY, v[1]); });
    cfg.constraints.forEach((r) => {
      if (Math.abs(r.a[0]) > EPS) maxX = Math.max(maxX, r.b / r.a[0]);
      if (Math.abs(r.a[1]) > EPS) maxY = Math.max(maxY, r.b / r.a[1]);
    });
    return { maxX: maxX * 1.18, maxY: maxY * 1.18 };
  }

  /* ---------------- Dibujo de escena ---------------- */
  function drawScene(canvas, cfg, sol, opts) {
    opts = opts || {};
    const range = opts.range || computeRange(cfg, sol);
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const maxX = range.maxX, maxY = range.maxY;
    ctx.clearRect(0, 0, W, H);
    const m = { l: 54, r: 16, t: 16, b: 42 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const sx = (x) => m.l + (x / maxX) * pw;
    const sy = (y) => H - m.b - (y / maxY) * ph;

    // grilla + ejes
    ctx.strokeStyle = "#eef2f7"; ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8"; ctx.font = "11px Inter, sans-serif";
    const gx = niceStep(maxX), gy = niceStep(maxY);
    for (let x = 0; x <= maxX + 1e-9; x += gx) { ctx.beginPath(); ctx.moveTo(sx(x), m.t); ctx.lineTo(sx(x), H - m.b); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(fmtAxis(x), sx(x), H - m.b + 15); }
    for (let y = 0; y <= maxY + 1e-9; y += gy) { ctx.beginPath(); ctx.moveTo(m.l, sy(y)); ctx.lineTo(W - m.r, sy(y)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(fmtAxis(y), m.l - 6, sy(y) + 4); }
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    // etiquetas de ejes
    ctx.fillStyle = "#475569"; ctx.font = "italic 12px Inter, sans-serif";
    ctx.textAlign = "center"; ctx.fillText(plain(cfg.vars[0]), W - m.r - 8, H - m.b + 26);
    ctx.save(); ctx.translate(14, m.t + 8); ctx.fillText(plain(cfg.vars[1]), 0, 0); ctx.restore();

    // semiplanos individuales: cada restricción pinta SU área (translúcida).
    // Donde se superponen todas, el color se acumula y queda más oscuro = región factible.
    if (opts.halfplanesUpTo != null) {
      for (let i = 0; i < opts.halfplanesUpTo; i++) {
        const r = cfg.constraints[i];
        if (!r || r.op === "=") continue;
        const poly = clipHalfplane([[0, 0], [maxX, 0], [maxX, maxY], [0, maxY]], r.a[0], r.a[1], r.b, r.op);
        if (poly.length >= 3) {
          ctx.beginPath();
          poly.forEach((p, k) => { const X = sx(p[0]), Y = sy(p[1]); k ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
          ctx.closePath();
          ctx.fillStyle = hexA(PALETTE[i % PALETTE.length], 0.16); ctx.fill();
        }
      }
    }

    // región factible (recorte de semiplanos contra la ventana → correcto también con ">=")
    if (opts.showRegion) {
      const cons = opts.regionUpTo != null ? cfg.constraints.slice(0, opts.regionUpTo) : cfg.constraints;
      const poly = feasiblePolygonFrom(cons, maxX, maxY);
      if (poly.length >= 3) {
        ctx.beginPath();
        poly.forEach((v, i) => { const X = sx(v[0]), Y = sy(v[1]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.closePath();
        ctx.fillStyle = opts.strongRegion ? "rgba(67,56,202,0.32)" : "rgba(67,56,202,0.12)"; ctx.fill();
        ctx.strokeStyle = "rgba(67,56,202,0.65)"; ctx.lineWidth = opts.strongRegion ? 2.5 : 1.5; ctx.stroke();
      }
    }

    // rectas de restricción (hasta nLines)
    const nLines = opts.nLines == null ? cfg.constraints.length : opts.nLines;
    cfg.constraints.slice(0, nLines).forEach((r, i) => {
      const col = PALETTE[i % PALETTE.length];
      const seg = lineSegment(r.a[0], r.a[1], r.b, maxX, maxY);
      if (!seg) return;
      ctx.strokeStyle = col; ctx.lineWidth = (opts.highlightLine === i) ? 3.5 : 2;
      ctx.beginPath(); ctx.moveTo(sx(seg[0][0]), sy(seg[0][1])); ctx.lineTo(sx(seg[1][0]), sy(seg[1][1])); ctx.stroke();
      // etiqueta de la recta
      if (opts.labelLines !== false && r.name) {
        const mid = seg[1];
        ctx.fillStyle = col; ctx.font = "bold 11px Inter, sans-serif"; ctx.textAlign = "left";
        ctx.fillText(r.name, Math.min(sx(mid[0]) + 4, W - 40), Math.max(sy(mid[1]) - 4, 14));
      }
    });

    // recta objetivo
    if (opts.zLine != null && (Math.abs(cfg.c[0]) > EPS || Math.abs(cfg.c[1]) > EPS)) {
      const seg = lineSegment(cfg.c[0], cfg.c[1], opts.zLine, maxX, maxY);
      if (seg) {
        ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2.5; ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.moveTo(sx(seg[0][0]), sy(seg[0][1])); ctx.lineTo(sx(seg[1][0]), sy(seg[1][1])); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // vértices
    if (opts.showVertices) {
      sol.verts.forEach((v) => { ctx.beginPath(); ctx.arc(sx(v[0]), sy(v[1]), 4, 0, 7); ctx.fillStyle = "#1e293b"; ctx.fill(); });
    }
    if (opts.showOptimal && sol.best) {
      const v = sol.best.v;
      ctx.beginPath(); ctx.arc(sx(v[0]), sy(v[1]), 7, 0, 7); ctx.fillStyle = "#dc2626"; ctx.fill();
      ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#dc2626"; ctx.font = "bold 12px Inter, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("(" + IO.num(v[0]) + ", " + IO.num(v[1]) + ")", sx(v[0]) + 10, sy(v[1]) - 8);
    }
  }

  // Polígono de la región factible recortada a la ventana [0,maxX]×[0,maxY]
  function feasiblePolygon(cfg, maxX, maxY) { return feasiblePolygonFrom(cfg.constraints, maxX, maxY); }
  function feasiblePolygonFrom(cons, maxX, maxY) {
    let poly = [[0, 0], [maxX, 0], [maxX, maxY], [0, maxY]];
    for (const r of cons) {
      if (r.op === "=") { poly = []; break; } // igualdad: sin área (se ve como recta)
      poly = clipHalfplane(poly, r.a[0], r.a[1], r.b, r.op);
      if (poly.length < 3) break;
    }
    return poly;
  }
  function clipHalfplane(poly, a, b, c, op) {
    if (!poly.length) return poly;
    const inside = (p) => op === "<=" ? a * p[0] + b * p[1] <= c + 1e-6 : a * p[0] + b * p[1] >= c - 1e-6;
    const inter = (p, q) => { const dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c; const t = dp / (dp - dq); return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]; };
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const cur = poly[i], prv = poly[(i + poly.length - 1) % poly.length];
      const ci = inside(cur), pi = inside(prv);
      if (ci) { if (!pi) out.push(inter(prv, cur)); out.push(cur); }
      else if (pi) out.push(inter(prv, cur));
    }
    return out;
  }

  function lineSegment(a, b, c, maxX, maxY) {
    const pts = [];
    if (Math.abs(b) > EPS) {
      const y0 = c / b; if (y0 >= -EPS && y0 <= maxY + EPS) pts.push([0, y0]);
      const yM = (c - a * maxX) / b; if (yM >= -EPS && yM <= maxY + EPS) pts.push([maxX, yM]);
    }
    if (Math.abs(a) > EPS) {
      const x0 = c / a; if (x0 >= -EPS && x0 <= maxX + EPS) pts.push([x0, 0]);
      const xM = (c - b * maxY) / a; if (xM >= -EPS && xM <= maxX + EPS) pts.push([xM, maxY]);
    }
    if (pts.length < 2) return null;
    return [pts[0], pts[pts.length - 1]];
  }
  function niceStep(max) {
    const raw = max / 6, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * mag;
  }
  function fmtAxis(x) { if (x === 0) return "0"; if (Math.abs(x) >= 1000) return (x / 1000) + "k"; return Number(x.toFixed(2)).toString(); }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }
  function plain(tex) { return (tex || "").replace(/_\{?(\w+)\}?/, "$1").replace(/[{}]/g, ""); }

  /* ---------------- Interpretación ---------------- */
  function interpret(cfg, sol) {
    if (!sol.feasible) return "<b>🚫 No hay región factible:</b> las restricciones se contradicen, no existe ningún punto que las cumpla todas.";
    if (sol.unbounded) return "<b>♾️ Problema no acotado:</b> la región está abierta hacia donde mejora $Z$, así que $Z$ puede crecer sin límite. No hay óptimo finito.";
    const b = sol.best, [x, y] = b.v, vx = cfg.vars[0], vy = cfg.vars[1];
    let html = "<p><b>Solución óptima:</b> $" + vx + " = " + IO.num(x) + "$, &nbsp; $" + vy + " = " + IO.num(y) + "$ &nbsp;→&nbsp; <b>$Z = " + IO.num(b.z) + "$</b></p>";
    if (sol.multiple) html += '<p class="pill amber">⚠ Óptimo múltiple: hay otro vértice con el mismo $Z$.</p>';
    html += "<p><b>Holguras (qué pasa con cada recurso):</b></p><ul>";
    cfg.constraints.forEach((r) => {
      const lhs = r.a[0] * x + r.a[1] * y, slack = r.b - lhs, activa = Math.abs(slack) < 1e-3;
      const nombre = r.name || "Restricción";
      html += activa
        ? "<li><b>" + nombre + "</b>: <span class='pill green'>activa / saturada</span> — la recta pasa justo por el óptimo.</li>"
        : "<li><b>" + nombre + "</b>: sobran <b>" + IO.num(Math.abs(slack)) + "</b> " + (r.op === ">=" ? "(excedente)" : "(holgura)") + " → <span class='pill indigo'>no activa</span>.</li>";
    });
    return html + "</ul>";
  }
  function vertexTable(cfg, sol) {
    const rows = sol.verts.map((v) => ({ v, z: sol.Z(v) })).sort((p, q) => p.v[0] - q.v[0] || p.v[1] - q.v[1]);
    let html = '<div class="table-wrap"><table class="data"><thead><tr><th>Vértice ($' + cfg.vars[0] + "," + cfg.vars[1] + '$)</th><th>$Z$</th><th></th></tr></thead><tbody>';
    rows.forEach((r) => {
      const opt = sol.best && Math.abs(r.v[0] - sol.best.v[0]) < 1e-4 && Math.abs(r.v[1] - sol.best.v[1]) < 1e-4;
      html += "<tr" + (opt ? ' style="background:#ecfdf5;font-weight:700"' : "") + "><td>(" + IO.num(r.v[0]) + ", " + IO.num(r.v[1]) + ")</td><td>" + IO.num(r.z) + "</td><td>" + (opt ? '<span class="pill green">óptimo</span>' : "") + "</td></tr>";
    });
    return html + "</tbody></table></div>";
  }

  function legend() {
    return IO.h("div.legend", { html:
      '<span><span class="swatch" style="background:rgba(67,56,202,.25)"></span>Región factible</span>' +
      '<span><span class="swatch" style="background:#1e293b;border-radius:50%"></span>Vértices</span>' +
      '<span><span class="swatch" style="background:#dc2626"></span>Recta $Z$ / óptimo</span>' });
  }

  /* ================= SOLUCIONADOR EDITABLE ================= */
  IO.graphicalSolver = function (container, rawCfg) {
    const cfg = deepCopy(rawCfg);
    const wrap = IO.h("div.widget");
    wrap.appendChild(IO.h("div.widget-title", { html: "📐 " + cfg.title }));
    if (cfg.subtitle) wrap.appendChild(IO.h("div.widget-sub", { html: cfg.subtitle }));
    if (cfg.editable) wrap.appendChild(buildEditor(cfg, IO.h("div"), rerender));

    const grid = IO.h("div.grid-2"), left = IO.h("div"), right = IO.h("div");
    grid.appendChild(left); grid.appendChild(right); wrap.appendChild(grid);
    const canvas = document.createElement("canvas"); canvas.width = 460; canvas.height = 380;
    canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", "Gráfico de la región factible: " + (cfg.title || "problema de programación lineal") + ". El detalle numérico aparece en el texto de la derecha.");
    left.appendChild(canvas); left.appendChild(legend());
    const sliderWrap = IO.h("div", { style: "margin-top:.8rem" });
    const sliderLabel = IO.h("div", { style: "font-size:.82rem;color:var(--ink-soft);font-weight:600" });
    const slider = document.createElement("input"); slider.type = "range"; slider.style.width = "100%";
    sliderWrap.appendChild(sliderLabel); sliderWrap.appendChild(slider); left.appendChild(sliderWrap);
    const resultBox = IO.h("div"); right.appendChild(resultBox);

    let sol = null, range = null;
    function rerender() {
      sol = solve(cfg); range = computeRange(cfg, sol);
      const zopt = sol.best ? sol.best.z : 0, zmax = Math.max(Math.abs(zopt) * 1.1, 1);
      slider.min = 0; slider.max = zmax; slider.step = zmax / 200; slider.value = sol.best ? Math.abs(zopt) : 0;
      updateSlider(); renderResults();
    }
    function updateSlider() {
      const z = parseFloat(slider.value);
      sliderLabel.innerHTML = "Deslizá la recta objetivo &nbsp;→&nbsp; <b>Z = " + IO.num(z) + "</b>";
      drawScene(canvas, cfg, sol, { range, showRegion: true, showVertices: true, showOptimal: true, zLine: z });
    }
    slider.addEventListener("input", updateSlider);
    function renderResults() {
      resultBox.innerHTML = "";
      const box = IO.h("div.result-box", { html: interpret(cfg, sol) });
      resultBox.appendChild(box);
      if (sol.feasible) resultBox.appendChild(IO.html(vertexTable(cfg, sol)));
      IO.renderMath(resultBox);
    }
    container.appendChild(wrap); rerender();
  };

  /* ================= TUTORIAL PASO A PASO ================= */
  IO.graphicalWalkthrough = function (container, rawCfg) {
    const cfg = deepCopy(rawCfg); cfg.editable = false;
    const sol = solve(cfg), range = computeRange(cfg, sol);
    const zopt = sol.best ? sol.best.z : 0;

    // armar pasos
    const steps = [];
    steps.push({
      t: "Paso 0 — Ejes y primer cuadrante",
      d: "Como $" + cfg.vars[0] + ",\\," + cfg.vars[1] + " \\ge 0$, <b>todo ocurre en el primer cuadrante</b> (arriba a la derecha). Ahí vamos a dibujar.",
      o: { range, nLines: 0 },
    });
    cfg.constraints.forEach((r, i) => {
      const cx = Math.abs(r.a[0]) > EPS ? r.b / r.a[0] : null;
      const cy = Math.abs(r.a[1]) > EPS ? r.b / r.a[1] : null;
      const ladoTxt = r.op === "<=" ? "Pintás el lado de <b>abajo/izquierda</b> (donde se cumple ≤)." :
        r.op === ">=" ? "Pintás el lado de <b>arriba/derecha</b> (donde se cumple ≥)." :
        "Solo vale <b>sobre la recta</b> (es una igualdad).";
      steps.push({
        t: "Restricción " + (i + 1) + (r.name ? " — " + r.name : ""),
        d: "<b>1)</b> Igualá a recta: $" + eq(r) + "$.<br>" +
           "<b>2)</b> Cortes con los ejes:<br>" +
           (cy != null ? "&nbsp;&nbsp;• Si $" + cfg.vars[0] + "=0$: &nbsp;$" + cfg.vars[1] + " = " + IO.num(cy) + "$ → punto $(0,\\," + IO.num(cy) + ")$.<br>" : "") +
           (cx != null ? "&nbsp;&nbsp;• Si $" + cfg.vars[1] + "=0$: &nbsp;$" + cfg.vars[0] + " = " + IO.num(cx) + "$ → punto $(" + IO.num(cx) + ",\\,0)$.<br>" : "") +
           "<b>3)</b> Cada restricción no es solo una recta: define <b>un área</b> (un semiplano). " + ladoTxt +
           " Pintamos la zona de cada una; <b>donde se superponen todas</b> (color más oscuro) va quedando la región factible.",
        o: { range, nLines: i + 1, highlightLine: i, halfplanesUpTo: i + 1 },
      });
    });
    steps.push({
      t: "Región factible",
      d: "La <b>intersección</b> de todos los semiplanos (la zona <b>más oscura</b>, resaltada) es el <b>polígono de soluciones factibles</b>. Cualquier punto adentro cumple <i>todas</i> las restricciones a la vez. Los <b>vértices</b> son las esquinas: ahí está siempre el óptimo.",
      o: { range, halfplanesUpTo: cfg.constraints.length, showRegion: true, strongRegion: true, showVertices: true },
    });
    if (sol.feasible && sol.unbounded) {
      steps.push({
        t: "♾️ No acotado",
        d: "Al desplazar la recta objetivo en el sentido que mejora $Z$, <b>nunca deja de tocar</b> la región (está abierta hacia ese lado). Entonces $Z$ crece sin límite: <b>no hay óptimo finito</b>.",
        o: { range, showRegion: true, showVertices: true, zLine: 0 },
      });
    } else if (sol.feasible) {
      steps.push({
        t: "Recta objetivo en $Z=0$",
        d: "Dibujamos $Z = " + IO.num(cfg.c[0]) + cfg.vars[0] + " + " + IO.num(cfg.c[1]) + cfg.vars[1] + "$ para $Z=0$ (la recta roja punteada). Todos los puntos de esa recta dan el mismo $Z$.",
        o: { range, showRegion: true, showVertices: true, zLine: 0 },
      });
      steps.push({
        t: "Desplazamos la recta",
        d: "La movemos en paralelo " + (cfg.sense === "max" ? "<b>aumentando</b>" : "<b>disminuyendo</b>") + " $Z$. Mientras siga tocando el polígono, hay solución factible con ese valor.",
        o: { range, showRegion: true, showVertices: true, zLine: zopt * 0.5 },
      });
      steps.push({
        t: "Óptimo",
        d: "El <b>último vértice</b> que toca la recta es el óptimo: $" + cfg.vars[0] + "=" + IO.num(sol.best.v[0]) + "$, $" + cfg.vars[1] + "=" + IO.num(sol.best.v[1]) + "$, con <b>$Z=" + IO.num(zopt) + "$</b>." + (sol.multiple ? " ⚠ Acá la recta es <b>paralela a una arista</b>: óptimo múltiple." : ""),
        o: { range, showRegion: true, showVertices: true, showOptimal: true, zLine: zopt },
      });
    }

    const wrap = IO.h("div.widget");
    wrap.appendChild(IO.h("div.widget-title", { html: "📐 " + cfg.title + " — paso a paso" }));
    if (cfg.subtitle) wrap.appendChild(IO.h("div.widget-sub", { html: cfg.subtitle }));
    const grid = IO.h("div.grid-2"), left = IO.h("div"), right = IO.h("div");
    grid.appendChild(left); grid.appendChild(right); wrap.appendChild(grid);
    const canvas = document.createElement("canvas"); canvas.width = 460; canvas.height = 380;
    canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", "Gráfico de la región factible: " + (cfg.title || "problema de programación lineal") + ". El detalle numérico aparece en el texto de la derecha.");
    left.appendChild(canvas); left.appendChild(legend());
    const title = IO.h("div", { style: "font-weight:700;color:var(--brand);margin-bottom:.4rem;font-size:1.02rem" });
    const desc = IO.h("div", { style: "font-size:.92rem;line-height:1.7;min-height:8rem" });
    right.appendChild(title); right.appendChild(desc);
    const controls = IO.h("div.controls");
    const prev = IO.h("button.btn.ghost.sm", { text: "← Anterior" });
    const next = IO.h("button.btn.sm", { text: "Siguiente →" });
    const counter = IO.h("span", { style: "color:var(--ink-soft);font-size:.85rem" });
    controls.appendChild(prev); controls.appendChild(next); controls.appendChild(counter);
    right.appendChild(controls);
    const finalBox = IO.h("div"); right.appendChild(finalBox);

    let cur = 0;
    function show() {
      const s = steps[cur];
      title.innerHTML = s.t; desc.innerHTML = s.d;
      drawScene(canvas, cfg, sol, s.o);
      counter.textContent = "Paso " + (cur + 1) + " de " + steps.length;
      prev.disabled = cur === 0; next.disabled = cur === steps.length - 1;
      finalBox.innerHTML = (cur === steps.length - 1 && sol.feasible) ? '<div class="result-box">' + interpret(cfg, sol) + "</div>" : "";
      IO.renderMath(title); IO.renderMath(desc); IO.renderMath(finalBox);
    }
    prev.addEventListener("click", () => { if (cur > 0) { cur--; show(); } });
    next.addEventListener("click", () => { if (cur < steps.length - 1) { cur++; show(); } });
    container.appendChild(wrap); show();
  };
  function eq(r) {
    const t = (c, v, first) => { if (Math.abs(c) < EPS) return ""; const s = c < 0 ? " - " : (first ? "" : " + "); return s + (Math.abs(c) === 1 ? "" : IO.num(Math.abs(c))) + v; };
    return (t(r.a[0], "x_1", true) || "0") + t(r.a[1], "x_2", false) + " = " + IO.num(r.b);
  }

  /* ================= MINI (gráfico final + tipo de solución) ================= */
  IO.graphicalMini = function (container, rawCfg) {
    const cfg = deepCopy(rawCfg); cfg.editable = false;
    const sol = solve(cfg), range = computeRange(cfg, sol);
    const canvas = document.createElement("canvas"); canvas.width = 360; canvas.height = 300;
    canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", "Gráfico de la región factible. El resultado se describe en el texto debajo.");
    drawScene(canvas, cfg, sol, { range, showRegion: true, showVertices: true, showOptimal: !sol.unbounded && sol.feasible, zLine: sol.best && !sol.unbounded ? sol.best.z : null });
    let tipo = "", cls = "indigo";
    if (!sol.feasible) { tipo = "🚫 No factible"; cls = "amber"; }
    else if (sol.unbounded) { tipo = "♾️ No acotado"; cls = "amber"; }
    else if (sol.multiple) { tipo = "🔁 Óptimo múltiple"; cls = "amber"; }
    else { tipo = "✔ Óptimo único"; cls = "green"; }
    const box = IO.h("div");
    box.appendChild(canvas);
    box.appendChild(IO.h("div", { html: '<span class="pill ' + cls + '">' + tipo + "</span>", style: "margin:.4rem 0" }));
    box.appendChild(IO.h("div", { html: interpret(cfg, sol), style: "font-size:.86rem" }));
    container.appendChild(box);
    IO.renderMath(box);
  };

  /* ================= GRÁFICOS CONCEPTUALES (mini, con área) =================
     IO.specialCase(container, kind) — kinds:
       'factible','basica','basica-factible','optima','degenerada',
       'multiple','unbounded','infeasible'
     Dibuja un PL chico real con la(s) región(es) sombreada(s) y anotaciones. */

  // Ejemplo común para los "tipos de solución": pentágono
  const TIPOS = {
    cons: [{ a: [1, 0], op: "<=", b: 4 }, { a: [0, 1], op: "<=", b: 4 }, { a: [1, 1], op: "<=", b: 6 }],
    lines: [{ a: 1, b: 0, c: 4, col: "#0ea5e9" }, { a: 0, b: 1, c: 4, col: "#059669" }, { a: 1, b: 1, c: 6, col: "#d97706" }],
    verts: [[0, 0], [4, 0], [4, 2], [2, 4], [0, 4]],
  };

  const SPECS = {
    factible: { MX: 7, MY: 7, shades: [{ cons: TIPOS.cons, color: "rgba(67,56,202,0.13)" }], lines: TIPOS.lines,
      points: [{ x: 2, y: 1.5, kind: "interior" }],
      caption: "<b>Factible</b>: cualquier punto <b>dentro</b> del área sombreada (cumple todas las restricciones)." },
    basica: { MX: 7, MY: 7, shades: [{ cons: TIPOS.cons, color: "rgba(67,56,202,0.13)" }], lines: TIPOS.lines,
      points: TIPOS.verts.map((v) => ({ x: v[0], y: v[1], kind: "feasible" })).concat([{ x: 4, y: 4, kind: "infeasible" }]),
      caption: "<b>Básica</b>: las <b>esquinas</b> (cruce de rectas). Algunas caen <span style='color:#dc2626'>afuera</span> del área (básicas <i>no</i> factibles, ej. (4,4))." },
    "basica-factible": { MX: 7, MY: 7, shades: [{ cons: TIPOS.cons, color: "rgba(67,56,202,0.13)" }], lines: TIPOS.lines,
      points: TIPOS.verts.map((v) => ({ x: v[0], y: v[1], kind: "feasible" })),
      caption: "<b>Básica factible</b>: los vértices que están <b>sobre</b> el polígono. El Simplex salta entre ellos." },
    optima: { MX: 7, MY: 7, shades: [{ cons: TIPOS.cons, color: "rgba(67,56,202,0.13)" }], lines: TIPOS.lines,
      obj: [{ a: 2, b: 1, c: 10 }], points: [{ x: 4, y: 2, kind: "opt" }],
      caption: "<b>Óptima</b>: el vértice que toca la recta $Z$ (roja) en el mejor valor. Acá $(4,2)$." },
    degenerada: { MX: 7, MY: 7, shades: [{ cons: [{ a: [1, 0], op: "<=", b: 4 }, { a: [0, 1], op: "<=", b: 4 }], color: "rgba(67,56,202,0.13)" }],
      lines: [{ a: 1, b: 0, c: 4, col: "#0ea5e9" }, { a: 0, b: 1, c: 4, col: "#059669" }, { a: 1, b: 1, c: 8, col: "#d97706" }],
      points: [{ x: 4, y: 4, kind: "opt" }],
      caption: "<b>Degeneración</b>: <b>3 rectas</b> pasan por el mismo vértice $(4,4)$ (sobra una). En la tabla: empate en el cociente y una básica en 0." },
    multiple: { MX: 7, MY: 7, shades: [{ cons: [{ a: [1, 0], op: "<=", b: 4 }, { a: [1, 1], op: "<=", b: 6 }], color: "rgba(67,56,202,0.13)" }],
      lines: [{ a: 1, b: 0, c: 4, col: "#0ea5e9" }, { a: 1, b: 1, c: 6, col: "#d97706" }],
      obj: [{ a: 1, b: 1, c: 6 }], edge: [[4, 2], [0, 6]],
      caption: "<b>Óptimo múltiple</b>: la recta $Z$ queda <b>paralela</b> a una arista → <b>toda la arista</b> (en grueso rojo) es óptima." },
    unbounded: { MX: 10, MY: 6, shades: [{ cons: [{ a: [0, 1], op: "<=", b: 4 }], color: "rgba(67,56,202,0.13)" }],
      lines: [{ a: 0, b: 1, c: 4, col: "#059669" }], obj: [{ a: 1, b: 1, c: 4 }, { a: 1, b: 1, c: 9 }],
      arrow: { x: 6.5, y: 2, dx: 2.2, dy: 0 },
      caption: "<b>No acotado</b>: la región es <b>abierta</b> hacia la derecha y la recta $Z$ avanza sin tope → $Z\\to\\infty$." },
    infeasible: { MX: 7, MY: 7,
      shades: [{ cons: [{ a: [1, 1], op: "<=", b: 2 }], color: "rgba(14,165,233,0.20)" }, { cons: [{ a: [1, 1], op: ">=", b: 5 }], color: "rgba(217,119,6,0.20)" }],
      lines: [{ a: 1, b: 1, c: 2, col: "#0ea5e9" }, { a: 1, b: 1, c: 5, col: "#d97706" }],
      caption: "<b>No factible</b>: dos áreas (una por restricción) que <b>no se tocan</b> → ningún punto cumple las dos a la vez." },
  };

  IO.specialCase = function (container, kind) {
    const spec = SPECS[kind] || SPECS.factible;
    const canvas = document.createElement("canvas"); canvas.width = 320; canvas.height = 250;
    canvas.setAttribute("aria-hidden", "true"); // ilustración decorativa; el texto de abajo la describe
    drawMini(canvas, spec);
    const box = IO.h("div", { style: "text-align:center" });
    box.appendChild(canvas);
    box.appendChild(IO.h("div", { html: spec.caption, style: "font-size:.82rem;color:var(--ink-soft);margin-top:.45rem;line-height:1.5;text-align:left" }));
    container.appendChild(box);
    IO.renderMath(box);
  };

  function drawMini(canvas, spec) {
    const ctx = canvas.getContext("2d"), W = canvas.width, H = canvas.height;
    const MX = spec.MX, MY = spec.MY, m = { l: 30, r: 14, t: 14, b: 26 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const sx = (x) => m.l + (x / MX) * pw, sy = (y) => H - m.b - (y / MY) * ph;
    ctx.clearRect(0, 0, W, H);
    // grilla suave
    ctx.strokeStyle = "#eef2f7"; ctx.lineWidth = 1;
    for (let x = 0; x <= MX; x++) { ctx.beginPath(); ctx.moveTo(sx(x), m.t); ctx.lineTo(sx(x), H - m.b); ctx.stroke(); }
    for (let y = 0; y <= MY; y++) { ctx.beginPath(); ctx.moveTo(m.l, sy(y)); ctx.lineTo(W - m.r, sy(y)); ctx.stroke(); }
    // áreas
    (spec.shades || []).forEach((sh) => {
      const poly = feasiblePolygonFrom(sh.cons, MX, MY);
      if (poly.length >= 3) { ctx.beginPath(); poly.forEach((p, i) => { i ? ctx.lineTo(sx(p[0]), sy(p[1])) : ctx.moveTo(sx(p[0]), sy(p[1])); }); ctx.closePath(); ctx.fillStyle = sh.color; ctx.fill(); }
    });
    // ejes
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, H - m.b); ctx.lineTo(W - m.r, H - m.b); ctx.stroke();
    // rectas
    (spec.lines || []).forEach((L) => { const seg = lineSegment(L.a, L.b, L.c, MX, MY); if (!seg) return; ctx.strokeStyle = L.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(seg[0][0]), sy(seg[0][1])); ctx.lineTo(sx(seg[1][0]), sy(seg[1][1])); ctx.stroke(); });
    // objetivo (punteada)
    (spec.obj || []).forEach((o) => { const seg = lineSegment(o.a, o.b, o.c, MX, MY); if (!seg) return; ctx.setLineDash([6, 4]); ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx(seg[0][0]), sy(seg[0][1])); ctx.lineTo(sx(seg[1][0]), sy(seg[1][1])); ctx.stroke(); ctx.setLineDash([]); });
    // arista óptima (grueso)
    if (spec.edge) { ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx(spec.edge[0][0]), sy(spec.edge[0][1])); ctx.lineTo(sx(spec.edge[1][0]), sy(spec.edge[1][1])); ctx.stroke(); }
    // flecha (no acotado)
    if (spec.arrow) { const a = spec.arrow; ctx.strokeStyle = "#dc2626"; ctx.fillStyle = "#dc2626"; ctx.lineWidth = 3; const x1 = sx(a.x), y1 = sy(a.y), x2 = sx(a.x + a.dx), y2 = sy(a.y + a.dy); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9, y2 - 5); ctx.lineTo(x2 - 9, y2 + 5); ctx.closePath(); ctx.fill(); }
    // puntos
    (spec.points || []).forEach((p) => {
      const X = sx(p.x), Y = sy(p.y);
      if (p.kind === "infeasible") { ctx.beginPath(); ctx.arc(X, Y, 5, 0, 7); ctx.fillStyle = "white"; ctx.fill(); ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 2; ctx.stroke(); }
      else if (p.kind === "opt") { ctx.beginPath(); ctx.arc(X, Y, 7, 0, 7); ctx.fillStyle = "#dc2626"; ctx.fill(); ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke(); }
      else if (p.kind === "interior") { ctx.beginPath(); ctx.arc(X, Y, 5, 0, 7); ctx.fillStyle = "#16a34a"; ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(X, Y, 4, 0, 7); ctx.fillStyle = "#1e293b"; ctx.fill(); }
    });
  }

  /* ---------------- Editor ---------------- */
  function buildEditor(cfg, host, onChange) {
    host.innerHTML = "";
    const tbl = IO.h("div", { style: "background:var(--panel-soft);border:1px solid var(--line);border-radius:12px;padding:1rem;margin-bottom:1rem" });
    const objRow = IO.h("div.field-row");
    objRow.appendChild(field("Sentido", mkSelect(["max", "min"], cfg.sense, (v) => { cfg.sense = v; onChange(); })));
    objRow.appendChild(field("c₁ (" + plain(cfg.vars[0]) + ")", mkNum(cfg.c[0], (v) => { cfg.c[0] = v; onChange(); })));
    objRow.appendChild(field("c₂ (" + plain(cfg.vars[1]) + ")", mkNum(cfg.c[1], (v) => { cfg.c[1] = v; onChange(); })));
    tbl.appendChild(IO.h("div", { style: "font-weight:600;font-size:.82rem;color:var(--ink-soft);margin-bottom:.3rem" }, "Función objetivo"));
    tbl.appendChild(objRow);
    tbl.appendChild(IO.h("div", { style: "font-weight:600;font-size:.82rem;color:var(--ink-soft);margin:.8rem 0 .3rem" }, "Restricciones"));
    cfg.constraints.forEach((r) => {
      const row = IO.h("div.field-row", { style: "margin-bottom:.4rem" });
      row.appendChild(field("nombre", mkText(r.name || "", (v) => { r.name = v; onChange(); })));
      row.appendChild(field("a₁", mkNum(r.a[0], (v) => { r.a[0] = v; onChange(); })));
      row.appendChild(field("a₂", mkNum(r.a[1], (v) => { r.a[1] = v; onChange(); })));
      row.appendChild(field("signo", mkSelect(["<=", ">=", "="], r.op, (v) => { r.op = v; onChange(); })));
      row.appendChild(field("b", mkNum(r.b, (v) => { r.b = v; onChange(); })));
      tbl.appendChild(row);
    });
    host.appendChild(tbl);
    return host;
  }
  function field(label, input) { const l = IO.h("label.field"); l.appendChild(document.createTextNode(label)); l.appendChild(input); return l; }
  function mkNum(val, cb) { const i = document.createElement("input"); i.type = "number"; i.step = "any"; i.value = val; i.addEventListener("input", () => cb(parseFloat(i.value) || 0)); return i; }
  function mkText(val, cb) { const i = document.createElement("input"); i.type = "text"; i.value = val; i.addEventListener("input", () => cb(i.value)); return i; }
  function mkSelect(opts, val, cb) { const s = document.createElement("select"); opts.forEach((o) => { const op = document.createElement("option"); op.value = o; op.textContent = o; if (o === val) op.selected = true; s.appendChild(op); }); s.addEventListener("change", () => cb(s.value)); return s; }
})();
