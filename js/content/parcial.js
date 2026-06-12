(function () {
  "use strict";
  const IO = window.IO;

  /* Helper: arma una tabla simplex estática (notación UTN) desde datos.
     cols: array de etiquetas de columna (ej. ['A_1','A_2',...])
     cj: array de coeficientes cj
     rows: [{ck, xk, B, a:[...]}]
     z: {val, row:[...]}
     opts: {highlight:[{r,c}], note} */
  function tableau(cols, cj, rows, z, opts) {
    opts = opts || {};
    let h = '<div class="table-wrap"><table class="simplex"><thead>';
    h += '<tr class="cj-row"><th colspan="3">$c_j \\rightarrow$</th>';
    cj.forEach((c) => (h += "<td>" + c + "</td>"));
    h += "</tr><tr><th>$c_k$</th><th>base</th><th>$B$</th>";
    cols.forEach((c) => (h += "<th>$" + c + "$</th>"));
    h += "</tr></thead><tbody>";
    rows.forEach((r) => {
      h += "<tr><td class='row-head'>" + r.ck + "</td><td class='row-head'>$" + r.xk +
        "$</td><td>" + r.B + "</td>";
      r.a.forEach((v) => (h += "<td>" + v + "</td>"));
      h += "</tr>";
    });
    h += '<tr class="z-row"><td></td><td class="row-head">$Z=' + z.val + "$</td><td></td>";
    z.row.forEach((v) => (h += "<td>" + v + "</td>"));
    h += "</tr></tbody></table></div>";
    if (opts.note) h += '<div style="font-size:.85rem;color:var(--ink-soft);margin-top:.3rem">' + opts.note + "</div>";
    return h;
  }

  function punto(titulo, contenido, abierto) {
    return '<details class="qa"' + (abierto ? " open" : "") + '><summary>' + titulo +
      "</summary><div>" + contenido + "</div></details>";
  }

  /* ================= EJERCICIO 1 ================= */
  IO.register({
    id: "parcial-1",
    group: "Práctica · Parcial",
    title: "Parcial · Ejercicio 1",
    tag: "📝",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Práctica para Parcial</div>
          <h1>Ejercicio 1 — Industrias S.A.</h1>
          <p class="lead">Simplex + dualidad + análisis de sensibilidad sobre un mismo problema.
          El esquema mental: <b>formular → tabla óptima → leer/interpretar</b>.</p>
        </div>

        <div class="callout key">
          <div class="callout-title">📋 Enunciado</div>
          <p>Se producen dos productos: <b>Normal</b> y <b>Premium</b>. Utilidad: \\$4,5 (Normal) y \\$6 (Premium).</p>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Recurso</th><th>Normal</th><th>Premium</th><th>Disponible</th></tr></thead>
            <tbody>
              <tr><td>Materia prima A</td><td>2</td><td>6</td><td>240</td></tr>
              <tr><td>Materia prima B</td><td>4</td><td>2</td><td>200</td></tr>
              <tr><td>Horas Hombre (HH)</td><td>9</td><td>12</td><td>540</td></tr>
              <tr><td>Utilidad ($/u)</td><td>4,5</td><td>6</td><td></td></tr>
            </tbody>
          </table></div>
        </div>

        ${punto("Punto 1 — Armar el modelo y las tablas inicial y óptima", `
          <p><b>Variables:</b> $x_1$ = cant. de Normal, $x_2$ = cant. de Premium. Slacks: $x_3$ (sobra MP A),
          $x_4$ (sobra MP B), $x_5$ (sobra HH).</p>
          <div class="grid-2">
            <div class="card"><h4 style="margin-top:0">Forma natural</h4>
            <div class="mathblock">$$\\begin{aligned}
            \\max\\;& 4{,}5x_1 + 6x_2 \\\\
            & 2x_1 + 6x_2 \\le 240 \\\\
            & 4x_1 + 2x_2 \\le 200 \\\\
            & 9x_1 + 12x_2 \\le 540
            \\end{aligned}$$</div></div>
            <div class="card"><h4 style="margin-top:0">Forma estándar</h4>
            <div class="mathblock">$$\\begin{aligned}
            & 2x_1 + 6x_2 + x_3 = 240 \\\\
            & 4x_1 + 2x_2 + x_4 = 200 \\\\
            & 9x_1 + 12x_2 + x_5 = 540
            \\end{aligned}$$</div></div>
          </div>
          <h4>Tabla inicial</h4>
          ${tableau(["A_1","A_2","A_3","A_4","A_5"], ["4,5","6","0","0","0"], [
            {ck:"0", xk:"x_3", B:"240", a:["2","6","1","0","0"]},
            {ck:"0", xk:"x_4", B:"200", a:["4","2","0","1","0"]},
            {ck:"0", xk:"x_5", B:"540", a:["9","12","0","0","1"]},
          ], {val:"0", row:["-4,5","-6","0","0","0"]})}
          <h4>Tabla óptima</h4>
          ${tableau(["A_1","A_2","A_3","A_4","A_5"], ["4,5","6","0","0","0"], [
            {ck:"6", xk:"x_2", B:"36", a:["0","1","0,3","0","-1/15"]},
            {ck:"0", xk:"x_4", B:"80", a:["0","0","1","1","-2/3"]},
            {ck:"4,5", xk:"x_1", B:"12", a:["1","0","-0,4","0","1/5"]},
          ], {val:"270", row:["0","0","0","0","0,5"]})}
          <div class="callout tip"><b>Conclusión:</b> se producen $x_1=12$ Normal y $x_2=36$ Premium, con $Z=270$.
          Sobra MP B ($x_4=80$ en la base) ⟹ su valor marginal es 0. MP A y HH están saturadas; el valor marginal
          de HH (columna $A_5$) es <b>0,5</b>.</div>
        `, true)}

        ${punto("Punto 2 — Agregar el producto Black (¿conviene? ¿beneficio extra?)", `
          <p>El producto <b>Black</b> ($x_6$) da \\$10 de utilidad y usa 4 de MP B y 9 HH (0 de MP A).</p>
          <p><b>Test de conveniencia con los valores marginales:</b> conviene si $z_6 < c_6$, donde
          $z_6 = \\sum y_i a_{i6}$.</p>
          <div class="mathblock">$$z_6 = y_1\\cdot 0 + y_2\\cdot 4 + y_3\\cdot 9 = 0\\cdot 0 + 0\\cdot 4 + 0{,}5\\cdot 9 = 4{,}5$$</div>
          <p>Como $4{,}5 < 10$ ⟹ <b>conviene producir Black</b> y cambia la solución óptima. Lo metemos a la base
          (generación de columna con $B^{-1}$) y reoptimizamos. Tabla óptima final:</p>
          ${tableau(["A_1","A_2","A_3","A_4","A_5","A_6"], ["4,5","6","0","0","0","10"], [
            {ck:"6", xk:"x_2", B:"12", a:["0","1","0","-0,3","2/15","0"]},
            {ck:"0", xk:"x_4", B:"168", a:["2","0","1","1,8","-0,8","0"]},
            {ck:"10", xk:"x_6", B:"44", a:["1","0","0","0,4","-1/15","1"]},
          ], {val:"512", row:["5,5","0","0","2,2","2/15","0"]})}
          <div class="callout tip"><b>Beneficio extra</b> de fabricar Black: $512 - 270 = \\mathbf{\\$242}$.</div>
        `)}

        ${punto("Punto 3a — Entre +1 HH, +1 MP A o +1 MP B, ¿qué elijo?", `
          <p>Comparo los <b>valores marginales</b> en la tabla óptima final (fila $Z$, columnas de las slacks):</p>
          <ul>
            <li>MP A (col $A_3$): <b>0</b></li>
            <li>MP B (col $A_4$): <b>2,2</b> ← el más alto</li>
            <li>HH (col $A_5$): <b>2/15 = 0,133</b></li>
          </ul>
          <p><b>Elijo MP B</b>: una unidad adicional hace subir el funcional en \\$2,2 (más que las otras).</p>
        `)}

        ${punto("Punto 3b — ¿Hasta cuánto pago por 60 HH más?", `
          <p>El valor marginal de HH es $2/15 = \\$0{,}133$/HH, válido dentro de su rango. Por 60 HH:</p>
          <div class="mathblock">$$60\\ \\text{HH} \\times 0{,}133\\ \\$/\\text{HH} = \\$8$$</div>
          <p><b>Validación por el dual:</b> al subir el RHS de HH de 540 a 600, todos los $z_j - c_j$ siguen $\\ge 0$
          (no cambia la base) y el funcional sube \\$8. Consistente.</p>
        `)}

        ${punto("Punto 3c — ¿A cuánto vendo 100 HH? (ojo con el rango)", `
          <p>Naive: $100 \\times 0{,}133 = \\$13{,}33$. <b>Pero</b> el valor marginal $2/15$ solo vale mientras
          $450 \\le \\text{HH} \\le 540$. Al vender 100 (de 540 a 440) <b>cruzo de tramo</b>:</p>
          <ul>
            <li>De 540 a 450 (90 HH) → marginal $2/15 = 0{,}133$: aporta $90 \\times 0{,}133 \\approx \\$12$.</li>
            <li>De 450 a 440 (10 HH) → marginal $10/9 = 1{,}11$: aporta $10 \\times 1{,}11 \\approx \\$11{,}1$.</li>
          </ul>
          <div class="mathblock">$$\\text{Total} \\approx 12 + 11{,}1 = \\mathbf{\\$23{,}11}$$</div>
          <p>Por eso <b>vendería las 100 HH a más de \\$23,11</b>, no a \\$13,33. Validado por el dual cambiando el
          funcional ($512 - 488{,}89 = 23{,}11$). Moraleja: <b>el valor marginal solo vale dentro de su rango</b>.</p>
        `)}

        ${punto("Punto 3d — ¿A qué valor vendería las 540 HH (todas)?", `
          <p>Si vendo <b>todas</b> las HH me quedo en 0 y no puedo producir nada ⟹ $Z = 0$. Por lo tanto, vendería
          las 540 HH por <b>\\$512</b>, que es el beneficio total que pierdo (incluyendo el producto Black).</p>
        `)}

        <div class="callout info">
          <div class="callout-title">🧠 Lo que entrena este ejercicio</div>
          <p>Leer la tabla óptima, usar valores marginales para decidir, agregar un producto nuevo, y entender que
          los precios sombra <b>valen por tramos</b> (rangos de RHS). Repasalo junto a
          <a class="inline" data-go="u4-sensibilidad" style="cursor:pointer">U4 · Sensibilidad</a>.</p>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) => c.addEventListener("click", () => IO.go(c.dataset.go)));
      IO.renderMath(el);
    },
  });

  /* ================= EJERCICIO 2 ================= */
  IO.register({
    id: "parcial-2",
    group: "Práctica · Parcial",
    title: "Parcial · Ejercicio 2",
    tag: "📝",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Práctica para Parcial</div>
          <h1>Ejercicio 2 — Tres productos (A, B, C)</h1>
          <p class="lead">Acá te <b>dan</b> la tabla óptima y tenés que responder preguntas de sensibilidad
          justificando. Todo se lee de esa tabla.</p>
        </div>

        <div class="callout key">
          <div class="callout-title">📋 Enunciado</div>
          <p>Tres productos continuos. <b>Respetar el orden de las restricciones.</b> $\\max Z = 4x_1 + x_2 + 3x_3$.</p>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Restricción</th><th>A</th><th>B</th><th>C</th><th>Signo</th><th>RHS</th></tr></thead>
            <tbody>
              <tr><td>Demanda mínima (u)</td><td>1</td><td>1</td><td>1</td><td>≥</td><td>350</td></tr>
              <tr><td>Mano de Obra (HH)</td><td>5</td><td>2</td><td>1</td><td>≤</td><td>950</td></tr>
              <tr><td>Materia prima (kg)</td><td>4</td><td>6</td><td>2</td><td>≤</td><td>850</td></tr>
              <tr><td>Beneficio ($/u)</td><td>4</td><td>1</td><td>3</td><td></td><td></td></tr>
            </tbody>
          </table></div>
          <p style="font-size:.9rem;color:var(--ink-soft)">$x_1,x_2,x_3$ = productos A,B,C. $x_4,x_5,x_6$ = variables de
          holgura/superflua de cada restricción (en orden).</p>
        </div>

        <h3>Tabla óptima (dada)</h3>
        ${tableau(["A_1","A_2","A_3","A_4","A_5","A_6"], ["4","1","3","0","0","0"], [
          {ck:"0", xk:"x_5", B:"525", a:["3","-1","0","0","1","-1/2"]},
          {ck:"0", xk:"x_4", B:"75", a:["1","2","0","1","0","1/2"]},
          {ck:"3", xk:"x_3", B:"425", a:["2","3","1","0","0","1/2"]},
        ], {val:"1.275", row:["2","8","0","0","0","3/2"]})}
        <p style="font-size:.9rem;color:var(--ink-soft)">Solución: se producen <b>425 unidades de C</b> ($x_3$), nada de A ni B.
        Sobran HH y MP; la demanda mínima (350) se cumple holgadamente. Valor marginal de la MP (col $A_6$) $= 3/2$.</p>

        ${punto("Punto 1 — Beneficio mínimo para que convenga producir A", `
          <p>$x_1$ (A) <b>no está en la base</b>. Su beneficio actual es \\$4 y su costo de oportunidad es
          $z_1 - c_1 = 2$ (col $A_1$ en la fila $Z$).</p>
          <div class="mathblock">$$c_1^{\\min} = 4 + 2 = \\mathbf{\\$6}$$</div>
          <p>Recién con beneficio \\$6 o más, su $z_1 - c_1$ llega a 0 y conviene incorporarlo.</p>
        `, true)}

        ${punto("Punto 2 — ¿Cómo varía el sobrante de MO si la MP fuera 849 kg?", `
          <p>El sobrante de MO es $x_5 = 525$. La MP baja de 850 a 849 ($\\Delta b = -1$). Miro el coeficiente de la
          columna de la slack de MP ($A_6$) en la <b>fila de $x_5$</b>: vale $-1/2$.</p>
          <div class="mathblock">$$\\Delta x_5 = -\\Delta b \\cdot (\\text{coef}) = -(-1)\\cdot\\tfrac12 = +\\tfrac12 \\;\\Rightarrow\\; x_5 = 525{,}5$$</div>
          <p>El sobrante de mano de obra <b>sube a 525,5 HH</b>.</p>
        `)}

        ${punto("Punto 3 — ¿Cómo varía la producción de C si se fabrica 1 unidad de A?", `
          <p>$x_3$ (C) $= 425$. El coeficiente de la columna $A_1$ (producto A) en la fila de $x_3$ es <b>2</b>:
          meter 1 unidad de A desplaza 2 unidades de C.</p>
          <div class="mathblock">$$425 - 2 = \\mathbf{423 \\text{ unidades de C}}$$</div>
        `)}

        ${punto("Punto 4 — Rango del coeficiente $c_3$ de $x_3$ (básica)", `
          <p>$x_3$ está en la base con $c_3 = 3$. Calculo $c_3 - \\left|\\dfrac{z_j-c_j}{a_{3j}}\\right|$ para las
          columnas no básicas de la fila de $x_3$ ($a$: $A_1=2,\\ A_2=3,\\ A_6=1/2$; con $z_j-c_j$: $2,\\ 8,\\ 3/2$):</p>
          <ul>
            <li>$3 - |2/2| = 2$</li>
            <li>$3 - |8/3| = 1/3$</li>
            <li>$3 - |(3/2)/(1/2)| = 0$</li>
          </ul>
          <p>Límite superior: no hay coeficientes negativos ⟹ <b>$+\\infty$</b>. Límite inferior: el mayor de los
          de arriba ⟹ <b>2</b>.</p>
          <div class="mathblock">$$c_3 \\in [\\,2;\\ +\\infty\\,)$$</div>
        `)}

        ${punto("Punto 5 — Rango del coeficiente $c_2$ de $x_2$ (no básica)", `
          <p>$x_2$ (B) no está en la base, $c_2 = 1$. Mientras su $z_2 - c_2 = 8 \\ge 0$ sigue conviniendo dejarla afuera.</p>
          <ul>
            <li>Límite superior: $c_2 + (z_2 - c_2) = 1 + 8 = 9$.</li>
            <li>Límite inferior: $-\\infty$ (bajar su beneficio nunca la hace entrar).</li>
          </ul>
          <div class="mathblock">$$c_2 \\in (-\\infty;\\ 9\\,]$$</div>
        `)}

        ${punto("Punto 6 — Beneficio mínimo de un producto nuevo (3 HH, 4 kg, participa en demanda mínima)", `
          <p>Uso los valores marginales: $y_{\\text{dem}} = 0,\\ y_{\\text{MO}} = 0,\\ y_{\\text{MP}} = 3/2$.
          El nuevo producto usa 1 (demanda), 3 (HH) y 4 (MP):</p>
          <div class="mathblock">$$z_{\\text{nuevo}} = 0\\cdot 1 + 0\\cdot 3 + \\tfrac32\\cdot 4 = \\mathbf{6}$$</div>
          <p>Su beneficio debe ser <b>\\$6 o más</b> para que convenga producirlo.</p>
        `)}

        ${punto("Punto 7 — ¿Qué pasa con el funcional si la demanda mínima fuera 300?", `
          <p>Hoy se producen 425 unidades en total (todas C), que ya superan el mínimo de 350 ⟹ la restricción de
          demanda mínima <b>no está activa</b> (es no restrictiva). Relajarla de 350 a 300 <b>no cambia nada</b>:</p>
          <div class="mathblock">$$\\Delta Z = 0$$</div>
          <p>Coherente con que su valor marginal es 0.</p>
        `)}

        <div class="callout tip">
          <div class="callout-title">✅ Checklist para este tipo de pregunta</div>
          <ol style="margin:.3rem 0">
            <li>¿La variable está en la base o no? (cambia el método).</li>
            <li>Para recursos: leé el valor marginal en la columna del slack.</li>
            <li>Para "cuánto varía X": usá el coeficiente de la columna correspondiente en la fila de X.</li>
            <li>Siempre verificá si la restricción está <b>activa</b> antes de responder.</li>
          </ol>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) => c.addEventListener("click", () => IO.go(c.dataset.go)));
      IO.renderMath(el);
    },
  });
})();
