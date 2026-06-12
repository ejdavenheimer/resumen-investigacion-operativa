(function () {
  "use strict";
  const IO = window.IO;

  /* ---------- Ejercicios gráficos (U2) ---------- */
  IO.register({
    id: "ejercicios",
    group: "Ejercicios resueltos",
    title: "Gráficos (U2)",
    tag: "✎",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Ejercicios resueltos · de las PPT de la cátedra</div>
          <h1>Formular y resolver gráficamente</h1>
          <p class="lead">Cada ejercicio: <b>enunciado → formulación → resolución dibujada paso a paso → interpretación</b>.
          Avanzá con <b>Siguiente</b> en cada gráfico.</p>
        </div>

        <h2>Ejercicio 2 — Fábrica de bombones (MAX)</h2>
        <div class="callout key"><p>Cajas de 1 kg, tipos <b>A</b> y <b>B</b>. La caja A lleva 300 g de licor, 500 g de nuez y
        200 g de fruta; la B lleva 400 g, 200 g y 400 g. Utilidad: \\$120 (A) y \\$90 (B). Disponible: 100 kg de licor,
        120 kg de nuez, 100 kg de fruta. ¿Cuántas cajas de cada tipo maximizan el beneficio?</p></div>
        <p><b>Variables:</b> $x_1$ = cajas A, $x_2$ = cajas B (pasamos kg a gramos).</p>
        <div class="mathblock">$$\\begin{aligned}
        \\max\\;& 120x_1 + 90x_2 \\\\
        \\text{Licor)}\\;& 300x_1 + 400x_2 \\le 100000 \\\\
        \\text{Nuez)}\\;& 500x_1 + 200x_2 \\le 120000 \\\\
        \\text{Fruta)}\\;& 200x_1 + 400x_2 \\le 100000
        \\end{aligned}$$</div>
        <div id="ej2"></div>

        <h2>Ejercicio 3 — Mezcla de concreto (MIN)</h2>
        <div class="callout key"><p>Ingredientes <b>A</b> (\\$60/kg: 4 fina, 3 gruesa, 5 piedrecillas) y <b>B</b>
        (\\$100/kg: 3 fina, 6 gruesa, 2 piedrecillas). Cada saco necesita <b>al menos</b> 12 de arena fina, 12 de gruesa
        y 10 de piedrecillas. Minimizar el costo.</p></div>
        <p><b>Variables:</b> $x_1$ = kg de A, $x_2$ = kg de B. Restricciones de <b>mínimo</b> ⟹ "≥".</p>
        <div class="mathblock">$$\\begin{aligned}
        \\min\\;& 60x_1 + 100x_2 \\\\
        \\text{Fina)}\\;& 4x_1 + 3x_2 \\ge 12 \\\\
        \\text{Gruesa)}\\;& 3x_1 + 6x_2 \\ge 12 \\\\
        \\text{Piedra)}\\;& 5x_1 + 2x_2 \\ge 10
        \\end{aligned}$$</div>
        <div id="ej3"></div>

        <h2>Ejercicio 4 — Pintura de sendas (MIN)</h2>
        <div class="callout key"><p>Cada cruce exige <b>al menos</b> 300 lúmenes de luminosidad y 250 luxes de reflexión.
        Hay dos concentrados: <b>N</b> (1 lumen y 3 luxes por gramo; \\$450/kg = \\$0,45/g) y <b>L</b> (1 lumen por gramo,
        0 luxes; \\$120/kg = \\$0,12/g). Minimizar el costo de la mezcla.</p></div>
        <p><b>Variables:</b> $x_1$ = gramos de N, $x_2$ = gramos de L.</p>
        <div class="mathblock">$$\\begin{aligned}
        \\min\\;& 0{,}45x_1 + 0{,}12x_2 \\\\
        \\text{Lúmenes)}\\;& x_1 + x_2 \\ge 300 \\\\
        \\text{Luxes)}\\;& 3x_1 \\ge 250
        \\end{aligned}$$</div>
        <div id="ej5"></div>

        <h2>Ejercicio 8 — Inversión (MAX)</h2>
        <div class="callout key"><p>Hasta \\$150.000 para invertir. Plazo fijo rinde 10% y bonos 15%. Mínimo en plazo fijo:
        \\$30.000. Máximo en bonos: \\$90.000. Además, el plazo fijo no puede superar el <b>doble</b> de los bonos.
        Maximizar el interés anual.</p></div>
        <p><b>Variables:</b> $x_1$ = \\$ en plazo fijo, $x_2$ = \\$ en bonos.</p>
        <div class="mathblock">$$\\begin{aligned}
        \\max\\;& 0{,}10x_1 + 0{,}15x_2 \\\\
        \\text{Capital)}\\;& x_1 + x_2 \\le 150000 \\\\
        \\text{Mín PF)}\\;& x_1 \\ge 30000 \\\\
        \\text{Máx Bonos)}\\;& x_2 \\le 90000 \\\\
        \\text{PF≤2·Bonos)}\\;& x_1 - 2x_2 \\le 0
        \\end{aligned}$$</div>
        <div id="ej8"></div>
        <div class="callout info"><p><b>Pregunta (d):</b> si el mínimo de plazo fijo bajara a \\$20.000, ¿cambia el óptimo?
        Cambiá el RHS de "Mín PF" a 20000 en el solucionador y comparálo: si esa restricción <b>no era activa</b>,
        el óptimo no cambia.</p></div>

        <div class="callout tip"><p>Estos mismos problemas se pueden resolver por <b>Simplex</b>. En
        <a class="inline" data-go="ejercicios-simplex" style="cursor:pointer"><b>Casos Simplex (U3)</b></a> tenés
        una galería para aprender a <b>identificar el tipo de solución</b>.</p></div>
      `;

      IO.graphicalWalkthrough(el.querySelector("#ej2"), { sense: "max", c: [120, 90], vars: ["x_1", "x_2"], title: "Bombones", subtitle: "$\\max 120x_1+90x_2$", constraints: [
        { a: [300, 400], op: "<=", b: 100000, name: "Licor" },
        { a: [500, 200], op: "<=", b: 120000, name: "Nuez" },
        { a: [200, 400], op: "<=", b: 100000, name: "Fruta" }] });

      IO.graphicalWalkthrough(el.querySelector("#ej3"), { sense: "min", c: [60, 100], vars: ["x_1", "x_2"], title: "Concreto", subtitle: "$\\min 60x_1+100x_2$", constraints: [
        { a: [4, 3], op: ">=", b: 12, name: "Fina" },
        { a: [3, 6], op: ">=", b: 12, name: "Gruesa" },
        { a: [5, 2], op: ">=", b: 10, name: "Piedra" }] });

      IO.graphicalWalkthrough(el.querySelector("#ej5"), { sense: "min", c: [0.45, 0.12], vars: ["x_1", "x_2"], title: "Pintura", subtitle: "$\\min 0{,}45x_1+0{,}12x_2$", constraints: [
        { a: [1, 1], op: ">=", b: 300, name: "Lúmenes" },
        { a: [3, 0], op: ">=", b: 250, name: "Luxes" }] });

      IO.graphicalSolver(el.querySelector("#ej8"), { sense: "max", c: [0.10, 0.15], vars: ["x_1", "x_2"], editable: true, title: "Inversión", subtitle: "Editable — para el inciso (d), poné Mín PF = 20000.", constraints: [
        { a: [1, 1], op: "<=", b: 150000, name: "Capital" },
        { a: [1, 0], op: ">=", b: 30000, name: "Mín PF" },
        { a: [0, 1], op: "<=", b: 90000, name: "Máx Bonos" },
        { a: [1, -2], op: "<=", b: 0, name: "PF≤2Bonos" }] });

      el.querySelectorAll("[data-go]").forEach((c) => c.addEventListener("click", () => IO.go(c.dataset.go)));
      IO.renderMath(el);
    },
  });

  /* ---------- Galería de casos Simplex (U3) ---------- */
  IO.register({
    id: "ejercicios-simplex",
    group: "Ejercicios resueltos",
    title: "Casos Simplex (U3)",
    tag: "✱",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Ejercicios resueltos · U3</div>
          <h1>Galería de casos — identificar el tipo de solución</h1>
          <p class="lead">Estos 8 problemas de la PPT están elegidos para que aprendas a reconocer
          <b>óptimo único, óptimo múltiple, no acotado y no factible</b>, tanto en el gráfico como en la tabla.</p>
        </div>

        <div class="callout key">
          <div class="callout-title">🔎 Cómo detectar cada caso en la tabla final</div>
          <ul style="margin:.3rem 0">
            <li><b>Óptimo único:</b> todos los $z_j-c_j \\ge 0$ y las no básicas con $z_j-c_j > 0$.</li>
            <li><b>Óptimo múltiple:</b> una variable <b>no básica</b> tiene $z_j-c_j = 0$.</li>
            <li><b>No acotado:</b> la columna que entra no tiene ningún $a_{ij} > 0$ (no se puede el cociente).</li>
            <li><b>No factible:</b> queda una variable <b>artificial</b> en la base con valor positivo.</li>
          </ul>
        </div>

        <div class="grid-2" id="gallery"></div>
      `;

      const ejs = [
        { n: "Ejercicio 1", f: "$\\max 6x_1+2x_2$", cfg: { sense: "max", c: [6, 2], vars:["x_1","x_2"], constraints: [
          { a: [1, 1], op: "<=", b: 300, name: "R1" }, { a: [2.5, 4], op: "<=", b: 1000, name: "R2" },
          { a: [0, 1], op: "=", b: 200, name: "R3 (=)" }, { a: [1, 0], op: "<=", b: 200, name: "R4" }] } },
        { n: "Ejercicio 2", f: "$\\max -2x_1+4x_2$", cfg: { sense: "max", c: [-2, 4], vars:["x_1","x_2"], constraints: [
          { a: [0, 1], op: "<=", b: 3, name: "R1" }, { a: [4, 5], op: "<=", b: 24, name: "R2" }] } },
        { n: "Ejercicio 3", f: "$\\max 4x_1+4x_2$", cfg: { sense: "max", c: [4, 4], vars:["x_1","x_2"], constraints: [
          { a: [1, 0], op: "<=", b: 6, name: "R1" }, { a: [1, 1], op: "<=", b: 8, name: "R2" }, { a: [1, 2], op: "<=", b: 12, name: "R3" }] } },
        { n: "Ejercicio 4", f: "$\\max 6x_1+4x_2$", cfg: { sense: "max", c: [6, 4], vars:["x_1","x_2"], constraints: [
          { a: [2, 4], op: "<=", b: 48, name: "R1" }, { a: [4, 2], op: "<=", b: 60, name: "R2" }, { a: [3, 0], op: "<=", b: 45, name: "R3" }] } },
        { n: "Ejercicio 5", f: "$\\max 2x_1+x_2$", cfg: { sense: "max", c: [2, 1], vars:["x_1","x_2"], constraints: [
          { a: [-5, 3], op: ">=", b: 5, name: "R1" }, { a: [1, 1], op: "<=", b: 4, name: "R2" }, { a: [2, 1], op: ">=", b: 10, name: "R3" }] } },
        { n: "Ejercicio 6", f: "$\\max x_1+8x_2$", cfg: { sense: "max", c: [1, 8], vars:["x_1","x_2"], constraints: [
          { a: [0, 1], op: ">=", b: 2, name: "R1" }, { a: [4, 6], op: ">=", b: 24, name: "R2" }, { a: [10, -30], op: ">=", b: 30, name: "R3" }] } },
        { n: "Ejercicio 7", f: "$\\min x_1-2x_2$", cfg: { sense: "min", c: [1, -2], vars:["x_1","x_2"], constraints: [
          { a: [1, 0], op: ">=", b: 2, name: "R1" }, { a: [2, 1], op: "<=", b: 10, name: "R2" }, { a: [1, 2], op: "<=", b: 8, name: "R3" }, { a: [0, 1], op: ">=", b: 1, name: "R4" }] } },
        { n: "Ejercicio 8", f: "$\\max 3x_1+x_2$", cfg: { sense: "max", c: [3, 1], vars:["x_1","x_2"], constraints: [
          { a: [1, 1], op: "<=", b: 6, name: "R1" }, { a: [2, 1], op: "<=", b: 1, name: "R2" }, { a: [-1, 2], op: ">=", b: 8, name: "R3" }] } },
      ];
      const g = el.querySelector("#gallery");
      ejs.forEach((e) => {
        const card = IO.h("div.card");
        card.appendChild(IO.h("h3", { html: e.n + " — " + e.f, style: "margin-top:0" }));
        const host = IO.h("div"); card.appendChild(host);
        g.appendChild(card);
        IO.graphicalMini(host, e.cfg);
      });

      IO.renderMath(el);
    },
  });

  /* ---------- Dualidad (U4) resuelta paso a paso ---------- */
  IO.register({
    id: "ejercicios-dual",
    group: "Ejercicios resueltos",
    title: "Dualidad (U4)",
    tag: "⇄",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Ejercicios resueltos · U4</div>
          <h1>Plantear y resolver el DUAL — paso a paso</h1>
          <p class="lead">Lo más importante: <b>cómo se arma</b> el dual a partir del primal, y <b>cómo se resuelve</b>
          usando la relación entre ambos. Acá, dos ejercicios de la cátedra, despacito.</p>
        </div>

        <div class="callout key">
          <div class="callout-title">🧭 La receta (primal MAX con todas "≤" → dual MIN con todas "≥")</div>
          <ol style="margin:.3rem 0">
            <li>Cada <b>restricción</b> del primal ($m$) genera una <b>variable dual</b> $y_i \\ge 0$.</li>
            <li>Cada <b>variable</b> del primal ($n$) genera una <b>restricción dual</b> "≥".</li>
            <li>Los <b>RHS</b> del primal ($b_i$) pasan a ser los <b>coeficientes del objetivo</b> dual.</li>
            <li>Los <b>coeficientes del funcional</b> primal ($c_j$) pasan a ser los <b>RHS</b> del dual.</li>
            <li>La matriz se <b>traspone</b>: la restricción dual de $x_j$ usa la <b>columna</b> $j$ del primal.</li>
          </ol>
          <p style="margin:.3rem 0"><b>Si el primal tiene "≥" o "="</b>, primero pasalo a canónica (multiplicá la "≥" por −1; partí la "=" en "≤" y "≥"). Ver <a class="inline" data-go="u2-formulacion" style="cursor:pointer">formas</a> y <a class="inline" data-go="u4-dualidad" style="cursor:pointer">dualidad</a>.</p>
        </div>

        <h2>Ejercicio A — $\\max Z = 5x_1 + 2x_2$</h2>
        <div class="mathblock">$$\\begin{aligned}
        \\max\\; Z =\\;& 5x_1 + 2x_2 \\\\
        \\text{(1)}\\;& -2x_1 + x_2 \\le 2 \\\\
        \\text{(2)}\\;& x_1 - x_2 \\le 2 \\\\
        \\text{(3)}\\;& x_1 + x_2 \\le 5 \\\\
        & x_1, x_2 \\ge 0
        \\end{aligned}$$</div>

        <ol class="steps">
          <li><span class="step-title">Identificar tamaños</span>
          3 restricciones → <b>3 variables duales</b> $y_1, y_2, y_3 \\ge 0$. &nbsp; 2 variables → <b>2 restricciones duales</b> "≥".</li>
          <li><span class="step-title">Objetivo dual (MIN) con los RHS del primal</span>
          $\\min\\; G = \\textcolor{#0284c7}{2}y_1 + \\textcolor{#0284c7}{2}y_2 + \\textcolor{#0284c7}{5}y_3$ &nbsp; (los $\\textcolor{#0284c7}{2,2,5}$ son los RHS).</li>
          <li><span class="step-title">Restricciones duales = columnas del primal, con RHS = $c_j$</span>
          <div class="mathblock">$$\\begin{aligned}
          \\text{(de } x_1)\\;& -2y_1 + y_2 + y_3 \\ge \\textcolor{#5b21b6}{5} \\\\
          \\text{(de } x_2)\\;& y_1 - y_2 + y_3 \\ge \\textcolor{#5b21b6}{2}
          \\end{aligned}$$</div>
          La columna de $x_1$ en el primal es $(-2, 1, 1)$ → coeficientes de $y_1,y_2,y_3$. El RHS $\\textcolor{#5b21b6}{5}$ es su $c_1$.</li>
          <li><span class="step-title">Dual completo</span>
          <div class="mathblock">$$\\min\\; G = 2y_1+2y_2+5y_3 \\quad\\text{s.a.}\\quad
          \\begin{cases} -2y_1+y_2+y_3 \\ge 5 \\\\ y_1-y_2+y_3 \\ge 2 \\\\ y_i \\ge 0\\end{cases}$$</div></li>
          <li><span class="step-title">Resolver usando dualidad fuerte</span>
          Resolvemos el <b>primal</b> (es de 2 variables, sale gráfico) y, como $G^*_{dual} = Z^*_{primal}$, ya tenemos el valor óptimo del dual.</li>
        </ol>
        <div id="dualA"></div>
        <div class="callout tip">
          <div class="callout-title">✔ Valores del dual por holgura complementaria</div>
          <p>En el óptimo primal $(3{,}5,\\;1{,}5)$ están activas las restricciones <b>(2)</b> y <b>(3)</b>; la <b>(1)</b> sobra.
          Por holgura complementaria: $y_1 = 0$ (su restricción no está saturada).</p>
          <p>Como $x_1, x_2 > 0$, sus restricciones duales se cumplen con <b>igualdad</b>:</p>
          <div class="mathblock">$$\\begin{cases} y_2 + y_3 = 5 \\\\ -y_2 + y_3 = 2 \\end{cases} \\;\\Rightarrow\\; y_3 = 3{,}5,\\; y_2 = 1{,}5$$</div>
          <p><b>Dual óptimo:</b> $y = (0,\\; 1{,}5,\\; 3{,}5)$, con $G = 2(0)+2(1{,}5)+5(3{,}5) = \\mathbf{20{,}5} = Z^*$. ✔</p>
          <p>Esos $y_i$ son los <b>valores marginales</b> de cada recurso del primal.</p>
        </div>

        <h2>Ejercicio B — $\\max Z = 6x_1 + 4x_2$</h2>
        <div class="mathblock">$$\\begin{aligned}
        \\max\\; Z =\\;& 6x_1 + 4x_2 \\\\
        \\text{(1)}\\;& 2x_1 + 4x_2 \\le 48 \\\\
        \\text{(2)}\\;& 4x_1 + 2x_2 \\le 60 \\\\
        \\text{(3)}\\;& 3x_1 \\le 45 \\\\
        & x_1, x_2 \\ge 0
        \\end{aligned}$$</div>
        <ol class="steps">
          <li><span class="step-title">Dual (3 variables, 2 restricciones)</span>
          <div class="mathblock">$$\\min\\; G = 48y_1+60y_2+45y_3 \\quad\\text{s.a.}\\quad
          \\begin{cases} 2y_1+4y_2+3y_3 \\ge 6 & (x_1)\\\\ 4y_1+2y_2+0y_3 \\ge 4 & (x_2)\\\\ y_i \\ge 0\\end{cases}$$</div>
          Ojo: $x_2$ <b>no aparece</b> en la restricción (3), por eso su coeficiente de $y_3$ es <b>0</b>.</li>
          <li><span class="step-title">Resolver el primal</span> (gráfico) y leer $Z^*$.</li>
        </ol>
        <div id="dualB"></div>
        <div class="callout tip">
          <div class="callout-title">✔ Valores del dual</div>
          <p>Óptimo primal $(12, 6)$, $Z^* = 96$. Activas: (1) y (2); la (3) sobra ($3\\cdot 12 = 36 < 45$) → $y_3 = 0$.
          Con $x_1,x_2>0$:</p>
          <div class="mathblock">$$\\begin{cases} 2y_1+4y_2 = 6 \\\\ 4y_1+2y_2 = 4 \\end{cases} \\;\\Rightarrow\\; y_1 = \\tfrac13,\\; y_2 = \\tfrac43$$</div>
          <p><b>Dual óptimo:</b> $y = (\\tfrac13,\\; \\tfrac43,\\; 0)$, con $G = 48\\cdot\\tfrac13 + 60\\cdot\\tfrac43 + 0 = 16 + 80 = \\mathbf{96} = Z^*$. ✔</p>
        </div>

        <div class="callout info">
          <div class="callout-title">🔑 Lo que tenés que recordar</div>
          <ul style="margin:.3rem 0">
            <li><b>Plantear</b> el dual = trasponer: restricciones↔variables, RHS↔coeficientes del objetivo.</li>
            <li><b>Resolver</b>: por dualidad fuerte, $Z^*_{primal} = G^*_{dual}$.</li>
            <li>Los <b>valores duales</b> $y_i$ se obtienen con <b>holgura complementaria</b> (las restricciones activas dan los $y_i>0$) o se leen en la tabla óptima del Simplex (columnas de las slacks).</li>
          </ul>
        </div>
      `;

      IO.graphicalMini(el.querySelector("#dualA"), { sense: "max", c: [5, 2], vars: ["x_1", "x_2"], constraints: [
        { a: [-2, 1], op: "<=", b: 2, name: "(1)" }, { a: [1, -1], op: "<=", b: 2, name: "(2)" }, { a: [1, 1], op: "<=", b: 5, name: "(3)" }] });
      IO.graphicalMini(el.querySelector("#dualB"), { sense: "max", c: [6, 4], vars: ["x_1", "x_2"], constraints: [
        { a: [2, 4], op: "<=", b: 48, name: "(1)" }, { a: [4, 2], op: "<=", b: 60, name: "(2)" }, { a: [3, 0], op: "<=", b: 45, name: "(3)" }] });

      el.querySelectorAll("[data-go]").forEach((c) => c.addEventListener("click", () => IO.go(c.dataset.go)));
      IO.renderMath(el);
    },
  });
})();
