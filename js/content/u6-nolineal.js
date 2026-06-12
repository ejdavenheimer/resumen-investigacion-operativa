(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u6-nolineal",
    group: "Extensiones",
    title: "U6 · Programación No Lineal",
    tag: "U6",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 6</div>
          <h1>Programación No Lineal</h1>
          <p class="lead">Cuando el objetivo o las restricciones <b>no son lineales</b> (aparecen $x^2$, productos
          $x_1 x_2$, logaritmos…). El Simplex ya no sirve; se usan otras herramientas.</p>
        </div>

        <div class="callout tip">
          <div class="callout-title">📌 Para el parcial</div>
          <p>Esta unidad se evalúa <b>solo de forma teórica</b> (no hay ejercicios para resolver). Enfocate en
          <b>entender los conceptos</b>: qué la diferencia de la PL, convexidad y los métodos de resolución.</p>
        </div>

        <h2>¿Cómo se ve un problema no lineal?</h2>
        <div class="mathblock">$$\\max\\;(\\text{o }\\min)\\; f(x) \\quad \\text{s.a.}\\quad g_i(x) \\le b_i$$</div>
        <p>donde $f$ o algún $g_i$ es no lineal. Muchos casos prácticos son <b>cuadráticos</b> (la función tiene términos al cuadrado).</p>

        <h2>Convexidad: la propiedad clave</h2>
        <div class="callout key">
          <p>En un problema <b>convexo</b> (minimizar función convexa / maximizar cóncava sobre región convexa),
          <b>todo óptimo local es global</b>. Eso lo hace "tratable". Si <b>no</b> es convexo, puede haber varios óptimos
          locales y encontrar el global es mucho más difícil.</p>
        </div>
        <div class="grid-2">
          <div class="card"><h3 style="margin-top:0">Convexo 😊</h3><p>Un solo "valle" (o "cima"). El óptimo local que encontrás es el global. Ej.: minimizar costos cuadráticos.</p></div>
          <div class="card"><h3 style="margin-top:0">No convexo 😟</h3><p>Varios valles/cimas. El método puede quedar atrapado en un óptimo local. Requiere técnicas globales.</p></div>
        </div>

        <h2>Cómo se resuelve</h2>
        <ol class="steps">
          <li><span class="step-title">Sin restricciones</span>
          Buscás dónde el <b>gradiente se anula</b>: $\\nabla f(x) = 0$. La matriz Hessiana indica si es máximo, mínimo o silla.</li>
          <li><span class="step-title">Con restricciones de igualdad</span>
          <b>Multiplicadores de Lagrange</b>: se arma $L = f - \\sum \\lambda_i\\,(g_i - b_i)$ y se resuelve $\\nabla L = 0$.</li>
          <li><span class="step-title">Con restricciones de desigualdad</span>
          <b>Condiciones de Karush-Kuhn-Tucker (KKT)</b>: generalizan Lagrange e incluyen las holguras complementarias.</li>
          <li><span class="step-title">Métodos numéricos</span>
          Cuando no hay solución cerrada: descenso del gradiente, búsqueda en intervalos de incertidumbre, Gauss-Jordan adaptado, etc.</li>
        </ol>

        <h2>Tipos de programación no lineal</h2>
        <div class="grid-2">
          <div class="card"><h3 style="margin-top:0">Cuadrática</h3><p>Objetivo con términos al cuadrado y restricciones lineales. Es el caso más común y mejor estudiado.</p></div>
          <div class="card"><h3 style="margin-top:0">Convexa</h3><p>Unifica ideas de PL y cuadrática; garantiza óptimo global. Ej.: optimización de horarios de vuelos.</p></div>
          <div class="card"><h3 style="margin-top:0">No convexa</h3><p>La más general y difícil; aparecen múltiples óptimos locales.</p></div>
          <div class="card"><h3 style="margin-top:0">Separable</h3><p>$f(x)=\\sum f_j(x_j)$: se aproxima por tramos lineales y se resuelve casi como PL.</p></div>
        </div>

        <div class="callout info">
          <div class="callout-title">🔗 Conexión con lo anterior</div>
          <p>Lagrange/KKT son la versión no lineal de la <b>dualidad</b>: los multiplicadores $\\lambda_i$ cumplen el rol
          de los precios sombra $y_i$ que viste en <a class="inline" data-go="u4-dualidad" style="cursor:pointer">U4</a>.</p>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) =>
        c.addEventListener("click", () => IO.go(c.dataset.go))
      );
      IO.renderMath(el);
    },
  });
})();
