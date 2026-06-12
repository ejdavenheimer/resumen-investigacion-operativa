(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u3-simplex",
    group: "Programación Lineal",
    title: "U3 · Método Simplex",
    tag: "U3",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 3 · Programación Lineal 2</div>
          <h1>Método Simplex</h1>
          <p class="lead">Cuando hay más de 2 variables ya no podemos dibujar. El Simplex recorre los
          <b>vértices</b> del polígono saltando siempre al que mejora $Z$, hasta llegar al óptimo.</p>
        </div>

        <h2>La idea en una frase</h2>
        <div class="callout key">
          <p>Empezás en el origen (todas las slacks en la base) y, en cada iteración, <b>metés a la base</b> la
          variable que más mejora $Z$ y <b>sacás</b> la que primero se hace cero. Repetís hasta que ninguna mejora.</p>
        </div>

        <h2>Los 3 criterios</h2>
        <ol class="steps">
          <li><span class="step-title">Criterio de comienzo</span>
          Forma estándar con slacks. La base inicial son las variables de holgura (solución $=$ origen, $Z=0$).</li>
          <li><span class="step-title">Criterio de iteración</span>
            <ul>
              <li><b>¿Quién entra?</b> La columna con el $z_j - c_j$ <b>más negativo</b> (la que más sube $Z$). En la tabla inicial $z_j-c_j = -c_j$.</li>
              <li><b>¿Quién sale?</b> Regla del <b>mínimo cociente</b>: $\\min_i \\{ B_i / a_{ij} : a_{ij}>0 \\}$. La fila ganadora es la <b>fila pivote</b>.</li>
              <li><b>Pivoteo</b> (Gauss-Jordan): fila pivote $\\div$ pivote; al resto le restás su múltiplo para dejar la columna entrante como vector unitario.</li>
            </ul>
          </li>
          <li><span class="step-title">Criterio de terminación</span>
          Cuando <b>todos</b> los $z_j - c_j \\ge 0$ (en MAX), no hay forma de mejorar: la tabla es <b>óptima</b>.</li>
        </ol>

        <div class="callout info">
          <div class="callout-title">🔑 Cómo leer la tabla (notación UTN.BA)</div>
          <ul style="margin:.3rem 0">
            <li><b>$c_j$</b> (fila de arriba): coeficiente de cada variable en el funcional.</li>
            <li><b>$c_k$ / base / $B$</b>: costo de la variable básica, qué variable es, y su valor (RHS).</li>
            <li><b>$A_1, A_2, \\dots$</b>: columnas de coeficientes (en forma canónica respecto de la base actual).</li>
            <li><b>Fila $Z$</b>: los $z_j - c_j$. El valor de $Z$ aparece a la izquierda. Las columnas de las slacks dan los <b>valores marginales</b>.</li>
          </ul>
        </div>

        <h2>Simplex paso a paso — taller metalúrgico</h2>
        <p>El mismo caso que resolvimos gráficamente, ahora con el algoritmo. <b>Cada iteración es una tabla nueva.</b>
        Avanzá con los botones y abrí los desplegables:</p>
        <ul>
          <li>🔎 <b>"¿De dónde sale cada número?"</b> en la tabla inicial (cómo se arma desde la forma estándar).</li>
          <li>🧮 <b>"¿Cómo se calculó esta tabla?"</b> en cada iteración (el pivoteo, fila por fila).</li>
        </ul>
        <div id="simplexHost"></div>

        <div class="callout tip">
          <div class="callout-title">✔ Verificación</div>
          <p>El Simplex llega exactamente a lo mismo que el método gráfico: $x_1=3000$, $x_2=1000$, $Z=15000$.
          ¡Por eso conviene resolver casos chicos de las dos formas para chequear!</p>
        </div>

        <h2>Otro ejemplo — Industrias S.A. (Ejercicio 1 del parcial)</h2>
        <p>Dos productos, Normal y Premium. Mirá cómo se arma la tabla inicial y se llega a la óptima:</p>
        <div id="simplexParcial"></div>
        <div class="callout info">
          <p>Este es el modelo del <a class="inline" data-go="parcial-1" style="cursor:pointer"><b>Ejercicio 1 del parcial</b></a>,
          donde después se le aplica dualidad y sensibilidad. La tabla óptima da $Z=270$ (luego sube a $512$ al sumar un producto nuevo).</p>
        </div>

        <h2>Casos particulares del Simplex</h2>
        <div class="grid-2">
          <div class="card"><h3 style="margin-top:0">Empate en el mínimo cociente</h3><p>Anuncia <b>degeneración</b>: alguna variable básica valdrá 0. El método sigue funcionando.</p></div>
          <div class="card"><h3 style="margin-top:0">Óptimo múltiple</h3><p>En la tabla óptima, una variable <b>no básica</b> tiene $z_j-c_j = 0$: hay otra solución igual de buena.</p></div>
          <div class="card"><h3 style="margin-top:0">No acotado</h3><p>La columna entrante no tiene ningún $a_{ij}>0$: no se puede hacer el cociente → $Z\\to\\infty$.</p></div>
          <div class="card"><h3 style="margin-top:0">Restricciones "≥" o "="</h3><p>Necesitan variables <b>artificiales</b> (Gran M o dos fases) para tener base inicial.</p></div>
        </div>
      `;

      // Taller metalúrgico
      IO.simplexStepper(el.querySelector("#simplexHost"), {
        title: "Taller metalúrgico — $\\max Z = 4x_1 + 3x_2$",
        subtitle: "Restricciones de Estampado, Soldado y Pintado (todas ≤). Slacks $x_3,x_4,x_5$.",
        c: [4, 3], vars: ["x_1", "x_2"],
        constraints: [
          { a: [6, 16], b: 48000, name: "EST" },
          { a: [12, 6], b: 42000, name: "SOL" },
          { a: [9, 9], b: 36000, name: "PIN" },
        ],
      });

      // Ejercicio 1 parcial: max Z = 4.5 x1 + 6 x2; 2x1+6x2<=240; 4x1+2x2<=200; 9x1+12x2<=540
      IO.simplexStepper(el.querySelector("#simplexParcial"), {
        title: "Industrias S.A. — $\\max Z = 4{,}5\\,x_1 + 6\\,x_2$",
        subtitle: "MP A, MP B y HH. Tabla óptima $Z=270$.",
        c: [4.5, 6], vars: ["x_1", "x_2"],
        constraints: [
          { a: [2, 6], b: 240, name: "MP A" },
          { a: [4, 2], b: 200, name: "MP B" },
          { a: [9, 12], b: 540, name: "HH" },
        ],
      });

      el.querySelectorAll("[data-go]").forEach((c) =>
        c.addEventListener("click", () => IO.go(c.dataset.go))
      );
      IO.renderMath(el);
    },
  });
})();
