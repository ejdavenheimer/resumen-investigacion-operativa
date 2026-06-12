(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u4-dualidad",
    group: "Dualidad y Sensibilidad",
    title: "U4 · Dualidad",
    tag: "U4",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 4 · Programación Lineal 3</div>
          <h1>Teoría de la dualidad</h1>
          <p class="lead">Todo problema de PL (el <b>primal</b>) tiene un problema espejo (el <b>dual</b>).
          Resolver uno resuelve el otro, y el dual le pone <b>precio</b> a cada recurso.</p>
        </div>

        <h2>La intuición</h2>
        <div class="callout key">
          <p>Si el primal pregunta <i>"¿cuánto produzco para maximizar ganancia?"</i>, el dual pregunta
          <i>"¿cuánto vale cada recurso?"</i>. Las variables duales $y_i$ son los <b>precios sombra</b>
          (valores marginales) de las restricciones del primal.</p>
        </div>

        <h2>Cómo construir el dual (receta)</h2>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>PRIMAL (máx)</th><th>DUAL (mín)</th></tr></thead>
          <tbody>
            <tr><td>Maximizar</td><td>Minimizar</td></tr>
            <tr><td>$m$ restricciones (≤)</td><td>$m$ variables $y_i \\ge 0$</td></tr>
            <tr><td>$n$ variables $x_j \\ge 0$</td><td>$n$ restricciones (≥)</td></tr>
            <tr><td>RHS $b_i$ del primal</td><td>coeficientes del objetivo dual</td></tr>
            <tr><td>coef. del objetivo $c_j$</td><td>RHS de las restricciones duales</td></tr>
            <tr><td>matriz $A$</td><td>matriz traspuesta $A^{T}$</td></tr>
          </tbody>
        </table></div>

        <h2>Ejemplo (Ejercicio 1 del parcial, con el producto Black)</h2>
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-top:0">Primal — directo</h3>
            <div class="mathblock">$$\\begin{aligned}
            \\max\\; Z = &\\;4{,}5x_1 + 6x_2 + 10x_6 \\\\
            \\text{MP A)}\\;& 2x_1 + 6x_2 \\le 240 \\\\
            \\text{MP B)}\\;& 4x_1 + 2x_2 + 4x_6 \\le 200 \\\\
            \\text{HH)}\\;& 9x_1 + 12x_2 + 9x_6 \\le 540 \\\\
            & x_j \\ge 0
            \\end{aligned}$$</div>
          </div>
          <div class="card">
            <h3 style="margin-top:0">Dual</h3>
            <div class="mathblock">$$\\begin{aligned}
            \\min\\; G = &\\;240y_1 + 200y_2 + 540y_3 \\\\
            \\text{N)}\\;& 2y_1 + 4y_2 + 9y_3 \\ge 4{,}5 \\\\
            \\text{P)}\\;& 6y_1 + 2y_2 + 12y_3 \\ge 6 \\\\
            \\text{B)}\\;& 4y_2 + 9y_3 \\ge 10 \\\\
            & y_i \\ge 0
            \\end{aligned}$$</div>
          </div>
        </div>
        <p style="font-size:.9rem;color:var(--ink-soft)">Cada restricción dual corresponde a un producto del primal;
        cada variable dual $y_i$, a un recurso (MP A, MP B, HH).</p>

        <h2>Las propiedades que más se usan</h2>
        <ol class="steps">
          <li><span class="step-title">Dualidad débil</span>
          Cualquier factible del primal (máx) $\\le$ cualquier factible del dual (mín). El óptimo está "encajonado" entre ambos.</li>
          <li><span class="step-title">Dualidad fuerte</span>
          En el óptimo, <b>los dos valores coinciden</b>: $Z^{*}_{\\text{primal}} = G^{*}_{\\text{dual}}$.</li>
          <li><span class="step-title">Holguras complementarias</span>
            <ul>
              <li>Si una restricción del primal <b>no está saturada</b> (le sobra recurso) ⟹ su $y_i = 0$.</li>
              <li>Si $y_i > 0$ ⟹ esa restricción está <b>saturada</b> (recurso totalmente usado).</li>
              <li>Análogo entre variables del primal y restricciones del dual.</li>
            </ul>
          </li>
        </ol>

        <div class="callout info">
          <div class="callout-title">📈 Dónde leés el dual en la tabla óptima del Simplex</div>
          <p>Los valores óptimos de las variables duales $y_i$ son exactamente los <b>$z_j - c_j$ de las columnas
          de las variables de holgura</b> del primal. ¡No hace falta resolver el dual aparte!</p>
        </div>

        <h2>¿Para qué sirve resolver el dual?</h2>
        <ul>
          <li>Obtener los <b>valores marginales</b> (precios sombra) de los recursos.</li>
          <li>Validar análisis de sensibilidad (cambios de RHS o de funcional) de forma alternativa.</li>
          <li>A veces el dual tiene menos restricciones ⟹ se resuelve más rápido que el primal.</li>
        </ul>

        <div class="callout tip">
          <div class="callout-title">➡️ Seguí con</div>
          <p><a class="inline" data-go="u4-sensibilidad" style="cursor:pointer"><b>Análisis de sensibilidad</b></a>:
          valores marginales, rangos y compra/venta de recursos — el corazón del parcial.</p>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) =>
        c.addEventListener("click", () => IO.go(c.dataset.go))
      );
      IO.renderMath(el);
    },
  });
})();
