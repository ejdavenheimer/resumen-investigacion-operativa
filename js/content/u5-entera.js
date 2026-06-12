(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u5-entera",
    group: "Extensiones",
    title: "U5 · Programación Entera",
    tag: "U5",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 5</div>
          <h1>Programación Entera</h1>
          <p class="lead">Igual que PL, pero algunas (o todas) las variables deben ser <b>números enteros</b>.
          Útil cuando "1,7 camiones" no tiene sentido.</p>
        </div>

        <h2>¿Por qué no alcanza con redondear?</h2>
        <div class="callout warn">
          <p>Redondear la solución continua puede dar un resultado <b>no óptimo</b> o incluso <b>no factible</b>
          (que se sale de las restricciones). Por eso se usan métodos específicos.</p>
        </div>

        <h2>Tipos de variables enteras</h2>
        <div class="grid-2">
          <div class="card"><h3 style="margin-top:0">Enteras puras</h3><p>Todas las variables son enteras (ej. ¿cuántas personas contratar?).</p></div>
          <div class="card"><h3 style="margin-top:0">Mixtas</h3><p>Algunas continuas y otras enteras.</p></div>
          <div class="card"><h3 style="margin-top:0">Binarias (0/1)</h3><p>Decisiones sí/no: ¿abro la planta? ¿elijo la ruta?</p></div>
          <div class="card"><h3 style="margin-top:0">Combinatorias clásicas</h3><p>Mochila (knapsack), corte de bobinas, asignación, etc.</p></div>
        </div>

        <h2>Método Branch &amp; Bound (ramificación y acotamiento)</h2>
        <ol class="steps">
          <li><span class="step-title">Relajación continua</span>
          Resolvé el problema como PL normal (ignorando la condición de entero). Su valor es una <b>cota</b> del óptimo entero.</li>
          <li><span class="step-title">¿Ya es entera?</span>
          Si la solución relajada es entera, ¡listo! Es la óptima. Si no, elegí una variable fraccionaria, por ejemplo $x_j = 3{,}4$.</li>
          <li><span class="step-title">Ramificar</span>
          Generá dos ramas que excluyen el valor fraccionario:
          <div class="mathblock">$$\\text{Rama A: } x_j \\le 3 \\qquad \\text{Rama B: } x_j \\ge 4$$</div></li>
          <li><span class="step-title">Acotar (bound) y podar</span>
          Resolvé cada rama. Si una rama da peor que la mejor solución entera ya encontrada (la <b>incumbente</b>), se <b>poda</b> (no se sigue).</li>
          <li><span class="step-title">Repetir</span>
          Seguí ramificando la rama más prometedora hasta que todas estén resueltas o podadas. La mejor entera hallada es la óptima.</li>
        </ol>

        <div class="callout key">
          <div class="callout-title">🌳 Por qué funciona</div>
          <p>La relajación continua siempre da un valor <b>igual o mejor</b> que el entero (en MAX, una cota superior).
          Cada rama agrega una restricción que "empuja" la solución hacia valores enteros, sin perder ninguna solución entera válida.</p>
        </div>

        <h2>Ejemplo conceptual</h2>
        <div class="card">
          <p>Supongamos $\\max Z$ con relajación continua $x_1 = 3{,}4,\\; x_2 = 2$, $Z = 28{,}6$.</p>
          <ul>
            <li>$x_1$ es fraccionaria → ramifico: <b>Rama A</b> $x_1 \\le 3$, &nbsp;<b>Rama B</b> $x_1 \\ge 4$.</li>
            <li>Resuelvo cada rama como PL. Si la Rama A da $x_1=3,\\,x_2=3,\\,Z=27$ (entera) → candidata.</li>
            <li>Si la Rama B da $Z = 26{,}5 < 27$, se poda (no puede superar a la incumbente).</li>
            <li>Cuando ninguna rama abierta supera la incumbente, esa es la <b>óptima entera</b>: $Z=27$.</li>
          </ul>
        </div>

        <div class="callout info">
          <div class="callout-title">📦 Aplicación típica de la cátedra: corte de bobinas</div>
          <p>Se busca cortar bobinas en anchos pedidos <b>minimizando el desperdicio (scrap)</b>. Las variables
          $N_i$ = cantidad de veces que se usa cada patrón de corte, y deben ser <b>enteras y no negativas</b>.</p>
        </div>
      `;
      IO.renderMath(el);
    },
  });
})();
