/* =====================================================================
   Widget: Stepper del Método Simplex (maximización, restricciones ≤)
   Notación UTN.BA: fila cj, columnas ck | xk | B | A1..An, fila Z = zj - cj.
   IO.simplexStepper(container, config)
   config = { c:[c1..cn], constraints:[{a:[..], b, name}], vars:['x_1'..],
              title, subtitle, editable }
   ===================================================================== */
(function () {
  "use strict";
  const IO = window.IO;
  const EPS = 1e-9;

  /* ---------- Resolver registrando cada tabla ---------- */
  function buildModel(cfg) {
    const n = cfg.c.length;
    const m = cfg.constraints.length;
    const total = n + m;
    // costos: reales + slacks(0)
    const c = cfg.c.concat(new Array(m).fill(0));
    // A = [orig | I]
    const A = cfg.constraints.map((r, i) => {
      const row = r.a.slice();
      for (let k = 0; k < m; k++) row.push(i === k ? 1 : 0);
      return row;
    });
    const b = cfg.constraints.map((r) => r.b);
    // etiquetas de variables: reales + slacks
    const labels = [];
    for (let j = 0; j < n; j++) labels.push(cfg.vars ? cfg.vars[j] : "x_{" + (j + 1) + "}");
    for (let k = 0; k < m; k++) labels.push("x_{" + (n + k + 1) + "}");
    const basis = [];
    for (let k = 0; k < m; k++) basis.push(n + k); // slacks
    return { n, m, total, c, A, b, basis, labels };
  }

  function snapshot(model, A, b, basis) {
    // z_j - c_j por columna
    const m = model.m, total = model.total;
    const cB = basis.map((bi) => model.c[bi]);
    const zrow = [];
    for (let j = 0; j < total; j++) {
      let zj = 0;
      for (let i = 0; i < m; i++) zj += cB[i] * A[i][j];
      zrow.push(zj - model.c[j]);
    }
    const zval = cB.reduce((s, ci, i) => s + ci * b[i], 0);
    return {
      A: A.map((r) => r.slice()),
      b: b.slice(),
      basis: basis.slice(),
      zrow,
      zval,
    };
  }

  function solve(cfg) {
    const model = buildModel(cfg);
    let A = model.A.map((r) => r.slice());
    let b = model.b.slice();
    let basis = model.basis.slice();
    const steps = [];
    let guard = 0, status = "optimo";

    while (guard++ < 50) {
      const snap = snapshot(model, A, b, basis);
      // entrante: zj-cj más negativo
      let enter = -1, minv = -EPS;
      for (let j = 0; j < model.total; j++) {
        if (snap.zrow[j] < minv) { minv = snap.zrow[j]; enter = j; }
      }
      if (enter === -1) { snap.enter = -1; steps.push(snap); status = "optimo"; break; }

      // ratio test
      let leave = -1, minRatio = Infinity, ratios = [];
      for (let i = 0; i < model.m; i++) {
        const aij = A[i][enter];
        if (aij > EPS) {
          const ratio = b[i] / aij;
          ratios.push(ratio);
          if (ratio < minRatio - 1e-12) { minRatio = ratio; leave = i; }
        } else ratios.push(null);
      }
      snap.enter = enter; snap.leave = leave; snap.ratios = ratios; snap.pivotVal = leave >= 0 ? A[leave][enter] : null;
      steps.push(snap);
      if (leave === -1) { status = "no_acotado"; break; }

      // pivot
      const piv = A[leave][enter];
      A[leave] = A[leave].map((v) => v / piv);
      b[leave] = b[leave] / piv;
      for (let i = 0; i < model.m; i++) {
        if (i === leave) continue;
        const f = A[i][enter];
        if (Math.abs(f) < EPS) continue;
        A[i] = A[i].map((v, j) => v - f * A[leave][j]);
        b[i] = b[i] - f * b[leave];
      }
      basis[leave] = enter;
    }
    return { model, steps, status };
  }

  /* ---------- Render de una tabla ----------
     opts: { annotate, partial:{rows:Set|cells:Set, zDone, highlightRow}, hiCells:{key:cls},
             noNarration }
     claves de celda: cj "c"+j · B "b"+i · cuerpo "a"+i+"_"+j · fila Z "z"+j · valor Z "zval" */
  function renderTable(model, snap, idx, isLast, opts) {
    opts = opts || {};
    const annotate = !!opts.annotate;
    const partial = opts.partial || null;
    const hi = opts.hiCells || {};
    const hasRatio = snap.enter >= 0 && snap.ratios;
    const { labels } = model;
    function shown(key, kind, i) {
      if (!partial) return true;
      if (partial.cells) return partial.cells.has(key);
      if (kind === "z") return !!partial.zDone;
      return partial.rows && partial.rows.has(i);
    }
    function mark(cell, key) { if (hi[key]) cell.classList.add(hi[key]); }
    const tbl = document.createElement("table");
    tbl.className = "simplex";

    // fila cj
    const thead = document.createElement("thead");
    const cjRow = document.createElement("tr"); cjRow.className = "cj-row";
    cjRow.appendChild(th("$c_j \\rightarrow$", 3));
    for (let j = 0; j < model.total; j++) {
      const c = td(IO.frac(model.c[j]));
      if (annotate && j < model.n) c.classList.add("cj-hl");
      mark(c, "c" + j);
      cjRow.appendChild(c);
    }
    if (hasRatio) cjRow.appendChild(td(""));
    thead.appendChild(cjRow);
    const head = document.createElement("tr");
    head.appendChild(th("$c_k$")); head.appendChild(th("base")); head.appendChild(th("$B$"));
    for (let j = 0; j < model.total; j++) {
      const t = th("$A_{" + (j + 1) + "}$");
      if (j === snap.enter) t.classList.add("enter-col");
      head.appendChild(t);
    }
    if (hasRatio) head.appendChild(th("$\\theta=\\tfrac{B}{a}$"));
    thead.appendChild(head);
    tbl.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < model.m; i++) {
      const tr = document.createElement("tr");
      if (partial && partial.highlightRow === i) tr.className = "mp-current";
      const bi = snap.basis[i];
      tr.appendChild(tdh(IO.frac(model.c[bi])));
      tr.appendChild(tdh("$" + labels[bi] + "$"));
      const bKey = "b" + i;
      const bcell = td(shown(bKey, "b", i) ? IO.frac(snap.b[i]) : "·");
      if (annotate) bcell.classList.add("b-hl");
      mark(bcell, bKey);
      tr.appendChild(bcell);
      for (let j = 0; j < model.total; j++) {
        const key = "a" + i + "_" + j;
        const cell = td(shown(key, "a", i) ? IO.frac(snap.A[i][j]) : "·");
        if (snap.enter === j) cell.classList.add("pivot-col");
        if (snap.leave === i) cell.classList.add("pivot-row");
        if (snap.enter === j && snap.leave === i) cell.className = "pivot";
        mark(cell, key);
        tr.appendChild(cell);
      }
      if (hasRatio) {
        const r = snap.ratios[i];
        const rc = td(r == null ? "—" : IO.frac(r));
        rc.classList.add(i === snap.leave ? "ratio-min" : "ratio");
        tr.appendChild(rc);
      }
      tbody.appendChild(tr);
    }
    // fila Z
    const zRow = document.createElement("tr"); zRow.className = "z-row";
    if (partial && partial.highlightRow === "z") zRow.classList.add("mp-current");
    const zvalShown = shown("zval", "z");
    zRow.appendChild(tdh("")); zRow.appendChild(tdh("$Z=" + (zvalShown ? IO.frac(snap.zval) : "?") + "$")); zRow.appendChild(td(""));
    for (let j = 0; j < model.total; j++) {
      const key = "z" + j;
      const cell = td(shown(key, "z") ? IO.frac(snap.zrow[j]) : "·");
      if (j === snap.enter) cell.classList.add("enter-val");
      mark(cell, key);
      zRow.appendChild(cell);
    }
    if (hasRatio) zRow.appendChild(td(""));
    tbody.appendChild(zRow);
    tbl.appendChild(tbody);

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    wrap.appendChild(tbl);

    if (snap.enter >= 0 && snap.ratios && !opts.noNarration) {
      const info = document.createElement("div");
      info.style.cssText = "font-size:.86rem;margin-top:.5rem;line-height:1.7";
      const entLab = labels[snap.enter];
      if (snap.leave >= 0) {
        const leaveLab = labels[snap.basis[snap.leave]];
        info.innerHTML =
          "➡️ <b>Entra</b> <span class='chip-enter'>$" + entLab + "$</span>: columna con el $z_j-c_j$ más negativo " +
          "(<span class='chip-enter'>" + IO.frac(snap.zrow[snap.enter]) + "</span>).<br>" +
          "⬅️ <b>Sale</b> <span class='chip-leave'>$" + leaveLab + "$</span>: menor cociente $\\theta=B/a$ " +
          "(<span class='chip-leave'>" + IO.frac(snap.ratios[snap.leave]) + "</span>). <b>Pivote</b> = <span class='hl' style='background:#fed7aa;color:#9a3412'>" + IO.frac(snap.pivotVal) + "</span>.";
      } else {
        info.innerHTML = "♾️ <b>No acotado:</b> la columna que entra no tiene ningún $a_{ij} > 0$ → no hay cociente.";
      }
      wrap.appendChild(info);
    }
    return wrap;
  }

  function th(html, colspan) { const e = document.createElement("th"); e.innerHTML = html; if (colspan) e.colSpan = colspan; return e; }
  function td(html) { const e = document.createElement("td"); e.innerHTML = html; return e; }
  function tdh(html) { const e = document.createElement("td"); e.className = "row-head"; e.innerHTML = html; return e; }

  /* ---------- Interpretación de la tabla óptima ---------- */
  function optimalReading(cfg, model, snap) {
    const { labels } = model;
    const vals = {};
    snap.basis.forEach((bi, i) => { vals[bi] = snap.b[i]; });
    let html = '<div class="result-box"><p><b>✔ Tabla óptima</b> — todos los $z_j - c_j \\ge 0$.</p>';
    html += "<p><b>Solución:</b> ";
    const parts = [];
    for (let j = 0; j < model.total; j++) parts.push("$" + labels[j] + " = " + IO.frac(vals[j] || 0) + "$");
    html += parts.join(", &nbsp; ") + "</p>";
    html += "<p><b>Funcional óptimo:</b> $Z = " + IO.frac(snap.zval) + "$</p>";
    // valores marginales (precios sombra) = zj-cj de las columnas slack
    html += "<p><b>Valores marginales de los recursos</b> (lectura en las columnas de las variables de holgura):</p><ul>";
    for (let k = 0; k < model.m; k++) {
      const slackCol = model.n + k;
      const vm = snap.zrow[slackCol];
      const name = cfg.constraints[k].name || ("Restricción " + (k + 1));
      html += "<li><b>" + name + "</b>: valor marginal = <b>" + IO.frac(vm) + "</b> " +
        (Math.abs(vm) < 1e-9 ? "(recurso no saturado: sobra, no conviene pagar por más)" : "(cada unidad extra del recurso mejora $Z$ en " + IO.frac(vm) + ")") + "</li>";
    }
    html += "</ul></div>";
    return html;
  }

  /* ---------- Leyenda de colores ---------- */
  function legendBlock() {
    return '<div class="legend" style="margin:.2rem 0 .8rem">' +
      '<span><span class="swatch" style="background:#fef3c7"></span>Columna que entra / fila que sale</span>' +
      '<span><span class="swatch" style="background:#d97706"></span>Pivote</span>' +
      '<span><span class="swatch" style="background:#eef2ff"></span>Fila $Z$ ($z_j-c_j$)</span>' +
      "</div>";
  }

  /* ---------- Construcción de la tabla inicial ---------- */
  function constructionBlock(cfg, model) {
    let h = '<details class="qa" open><summary>🔎 ¿De dónde sale cada número de la tabla inicial?</summary><div>';
    h += "<p><b>1) Forma estándar.</b> Cada restricción ≤ suma una variable de holgura. Quedan:</p>";
    h += '<div class="mathblock">$$\\begin{aligned}';
    cfg.constraints.forEach((r, i) => {
      const terms = r.a.map((a, j) => IO.frac(a) + (cfg.vars ? cfg.vars[j] : "x_{" + (j + 1) + "}")).join(" + ");
      h += "\\text{" + (r.name || "R" + (i + 1)) + ")}\\;& " + terms + " + x_{" + (model.n + i + 1) + "} = " + IO.frac(r.b) + " \\\\";
    });
    h += "\\end{aligned}$$</div>";
    h += "<p><b>2) Cada fila de la tabla = una restricción.</b> La columna <b>$B$</b> es el RHS ($b_i$). " +
      "Las columnas $A_1,\\dots$ son los coeficientes $a_{ij}$. Las columnas de las holguras forman una <b>matriz identidad</b> " +
      "(un 1 en su fila, 0 en las demás): por eso arrancan siendo la base.</p>";
    h += "<p><b>3) Fila $c_j$</b> (arriba): el coeficiente de cada variable en el funcional (las holguras valen 0).</p>";
    h += "<p><b>4) Fila $Z$.</b> Como la base son las holguras (con $c_k=0$), todos los $z_j=0$, así que " +
      "$z_j - c_j = -c_j$. Por eso la fila $Z$ inicial son los coeficientes del funcional <b>cambiados de signo</b>, y $Z=0$.</p>";
    h += "</div></details>";
    return h;
  }

  /* ---------- Explicación del pivoteo (cómo se pasó de una tabla a la siguiente) ---------- */
  function pivotExplain(model, prev) {
    if (prev.enter < 0 || prev.leave < 0) return "";
    const ent = model.labels[prev.enter];
    const sal = model.labels[prev.basis[prev.leave]];
    let h = '<details class="qa"><summary>🧮 ¿Cómo se calculó esta tabla? (pivoteo Gauss-Jordan)</summary><div>';
    h += "<p>Queremos que la columna de <b>$" + ent + "$</b> (la que entra) quede como <b>vector unitario</b>: un <b>1</b> en la fila de <b>$" + sal + "$</b> (la que sale) y <b>0</b> en las demás.</p>";
    h += "<ol style='margin:.3rem 0'>";
    h += "<li><b>Fila pivote</b> (la de $" + sal + "$): se divide toda por el <b>pivote</b> $p = " + IO.frac(prev.pivotVal) + "$. Así el pivote se vuelve 1.</li>";
    h += "<li><b>Las otras filas</b>: $\\text{fila}_i^{nueva} = \\text{fila}_i^{vieja} - a_{i," + ent + "}\\cdot \\text{fila pivote}^{nueva}$, para hacer 0 su coeficiente en la columna de $" + ent + "$.</li>";
    h += "<li>La <b>fila $Z$</b> se recalcula igual (o con $z_j-c_j$). Cuando todos los $z_j-c_j\\ge 0$, es óptima.</li>";
    h += "</ol></div></details>";
    return h;
  }

  /* ---------- Helpers de conexión por colores (tabla ↔ ecuaciones) ---------- */
  function buildConn(cfg, model) {
    const F = IO.frac, n = model.n, M = model.m;
    const vname = (j) => cfg.vars ? cfg.vars[j] : "x_{" + (j + 1) + "}";
    const hiCj = {}; for (let j = 0; j < n; j++) hiCj["c" + j] = "conn-cj";
    const hiBody = Object.assign({}, hiCj);
    for (let i = 0; i < M; i++) { hiBody["b" + i] = "conn-b"; for (let j = 0; j < n; j++) hiBody["a" + i + "_" + j] = "conn-a"; hiBody["a" + i + "_" + (n + i)] = "conn-slack"; }
    const hiZ = Object.assign({}, hiCj); for (let j = 0; j < n; j++) hiZ["z" + j] = "conn-cj";
    const hiFull = Object.assign({}, hiBody, hiZ);
    function objHtml() { const ts = []; for (let j = 0; j < n; j++) ts.push("<span class='cn-cj'>" + F(model.c[j]) + "</span>$\\," + vname(j) + "$"); return "$\\max\\;Z = $ " + ts.join(" $+$ "); }
    function restrHtml(i) { const r = cfg.constraints[i], ts = []; for (let j = 0; j < n; j++) ts.push("<span class='cn-a'>" + F(r.a[j]) + "</span>$\\," + vname(j) + "$"); return "<b>" + (r.name || ("R" + (i + 1))) + ")</b> " + ts.join(" $+$ ") + " $+$ <span class='cn-slack'>$1\\!\\cdot\\! x_{" + (n + i + 1) + "}$</span> $=$ <span class='cn-b'>" + F(r.b) + "</span>"; }
    function explainAll() {
      let s = "<div class='mp-formula'><b>① Funcional → fila $c_j$</b> (<span class='cn-cj'>violeta</span>): " + objHtml() + "<br><br>";
      s += "<b>② Restricciones (forma estándar con holgura) → filas</b> (coefs <span class='cn-a'>verde-agua</span>, holgura <span class='cn-slack'>naranja</span>, RHS <span class='cn-b'>celeste</span>):<br>";
      for (let i = 0; i < M; i++) s += restrHtml(i) + "<br>";
      s += "<br><b>③ Fila $Z$</b>: la base son las holguras ($c_k=0$) ⟹ $z_j-c_j=-c_j$ (el funcional cambiado de signo), y $Z=0$.</div>";
      return s;
    }
    return { hiCj, hiBody, hiZ, hiFull, objHtml, restrHtml, explainAll };
  }

  /* ---------- Secuencia "solo tablas" (una tabla por paso) ---------- */
  function buildTablesSequence(model, steps, status, cfg) {
    const conn = buildConn(cfg, model);
    const seq = [];
    steps.forEach((s, i) => {
      const isLast = i === steps.length - 1;
      seq.push({
        label: i === 0 ? "Tabla inicial" : (s.enter === -1 ? "Tabla óptima" : "Iteración " + i),
        render(host) {
          host.appendChild(IO.html(legendBlock()));
          if (i === 0) {
            host.appendChild(IO.html(conn.explainAll()));
            host.appendChild(renderTable(model, Object.assign({}, s, { enter: -1, leave: -1, ratios: null }), i, isLast, { hiCells: conn.hiFull }));
          } else {
            host.appendChild(IO.html(pivotExplain(model, steps[i - 1])));
            host.appendChild(renderTable(model, s, i, isLast));
          }
          if (isLast && status === "optimo" && s.enter === -1) host.appendChild(IO.html(optimalReading(cfg, model, s)));
          else if (isLast && status === "no_acotado") host.appendChild(IO.html('<div class="callout warn"><b>Problema no acotado:</b> $Z$ puede crecer indefinidamente.</div>'));
        },
      });
    });
    return seq;
  }

  /* ---------- Secuencia "micro-pasos" (número por número) ---------- */
  function buildMicroSequence(model, steps, status, cfg) {
    const seq = [], F = IO.frac, N = model.total, M = model.m, n = model.n;
    const vname = (j) => cfg.vars ? cfg.vars[j] : "x_{" + (j + 1) + "}";
    const cols = ["B"]; for (let j = 0; j < N; j++) cols.push(j);
    const colTex = (c) => c === "B" ? "$B$" : "$A_{" + (c + 1) + "}$";
    const colPlain = (c) => c === "B" ? "B" : "A" + (c + 1);
    const cellKey = (rs, c) => c === "B" ? (rs === "z" ? "zval" : "b" + rs) : (rs === "z" ? "z" + c : "a" + rs + "_" + c);
    const getV = (snap, rs, c) => c === "B" ? (rs === "z" ? snap.zval : snap.b[rs]) : (rs === "z" ? snap.zrow[c] : snap.A[rs][c]);

    /* ---- Construcción de la tabla inicial, conectando colores con las ecuaciones ---- */
    const conn = buildConn(cfg, model);
    const cleanInit = Object.assign({}, steps[0], { enter: -1, leave: -1, ratios: null });

    seq.push({
      label: "Armar la tabla inicial · ① la fila $c_j$ (del funcional)", render(host) {
        host.appendChild(IO.html("<div class='mp-formula'>El <b>funcional</b> es:<br>" + conn.objHtml() +
          "<br>Cada coeficiente va a la <b>fila $c_j$</b> (en <span class='cn-cj'>violeta</span>). Las holguras $x_{" + (n + 1) + "},\\dots$ <b>no</b> están en $Z$ → su $c_j = 0$.</div>"));
        host.appendChild(renderTable(model, cleanInit, 0, false, { hiCells: conn.hiCj, partial: { rows: new Set(), zDone: false } }));
      },
    });
    seq.push({
      label: "Armar la tabla inicial · ② las restricciones (forma estándar)", render(host) {
        let r = "<div class='mp-formula'>Pasamos cada restricción a <b>forma estándar</b>: la inecuación "+
          "$\\le$ se vuelve igualdad <b>sumando su variable de holgura</b> (con coeficiente <b>1</b>). " +
          "Los coeficientes de $x_1,x_2$ van en $A_1, A_2$ (<span class='cn-a'>verde-agua</span>), el <b>1</b> de la holgura va en su columna " +
          "$A_{" + (n + 1) + "},\\dots$ (<span class='cn-slack'>naranja</span>) y el término independiente en <b>$B$</b> (<span class='cn-b'>celeste</span>):<br>";
        for (let i = 0; i < M; i++) r += conn.restrHtml(i) + "<br>";
        r += "Como cada holgura aparece <b>solo en su fila</b>, sus columnas forman una <b>matriz identidad</b> " +
          "(<span class='cn-slack'>1</span> en su fila, 0 en las demás). Por eso $x_{" + (n + 1) + "},\\dots$ arrancan siendo la base.</div>";
        host.appendChild(IO.html(r));
        const rowsAll = new Set(); for (let i = 0; i < M; i++) rowsAll.add(i);
        host.appendChild(renderTable(model, cleanInit, 0, false, { hiCells: conn.hiBody, partial: { rows: rowsAll, zDone: false } }));
      },
    });
    seq.push({
      label: "Armar la tabla inicial · ③ la fila $Z$", render(host) {
        host.appendChild(IO.html("<div class='mp-formula'>La base inicial son las holguras (con $c_k = 0$), así que todos los $z_j = 0$ y entonces <b>$z_j - c_j = -c_j$</b>: la fila $Z$ son los coeficientes del funcional <b>cambiados de signo</b> (y $Z = 0$).</div>"));
        host.appendChild(renderTable(model, cleanInit, 0, true, { hiCells: conn.hiZ }));
        if (steps[0].enter === -1) host.appendChild(IO.html(optimalReading(cfg, model, steps[0])));
      },
    });

    /* ---- Iteraciones celda por celda ---- */
    for (let t = 0; t < steps.length - 1; t++) {
      const from = steps[t]; if (from.enter < 0 || from.leave < 0) continue;
      const to = steps[t + 1], e = from.enter, lr = from.leave, p = from.pivotVal;
      const entLab = model.labels[e], iterN = t + 1;
      const cleanFrom = Object.assign({}, from, { enter: -1, leave: -1, ratios: null });
      const cleanTo = Object.assign({}, to, { enter: -1, leave: -1, ratios: null });

      seq.push({
        label: "Iteración " + iterN + " · ¿quién ENTRA?", render(host) {
          const fe = Object.assign({}, from, { leave: -1, ratios: null });
          host.appendChild(renderTable(model, fe, t, false, { noNarration: true }));
          host.appendChild(IO.html("<div class='mp-formula'>Miramos la fila <b>$Z$</b>. El $z_j-c_j$ <b>más negativo</b> es <span class='chip-enter'>" + F(from.zrow[e]) + "</span> → <b>entra</b> <span class='chip-enter'>$" + entLab + "$</span> (la que más mejora $Z$).</div>"));
        },
      });
      seq.push({
        label: "Iteración " + iterN + " · ¿quién SALE? (cociente $B/a$)", render(host) {
          host.appendChild(renderTable(model, from, t, false, {}));
        },
      });

      // celdas: fila pivote, resto de filas, fila Z
      const rowOrder = [lr]; for (let i = 0; i < M; i++) if (i !== lr) rowOrder.push(i); rowOrder.push("z");
      const filled = new Set();
      rowOrder.forEach((rs) => {
        const rowTex = rs === lr ? "pivote $" + entLab + "$" : rs === "z" ? "$Z$" : "$" + model.labels[from.basis[rs]] + "$";
        const factor = rs === lr ? p : (rs === "z" ? from.zrow[e] : from.A[rs][e]);
        cols.forEach((c) => {
          filled.add(cellKey(rs, c));
          const snapshot = new Set(filled);
          const oldV = getV(from, rs, c), res = getV(to, rs, c);
          // resaltados
          const leftHi = {}, rightHi = {};
          leftHi[cellKey(rs, c)] = "hi-old";
          if (rs === lr) { leftHi[cellKey(lr, e)] = "hi-factor"; }
          else { leftHi[cellKey(rs, e)] = "hi-factor"; rightHi[cellKey(lr, c)] = "hi-pivot2"; }
          rightHi[cellKey(rs, c)] = "hi-new";
          // aritmética
          let arith, formula;
          if (rs === lr) {
            arith = "<span class='op-old'>" + F(oldV) + "</span> ÷ <span class='op-factor'>" + F(p) + "</span> = <span class='op-res'>" + F(res) + "</span>";
            formula = "<b>Fila pivote ÷ pivote.</b> Tomo el número <span class='op-old'>viejo</span> de esta celda y lo divido por el <span class='op-factor'>pivote (" + F(p) + ")</span>.";
          } else {
            const piv = getV(to, lr, c);
            arith = "<span class='op-old'>" + F(oldV) + "</span> − <span class='op-factor'>" + F(factor) + "</span> × <span class='op-pivot'>" + F(piv) + "</span> = <span class='op-res'>" + F(res) + "</span>";
            formula = "<b>" + (rs === "z" ? "Fila $Z$" : "Fila " + rowTex) + " = viejo − factor × pivote.</b> El <span class='op-factor'>factor (" + F(factor) + ")</span> es " + (rs === "z" ? "el $z_j-c_j$ de la columna que entra" : "el valor de esta fila en la columna que entra") + "; el <span class='op-pivot'>pivote (" + F(piv) + ")</span> es el de la fila pivote nueva en esta columna.";
          }
          const lh = leftHi, rh = rightHi, snap = snapshot, ar = arith, fm = formula, cc = c, rr = rs;
          const lastCell = (rs === "z" && c === cols[cols.length - 1]);
          seq.push({
            label: "Iteración " + iterN + " · fila " + rowTex + " · columna " + colTex(cc), render(host) {
              const grid = document.createElement("div"); grid.className = "mp-grid";
              const L = document.createElement("div"); L.appendChild(IO.html("<div class='mp-tablabel'>↩ Tabla anterior</div>"));
              L.appendChild(renderTable(model, cleanFrom, t, false, { hiCells: lh }));
              const R = document.createElement("div"); R.appendChild(IO.html("<div class='mp-tablabel'>✏️ Tabla nueva (en construcción)</div>"));
              R.appendChild(renderTable(model, cleanTo, t + 1, false, { partial: { cells: snap }, hiCells: rh }));
              grid.appendChild(L); grid.appendChild(R); host.appendChild(grid);
              host.appendChild(IO.html("<div class='mp-formula'>" + fm + "</div>"));
              host.appendChild(IO.html("<div class='mp-arith'>" + colTex(cc) + ":&nbsp; " + ar + "</div>"));
              if (lastCell && to.enter === -1) host.appendChild(IO.html(optimalReading(cfg, model, to)));
            },
          });
        });
      });
    }

    // paso final
    const last = steps[steps.length - 1];
    if (status === "no_acotado") {
      seq.push({ label: "Resultado · no acotado", render(host) { host.appendChild(renderTable(model, last, steps.length - 1, true, {})); host.appendChild(IO.html('<div class="callout warn"><b>Problema no acotado:</b> $Z$ crece sin límite.</div>')); } });
    }
    return seq;
  }

  /* ---------- Widget ---------- */
  IO.simplexStepper = function (container, cfg) {
    const wrap = IO.h("div.widget");
    wrap.appendChild(IO.h("div.widget-title", { html: "🧮 " + (cfg.title || "Método Simplex paso a paso") }));
    if (cfg.subtitle) wrap.appendChild(IO.h("div.widget-sub", { html: cfg.subtitle }));

    const { model, steps, status } = solve(cfg);
    const micro = buildMicroSequence(model, steps, status, cfg);
    const tables = buildTablesSequence(model, steps, status, cfg);
    let seq = micro, idx = 0, mode = "micro";
    const host = IO.h("div");

    // Barra única: modo a la izquierda, navegación a la derecha. Va arriba (posición fija).
    function makeToolbar() {
      const bar = IO.h("div.mp-nav");
      const left = IO.h("div", { style: "display:flex;align-items:center;gap:.4rem;flex-wrap:wrap" });
      left.appendChild(IO.h("span", { style: "font-size:.8rem;color:var(--ink-soft);font-weight:600", text: "Modo:" }));
      const mb = IO.h("button" + (mode === "micro" ? ".btn.sm" : ".btn.ghost.sm"), { text: "Paso a paso" });
      const tb = IO.h("button" + (mode === "tables" ? ".btn.sm" : ".btn.ghost.sm"), { text: "📊 Solo tablas" });
      mb.addEventListener("click", () => setMode("micro"));
      tb.addEventListener("click", () => setMode("tables"));
      left.appendChild(mb); left.appendChild(tb);

      const right = IO.h("div", { style: "display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap" });
      const cnt = IO.h("span", { style: "font-size:.82rem;color:var(--ink-soft)", text: "Paso " + (idx + 1) + " / " + seq.length });
      const prev = IO.h("button.btn.ghost.sm", { text: "← Anterior" });
      const next = IO.h("button.btn.sm.mp-big", { text: "Siguiente →" });
      prev.disabled = idx === 0; next.disabled = idx === seq.length - 1;
      prev.addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
      next.addEventListener("click", () => { if (idx < seq.length - 1) { idx++; render(); } });
      right.appendChild(cnt); right.appendChild(prev); right.appendChild(next);

      bar.appendChild(left); bar.appendChild(right);
      return bar;
    }
    function render() {
      host.innerHTML = "";
      host.appendChild(makeToolbar());
      const stage = IO.h("div.mp-stage");
      stage.appendChild(IO.h("div", { style: "font-weight:700;margin:.2rem 0 .6rem;color:var(--brand);font-size:1.02rem", html: seq[idx].label }));
      seq[idx].render(stage);
      host.appendChild(stage);
      IO.renderMath(host);
    }
    function setMode(m) { mode = m; seq = m === "micro" ? micro : tables; idx = 0; render(); }

    wrap.appendChild(host);
    container.appendChild(wrap); render();
  };
})();
