(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u1",
    group: "Fundamentos",
    title: "U1 · Introducción a la IO",
    tag: "U1",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 1</div>
          <h1>¿Qué es la Investigación Operativa?</h1>
          <p class="lead">La IO usa modelos matemáticos para tomar la <b>mejor decisión posible</b>
          frente a recursos limitados.</p>
        </div>

        <h2>Los modelos de decisión</h2>
        <p>Un <b>modelo de decisión</b> (u optimizante) formula una <b>función objetivo</b> a maximizar o minimizar.
        Resolverlo significa encontrar el valor de las <b>variables de decisión</b> que alcanza el mejor valor del objetivo.</p>

        <div class="grid-2">
          <div class="card">
            <h3 style="margin-top:0">No restringidos</h3>
            <p>Solo tienen objetivo, sin restricciones:</p>
            <p>$$\\min \\; 3x_1 + \\tfrac{2}{x_1} + \\ln x_2 + 4x_1 x_2$$</p>
          </div>
          <div class="card">
            <h3 style="margin-top:0">Restringidos (programas matemáticos)</h3>
            <p>Objetivo <b>más</b> una o más restricciones a satisfacer:</p>
            <p>$$\\max\\; Z=f(x) \\quad \\text{s.a.}\\quad g_i(x) \\le b_i$$</p>
          </div>
        </div>

        <h2>Las 3 preguntas que SIEMPRE te tenés que hacer</h2>
        <ol class="steps">
          <li><span class="step-title">¿Qué decido? → Variables</span>
          Las cantidades que están bajo tu control. Ej.: cuánto producir de cada producto.</li>
          <li><span class="step-title">¿Qué quiero lograr? → Función objetivo (funcional)</span>
          Maximizar ganancia, minimizar costo… Es una sola función a optimizar.</li>
          <li><span class="step-title">¿Qué me limita? → Restricciones</span>
          Recursos disponibles, demandas mínimas, capacidades. Más la <b>no negatividad</b> de las variables.</li>
        </ol>

        <div class="callout info">
          <div class="callout-title">📌 Vocabulario clave</div>
          <ul style="margin:.3rem 0">
            <li><b>Variables de decisión</b> $x_j$: lo que buscamos.</li>
            <li><b>Coeficientes del funcional</b> $c_j$: cuánto aporta cada variable al objetivo.</li>
            <li><b>Coeficientes tecnológicos</b> $a_{ij}$: cuánto recurso $i$ consume la variable $j$.</li>
            <li><b>RHS</b> $b_i$: el término independiente (recurso disponible o requerimiento).</li>
          </ul>
        </div>

        <h2>Etapas de un estudio de IO</h2>
        <ol class="steps">
          <li><span class="step-title">Definir el problema</span> Interrogantes, objetivo y restricciones reales.</li>
          <li><span class="step-title">Construir el modelo</span> Hipótesis simplificadoras + formulación matemática.</li>
          <li><span class="step-title">Resolver</span> Aplicar el método adecuado (gráfico, Simplex, etc.).</li>
          <li><span class="step-title">Validar e interpretar</span> ¿La solución tiene sentido? ¿Qué responde al problema real?</li>
        </ol>

        <div class="callout tip">
          <div class="callout-title">➡️ Siguiente</div>
          <p>En <a class="inline" data-go="u2-formulacion" style="cursor:pointer"><b>U2 · Formulación</b></a> vas a aprender a
          escribir el modelo en sus tres formas (natural, canónica y estándar) — el paso que más se evalúa.</p>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) =>
        c.addEventListener("click", () => IO.go(c.dataset.go))
      );
    },
  });
})();
