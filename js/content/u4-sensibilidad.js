(function () {
  "use strict";
  const IO = window.IO;
  IO.register({
    id: "u4-sensibilidad",
    group: "Dualidad y Sensibilidad",
    title: "U4 · Análisis de sensibilidad",
    tag: "U4",
    render(el) {
      el.innerHTML = `
        <div class="page-head">
          <div class="page-kicker">Unidad 4 · Programación Lineal 3</div>
          <h1>Análisis de sensibilidad</h1>
          <p class="lead">Una vez que tenés la tabla óptima, respondés <b>preguntas tipo parcial</b> sin volver a
          resolver: ¿cuánto vale un recurso? ¿hasta dónde puedo cambiar un dato sin que cambie la solución?</p>
        </div>

        <div class="callout key">
          <div class="callout-title">🧭 Mapa de preguntas (todo se lee en la tabla óptima)</div>
          <ul style="margin:.3rem 0">
            <li><b>Valor marginal / precio sombra</b> → columna de la slack en la fila $Z$.</li>
            <li><b>¿Conviene producir un producto que no está en la base?</b> → su $z_j - c_j$.</li>
            <li><b>Beneficio mínimo de un producto nuevo</b> → $\\sum y_i a_{ij}$.</li>
            <li><b>Rango del RHS</b> → hasta dónde se mantiene la base.</li>
            <li><b>Rango del coeficiente del funcional</b> → hasta dónde no cambia la solución óptima.</li>
          </ul>
        </div>

        <h2>1. Valor marginal (precio sombra) de un recurso</h2>
        <p>Es <b>cuánto mejora $Z$ por cada unidad extra del recurso</b>. Se lee en la fila $Z$, en la columna de
        la variable de holgura de esa restricción ($z_j - c_j$ del slack).</p>
        <div class="callout info">
          <p><b>Ejemplo (parcial):</b> el valor marginal de HH es $\\tfrac{2}{15} = 0{,}133$ \\$/HH. Entonces, por 60 HH
          más estarías dispuesto a pagar $60 \\times 0{,}133 = \\$8$. Si el recurso <b>no está saturado</b>, su valor marginal es <b>0</b>
          (no pagás nada por más).</p>
        </div>

        <h2>2. ¿Conviene producir un producto fuera de la base?</h2>
        <p>Si $x_j$ no está en la base, su $z_j - c_j$ es su <b>costo de oportunidad</b>. Para que convenga producirlo,
        su beneficio tendría que subir hasta hacer $z_j - c_j \\le 0$.</p>
        <div class="callout info">
          <p><b>Ejemplo (parcial):</b> el producto A tiene beneficio \\$4 y costo de oportunidad \\$2 ⟹ recién conviene
          producirlo si su beneficio fuera <b>\\$6 o más</b> ($4 + 2 = 6$).</p>
        </div>

        <h2>3. Beneficio mínimo de un producto nuevo</h2>
        <p>Un producto nuevo conviene producirse si $c_{\\text{nuevo}} > z_{\\text{nuevo}} = \\sum_i y_i\\,a_{i,\\text{nuevo}}$,
        usando los valores marginales $y_i$ (los precios sombra de cada recurso que consume).</p>
        <div class="callout info">
          <p><b>Ejemplo (parcial):</b> un producto que usa 3 HH y 4 kg de MP B, con $y_{MPA}=0,\\;y_{MPB}=0,\\;y_{HH}=\\tfrac32$:
          $z = 0\\cdot 1 + 0\\cdot 3 + \\tfrac32\\cdot 4 = 6$. ⟹ su beneficio debe ser <b>\\$6 o más</b> para que convenga.</p>
        </div>

        <h2>4. Rango del término independiente (RHS)</h2>
        <p>Es el intervalo en el que podés mover un $b_i$ <b>sin que cambie la base óptima</b> (el valor marginal sigue valiendo).
        Se obtiene exigiendo que la columna $B = B^{-1}\\,b$ siga $\\ge 0$.</p>
        <div class="callout warn">
          <p>Cuidado: el valor marginal es válido <b>solo dentro del rango</b>. Si te pasás del rango, cambia la base
          y el precio del recurso es otro. Por eso en el parcial, vender 100 HH no rinde lo mismo que vender 60: parte de
          esas 100 HH cae en otro tramo con distinto valor marginal.</p>
        </div>

        <h2>5. Rango del coeficiente del funcional $c_j$</h2>
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-top:0">Si $x_j$ está en la base</h3>
            <p>El rango se calcula con los cocientes $\\dfrac{z_j - c_j}{a_{ij}}$ de la fila de $x_j$ sobre las
            variables no básicas. Tomás el menor incremento y el menor decremento permitidos:</p>
            <p style="font-size:.9rem">$\\text{Lím}= c_j \\pm \\min\\left|\\dfrac{z_j-c_j}{a_{ij}}\\right|$ (según el signo).</p>
          </div>
          <div class="card">
            <h3 style="margin-top:0">Si $x_j$ NO está en la base</h3>
            <p>Mientras su $z_j - c_j \\ge 0$, sigue conviniendo dejarlo afuera. El límite superior es
            $c_j + (z_j - c_j)$; hacia abajo no hay límite.</p>
            <p style="font-size:.9rem"><b>Ej. parcial:</b> $c_2$ de $x_2$ (no básica): $[-\\infty;\\;9]$, con $1 + 8 = 9$.</p>
          </div>
        </div>

        <h2>Mini-glosario de respuestas tipo parcial</h2>
        <div id="qaSens"></div>

        <div class="callout tip">
          <div class="callout-title">➡️ Todo junto y aplicado</div>
          <p>Andá a <a class="inline" data-go="parcial-1" style="cursor:pointer"><b>Parcial · Ejercicio 1</b></a> y
          <a class="inline" data-go="parcial-2" style="cursor:pointer"><b>Ejercicio 2</b></a>: cada pregunta resuelta
          con su justificación, igual que te la van a tomar.</p>
        </div>
      `;

      const qas = [
        ["¿Hasta cuánto pago por más unidades de un recurso?", "Pagás como máximo su <b>valor marginal</b> por unidad, y solo mientras estés dentro del <b>rango del RHS</b>. Ej.: 60 HH × \\$0,133/HH = \\$8."],
        ["¿A cuánto vendo unidades de un recurso?", "Al menos a su valor marginal. Pero si vendés mucho podés cruzar a otro tramo (otro valor marginal) o incluso quedarte sin poder producir: ahí el cálculo se hace por tramos o con la tabla del dual."],
        ["Entre +1 de varios recursos, ¿cuál elijo?", "El de <b>mayor valor marginal</b>: es el que más sube $Z$. Ej. parcial: gana MP B con \\$2,2."],
        ["¿Cambia la solución si relajo una restricción no activa?", "No. Si la restricción <b>no está saturada</b> (le sobra), moverla no cambia ni la solución ni $Z$ (es no restrictiva)."],
        ["¿Cuánto varía una variable básica si cambio un RHS en 1?", "Mirás la columna del slack correspondiente en la fila de esa variable: ese coeficiente (× el cambio) te da la variación. Ej. parcial: bajar MP B de 850 a 849 sube el sobrante de MO en ½."],
      ];
      const host = el.querySelector("#qaSens");
      qas.forEach(([q, a]) => {
        const d = document.createElement("details");
        d.className = "qa";
        d.innerHTML = "<summary>" + q + "</summary><div>" + a + "</div>";
        host.appendChild(d);
      });

      el.querySelectorAll("[data-go]").forEach((c) =>
        c.addEventListener("click", () => IO.go(c.dataset.go))
      );
      IO.renderMath(el);
    },
  });
})();
