(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u2-grafico",
    group: "Programación Lineal",
    title: "U2 · Método gráfico",
    tag: "U2",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 2 · Programación Lineal 1</div>
          <h1>Resolución gráfica (2 variables)</h1>
          <p class="lead">Con 2 variables podemos resolver dibujando. Es la mejor forma de <b>entender</b>
          qué hace el Simplex por dentro.</p>
        </div>

        <div class="callout key">
          <div class="callout-title">📋 Caso: taller metalúrgico</div>
          <p>Dos piezas, <b>A</b> y <b>B</b>, que pasan por estampado, soldado y pintado. Utilidad: \\$4 por A y \\$3 por B.</p>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Operación</th><th>A (seg/u)</th><th>B (seg/u)</th><th>Disponible</th></tr></thead>
            <tbody>
              <tr><td>Estampado</td><td>6</td><td>16</td><td>48.000</td></tr>
              <tr><td>Soldado</td><td>12</td><td>6</td><td>42.000</td></tr>
              <tr><td>Pintado</td><td>9</td><td>9</td><td>36.000</td></tr>
              <tr><td>Utilidad ($/u)</td><td>4</td><td>3</td><td></td></tr>
            </tbody>
          </table></div>
        </div>

        <h2>Paso 1 — Formular</h2>
        <p>Variables: $x_1$ = piezas A/sem, &nbsp; $x_2$ = piezas B/sem.</p>
        <div class="mathblock">$$\\begin{aligned}
        \\max\\; Z = & \\;4x_1 + 3x_2 \\\\
        \\text{EST)}\\; & 6x_1 + 16x_2 \\le 48000 \\\\
        \\text{SOL)}\\; & 12x_1 + 6x_2 \\le 42000 \\\\
        \\text{PIN)}\\; & 9x_1 + 9x_2 \\le 36000 \\\\
        & x_1, x_2 \\ge 0
        \\end{aligned}$$</div>

        <h2>Paso 2 — Resolución gráfica, dibujada de cero</h2>
        <p>Avanzá con <b>Siguiente</b>: cada restricción se dibuja calculando sus cortes con los ejes y
        <b>pintando el área que cumple</b>. La zona sombreada se va <b>achicando</b> hasta quedar la región factible;
        después la recta objetivo se desplaza hasta el óptimo.</p>
        <div id="walk"></div>

        <h2>Paso 3 — Interpretar (qué responde al problema)</h2>
        <div class="callout tip">
          <div class="callout-title">✔ Solución óptima: $x_1 = 3000$, $x_2 = 1000$</div>
          <p><b>Producción:</b> conviene fabricar <b>3000 piezas A</b> y <b>1000 piezas B</b> por semana.</p>
          <p><b>Ganancia:</b> $Z = 4\\cdot 3000 + 3\\cdot 1000 = \\mathbf{\\$15.000}$ (es lo máximo posible con estos recursos).</p>
          <p><b>¿Qué pasa con cada equipo?</b> Reemplazamos la solución en cada restricción y vemos cuánto sobra (la holgura):</p>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Equipo</th><th>Usa</th><th>Tiene</th><th>Sobra (holgura)</th><th>Estado</th></tr></thead>
            <tbody>
              <tr><td>Estampado</td><td>6·3000 + 16·1000 = 34.000</td><td>48.000</td><td><b>14.000</b> ($x_3$)</td><td><span class="pill indigo">le sobra</span></td></tr>
              <tr><td>Soldado</td><td>12·3000 + 6·1000 = 42.000</td><td>42.000</td><td>0 ($x_4$)</td><td><span class="pill green">saturado</span></td></tr>
              <tr><td>Pintado</td><td>9·3000 + 9·1000 = 36.000</td><td>36.000</td><td>0 ($x_5$)</td><td><span class="pill green">saturado</span></td></tr>
            </tbody>
          </table></div>
          <p><b>Conclusión:</b> los que <b>limitan</b> la producción son <b>Soldado y Pintado</b> (están al 100%, holgura 0).
          Si quisiéramos producir más, habría que <b>ampliar esos dos</b> — Estampado no es problema, le sobran 14.000 seg.
          Por eso esos recursos saturados son los que tendrán <b>valor marginal &gt; 0</b> (lo verás en
          <a class="inline" data-go="u4-sensibilidad" style="cursor:pointer">sensibilidad</a>).</p>
        </div>

        <h2>Tipos de solución (cada uno con su gráfico)</h2>
        <p>Todo el vocabulario se entiende mirando el mismo polígono de ejemplo:</p>
        <div class="grid-2">
          <div class="card"><h3 style="margin-top:0">Factible</h3><div id="gFact"></div></div>
          <div class="card"><h3 style="margin-top:0">Básica</h3><div id="gBas"></div></div>
          <div class="card"><h3 style="margin-top:0">Básica factible</h3><div id="gBF"></div></div>
          <div class="card"><h3 style="margin-top:0">Óptima</h3><div id="gOpt"></div></div>
        </div>

        <h2>Casos particulares — cómo se ven y cómo se detectan</h2>
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-top:0">🔁 Óptimo múltiple</h3>
            <div id="caseMult"></div>
            <p style="font-size:.85rem;margin-top:.5rem"><b>En la tabla:</b> una variable <b>no básica</b> queda con $z_j-c_j = 0$.</p>
          </div>
          <div class="card">
            <h3 style="margin-top:0">♾️ No acotado</h3>
            <div id="caseUnb"></div>
            <p style="font-size:.85rem;margin-top:.5rem"><b>En la tabla:</b> la columna que entra <b>no tiene</b> ningún $a_{ij}>0$ (no se puede el cociente).</p>
          </div>
          <div class="card">
            <h3 style="margin-top:0">🚫 No factible</h3>
            <div id="caseInf"></div>
            <p style="font-size:.85rem;margin-top:.5rem"><b>En la tabla:</b> queda una variable <b>artificial</b> en la base con valor positivo.</p>
          </div>
          <div class="card">
            <h3 style="margin-top:0">⚖️ Degeneración</h3>
            <div id="caseDeg"></div>
            <p style="font-size:.85rem;margin-top:.5rem"><b>En la tabla:</b> <b>empate</b> en el mínimo cociente y una básica vale <b>0</b>. El método igual avanza.</p>
          </div>
        </div>

        <h2>🧪 Probá tu propio problema</h2>
        <div class="callout info"><p>Editá funcional, coeficientes, signos y RHS: el polígono y la interpretación se
        recalculan solos. Probá poner el sentido en <b>min</b>, o crear un caso no factible (ej. una "≤ 1" y una "≥ 3").</p></div>
        <div id="solver"></div>
      `;

      IO.graphicalWalkthrough(el.querySelector("#walk"), {
        sense: "max", c: [4, 3], vars: ["x_1", "x_2"],
        title: "Taller metalúrgico", subtitle: "$\\max Z = 4x_1 + 3x_2$",
        constraints: [
          { a: [6, 16], op: "<=", b: 48000, name: "EST" },
          { a: [12, 6], op: "<=", b: 42000, name: "SOL" },
          { a: [9, 9], op: "<=", b: 36000, name: "PIN" },
        ],
      });

      IO.specialCase(el.querySelector("#gFact"), "factible");
      IO.specialCase(el.querySelector("#gBas"), "basica");
      IO.specialCase(el.querySelector("#gBF"), "basica-factible");
      IO.specialCase(el.querySelector("#gOpt"), "optima");

      IO.specialCase(el.querySelector("#caseMult"), "multiple");
      IO.specialCase(el.querySelector("#caseUnb"), "unbounded");
      IO.specialCase(el.querySelector("#caseInf"), "infeasible");
      IO.specialCase(el.querySelector("#caseDeg"), "degenerada");

      IO.graphicalSolver(el.querySelector("#solver"), {
        sense: "max", c: [50, 40], vars: ["x_1", "x_2"], editable: true,
        title: "Solucionador gráfico editable",
        subtitle: "Cambiá los números y mirá cómo responde.",
        constraints: [
          { a: [2, 1], op: "<=", b: 100, name: "Recurso 1" },
          { a: [1, 3], op: "<=", b: 90, name: "Recurso 2" },
        ],
      });

      el.querySelectorAll("[data-go]").forEach((c) => c.addEventListener("click", () => IO.go(c.dataset.go)));
      IO.renderMath(el);
    },
  });
})();
