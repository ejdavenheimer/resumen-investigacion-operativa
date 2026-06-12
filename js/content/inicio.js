(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "inicio",
    group: "Inicio",
    title: "Bienvenida",
    tag: "★",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Investigación Operativa · UTN.BA</div>
          <h1>Aprendé IO paso a paso, de verdad</h1>
          <p class="lead">Cómo <b>formular</b> cada ejercicio, cómo <b>resolverlo</b> de principio a fin
          y cómo <b>interpretar</b> los resultados — con todo interactivo y basado en el material de tu cátedra.</p>
        </div>

        <div class="callout key">
          <div class="callout-title">🎯 La idea</div>
          <p>Todo problema de IO se ataca con la misma receta de 3 pasos. Esta web te entrena en cada uno:</p>
          <ol style="margin:.4rem 0">
            <li><b>Formular:</b> traducir el enunciado a variables, funcional y restricciones.</li>
            <li><b>Resolver:</b> método gráfico, Simplex, dualidad, branch &amp; bound…</li>
            <li><b>Interpretar:</b> responder lo que el ejercicio pide (valores marginales, rangos, qué conviene).</li>
          </ol>
        </div>

        <h2>Por dónde empezar</h2>
        <div class="grid-2">
          <div class="card" style="cursor:pointer" data-go="u2-grafico">
            <h3 style="margin-top:0">📐 Método gráfico interactivo</h3>
            <p>Mové la recta objetivo y mirá cómo aparece el vértice óptimo. Editá los números y resolvé tu propio problema.</p>
            <span class="pill indigo">U2 · ideal para arrancar</span>
          </div>
          <div class="card" style="cursor:pointer" data-go="u3-simplex">
            <h3 style="margin-top:0">🧮 Simplex paso a paso</h3>
            <p>Tablas iteración por iteración, con la variable que entra, la que sale y el pivote resaltados.</p>
            <span class="pill indigo">U3 · núcleo del parcial</span>
          </div>
          <div class="card" style="cursor:pointer" data-go="u4-sensibilidad">
            <h3 style="margin-top:0">🔬 Dualidad y sensibilidad</h3>
            <p>Valores marginales, precios sombra, rangos de los coeficientes, comprar/vender recursos.</p>
            <span class="pill amber">U4 · lo más pedido</span>
          </div>
          <div class="card" style="cursor:pointer" data-go="parcial-1">
            <h3 style="margin-top:0">📝 Parcial resuelto</h3>
            <p>Los ejercicios de la práctica para parcial, resueltos completos y explicados punto por punto.</p>
            <span class="pill green">¡Lo que te van a tomar!</span>
          </div>
        </div>

        <div class="callout tip">
          <div class="callout-title">💡 Cómo usar esta web</div>
          <p>Seguí el menú de la izquierda en orden, o saltá directo a lo que necesites. Los recuadros con
          botones son <b>interactivos</b>: cambiá los valores y la web recalcula sola. Las fórmulas están en notación de la cátedra.</p>
        </div>
      `;
      el.querySelectorAll("[data-go]").forEach((c) =>
        c.addEventListener("click", () => IO.go(c.dataset.go))
      );
    },
  });
})();
