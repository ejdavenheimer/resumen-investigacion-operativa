(function () {
  "use strict";
  const IO = window.IO;
  // colores para diffs dentro de fórmulas KaTeX
  const ADD = "\\textcolor{#16a34a}";   // verde: lo que se agrega
  const FLIP = "\\textcolor{#dc2626}";  // rojo: lo que se invierte
  const KEEP = "\\textcolor{#0284c7}";  // celeste: lo que se mantiene

  IO.register({
    id: "u2-formulacion",
    group: "Programación Lineal",
    title: "U2 · Formulación",
    tag: "U2",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 2 · Programación Lineal 1</div>
          <h1>Formular un modelo de PL</h1>
          <p class="lead">Un modelo es <b>lineal</b> cuando objetivo y restricciones son combinaciones lineales
          de las variables. Acá aprendés a escribirlo y a pasarlo entre sus tres formas, viendo <b>exactamente qué cambia</b>.</p>
        </div>

        <h2>Cómo formular en 4 movimientos</h2>
        <ol class="steps">
          <li><span class="step-title">Variables $x_j$</span> Definílas con <u>unidad y período</u> (ej. "piezas A por semana"). Esto evita la mitad de los errores.</li>
          <li><span class="step-title">Funcional $Z=\\sum c_j x_j$</span> ¿MAX (ganancia) o MIN (costo)? Cada $c_j$ es cuánto aporta una unidad de $x_j$.</li>
          <li><span class="step-title">Restricciones $\\sum a_{ij}x_j \\;\\{\\le,\\ge,=\\}\\; b_i$</span> Una por cada recurso o condición. Izquierda = consumo, derecha = disponible.</li>
          <li><span class="step-title">No negatividad</span> $x_j \\ge 0$ siempre (incluidas las holguras).</li>
        </ol>

        <h2>Las tres formas — y cómo se pasa de una a otra</h2>
        <p>El mismo problema se escribe de tres maneras. Partimos de este ejemplo en <b>forma natural</b>
        (restricciones mezcladas ≤, ≥, =):</p>
        <div class="mathblock">$$\\begin{aligned}
        \\max\\; Z =\\;& 6x_1 + 8x_2 + 3x_3 \\\\
        \\text{(1)}\\;& 12x_1 + 9x_2 + 4x_3 \\le 500 \\\\
        \\text{(2)}\\;& 3x_1 + 15x_2 + 6x_3 \\le 700 \\\\
        \\text{(3)}\\;& 2x_1 + 2x_2 + 3x_3 \\ge 100 \\\\
        \\text{(4)}\\;& 7x_1 + 4x_2 + 3x_3 = 200 \\\\
        & x_j \\ge 0
        \\end{aligned}$$</div>

        <h3>① Forma estándar (la que entra al Simplex): todo igualdades</h3>
        <p>Convertimos cada inecuación en <b>igualdad</b> agregando una variable de holgura. <b>Mirá el color verde</b>:
        es lo único que se agrega, y cada restricción recibe <b>su propia</b> variable.</p>

        <div class="callout key">
          <p style="margin:.2rem 0"><b>Regla de oro:</b></p>
          <ul style="margin:.2rem 0">
            <li>Restricción <b>"≤"</b> → se <b>suma</b> una holgura: ${m(KEEP+"{12x_1+9x_2+4x_3}")} ${m("\\le 500")} &nbsp;⟹&nbsp; ${m(KEEP+"{12x_1+9x_2+4x_3}")} ${m(ADD+"{\\;+\\;x_4}")} ${m("= 500")}</li>
            <li>Restricción <b>"≥"</b> → se <b>resta</b> una superflua: ${m(KEEP+"{2x_1+2x_2+3x_3}")} ${m("\\ge 100")} &nbsp;⟹&nbsp; ${m(KEEP+"{2x_1+2x_2+3x_3}")} ${m(ADD+"{\\;-\\;x_6}")} ${m("= 100")}</li>
            <li>Restricción <b>"="</b> → ya es igualdad, <b>no</b> agrega nada.</li>
          </ul>
        </div>

        <p>Aplicado a todo el sistema (cada slack va numerada y atada a su fila):</p>
        <div class="mathblock">$$\\begin{aligned}
        \\text{(1)}\\;& 12x_1 + 9x_2 + 4x_3 ${A("+\\,x_4")} = 500 \\\\
        \\text{(2)}\\;& 3x_1 + 15x_2 + 6x_3 ${A("+\\,x_5")} = 700 \\\\
        \\text{(3)}\\;& 2x_1 + 2x_2 + 3x_3 ${A("-\\,x_6")} = 100 \\\\
        \\text{(4)}\\;& 7x_1 + 4x_2 + 3x_3 \\;= 200
        \\end{aligned}$$</div>
        <ul style="margin:.4rem 0">
          <li><span class="hl hl-slack">x₄</span> = holgura de (1) — recurso que <b>sobra</b>.</li>
          <li><span class="hl hl-slack">x₅</span> = holgura de (2) — recurso que <b>sobra</b>.</li>
          <li><span class="hl hl-slack">x₆</span> = superflua de (3) — cuánto te <b>pasás</b> del mínimo.</li>
          <li>(4) ya era igualdad: <b>no</b> recibe variable. Todas las $x_j \\ge 0$.</li>
        </ul>

        <h3>② Forma canónica de MAX: todas las restricciones de "≤"</h3>
        <p>Acá <b>no</b> agregamos slacks; solo <b>damos vuelta</b> las que no son "≤". <b>En rojo</b>, lo que se invierte:</p>

        <div class="diff-grid">
          <div><b>"≥" se multiplica por −1</b><br>${m("2x_1+2x_2+3x_3 \\ge 100",true)}</div>
          <div class="arrow">→</div>
          <div>${m(FLIP+"{-2x_1-2x_2-3x_3 \\le -100}",true)}<br><span style="font-size:.82rem;color:var(--ink-soft)">cambian los signos <i>y</i> se da vuelta la desigualdad</span></div>
        </div>
        <div class="diff-grid">
          <div><b>"=" se parte en "≤" y "≥"</b><br>${m("7x_1+4x_2+3x_3 = 200",true)}</div>
          <div class="arrow">→</div>
          <div>${m("7x_1+4x_2+3x_3 \\le 200",true)}${m(FLIP+"{-7x_1-4x_2-3x_3 \\le -200}",true)}<br><span style="font-size:.82rem;color:var(--ink-soft)">$=$ equivale a "$\\le$ y $\\ge$"; la "$\\ge$" después se invierte</span></div>
        </div>

        <p>Sistema canónico completo (las filas en <span style="color:#dc2626;font-weight:600">rojo</span> son las que se transformaron):</p>
        <div class="mathblock">$$\\max\\; Z = 6x_1+8x_2+3x_3$$</div>
        <div class="mathblock">$$\\begin{aligned}
        \\text{s.a.}\\quad\\text{(1)}\\;& 12x_1+9x_2+4x_3 \\le 500 \\\\
        \\text{(2)}\\;& 3x_1+15x_2+6x_3 \\le 700 \\\\
        \\text{(3)}\\;& ${FLIP}{-2x_1-2x_2-3x_3 \\le -100} \\\\
        \\text{(4a)}\\;& 7x_1+4x_2+3x_3 \\le 200 \\\\
        \\text{(4b)}\\;& ${FLIP}{-7x_1-4x_2-3x_3 \\le -200} \\\\
        & x_j \\ge 0
        \\end{aligned}$$</div>
        <p style="font-size:.86rem;color:var(--ink-soft)">La fila <b>(3)</b> es la restricción que <b>era "≥"</b> (se multiplicó por −1).
        Las filas <b>(4a)</b> y <b>(4b)</b> salen de partir la <b>"="</b> en "≤" y "≥" (esta última, invertida).</p>
        <div class="callout info"><b>¿Para qué sirve?</b> La canónica es el formato "prolijo" para construir el <b>dual</b>
        (U4): MAX con todas "≤". La estándar es para <b>resolver</b> con Simplex.</div>

        <div class="callout warn">
          <div class="callout-title">⚠️ Errores típicos en el parcial</div>
          <ul style="margin:.3rem 0">
            <li>Sumar la holgura en una "≥" (va <b>restando</b>) o restarla en una "≤".</li>
            <li>Olvidar $\\ge 0$ de <b>todas</b> las variables, incluidas las slacks.</li>
            <li>No respetar el <b>orden</b> de las restricciones del enunciado (cambia qué columna es cada slack).</li>
            <li>Al invertir una "≥", cambiar los signos pero olvidar dar vuelta la desigualdad (o viceversa).</li>
          </ul>
        </div>

        <div class="callout tip">
          <div class="callout-title">➡️ Ahora resolvelo</div>
          <p>En <a class="inline" data-go="u2-grafico" style="cursor:pointer"><b>Método gráfico</b></a> hay un tutorial
          que dibuja la solución <b>paso a paso</b>, y en <a class="inline" data-go="ejercicios" style="cursor:pointer"><b>Ejercicios resueltos</b></a>
          tenés varios de la cátedra formulados y resueltos.</p>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) => c.addEventListener("click", () => IO.go(c.dataset.go)));
      IO.renderMath(el);
    },
  });

  // helpers para incrustar math inline en el template
  function m(tex, display) {
    const span = IO.m(tex, display);
    return span.outerHTML;
  }
  function A(tex) { return ADD + "{" + tex + "}"; }
})();
