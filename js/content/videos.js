(function () {
  "use strict";
  const IO = window.IO;

  const SECCIONES = [
    { cat: "Introducción y conceptos", vids: [
      ["Método de Ponderación de Factores", "https://www.youtube.com/watch?v=9UG3z03MBAg"],
      ["Programación Matemática", "https://www.youtube.com/watch?v=4LzFKQ6-9vI"],
    ]},
    { cat: "U2 · Programación Lineal y método gráfico", vids: [
      ["Programación Matemática — Método Gráfico", "https://www.youtube.com/watch?v=YpS0w-thsFg"],
      ["Uso del software LINDO (Programación Lineal)", "https://www.youtube.com/watch?v=Vk6AKyBxaoI"],
    ]},
    { cat: "U3 · Método Simplex", vids: [
      ["Método Simplex", "https://www.youtube.com/watch?v=p_sUGZkL5H8"],
      ["Simplex — Casos particulares: restricciones ≥ y =", "https://www.youtube.com/watch?v=t9GhCjMDq5E"],
      ["Simplex — Casos particulares", "https://www.youtube.com/watch?v=sdu74tDG-iY"],
      ["Interpretación de resultados", "https://www.youtube.com/watch?v=eRLnQL4R7J4"],
    ]},
    { cat: "U4 · Dualidad y sensibilidad", vids: [
      ["Planteo del Dual", "https://www.youtube.com/watch?v=YNT9huKb0q0"],
      ["Análisis de Sensibilidad — Parte 1", "https://www.youtube.com/watch?v=KAgsCvWJ6S0"],
      ["Análisis de Sensibilidad — Parte 2", "https://www.youtube.com/watch?v=9PcOZ-syQj0"],
      ["Análisis de Sensibilidad — Parte 3", "https://www.youtube.com/watch?v=48NAG-kPqx0"],
      ["Análisis Paramétrico", "https://www.youtube.com/watch?v=59OtrwI_RKo"],
    ]},
    { cat: "U5 · Programación Entera", vids: [
      ["Programación Entera (teoría)", "https://www.youtube.com/watch?v=zm9khlVH6r4"],
      ["Branch & Bound", "https://www.youtube.com/watch?v=QlbxVbfo4Qo"],
      ["Programación Entera (práctica)", "https://www.youtube.com/watch?v=Q2ELOUBV_9Q"],
      ["Programación Binaria — Parte 1", "https://www.youtube.com/watch?v=a4bUutHnnrQ"],
      ["Programación Binaria — Parte 2", "https://www.youtube.com/watch?v=zBRwCjX29ZQ"],
      ["Programación Binaria — Parte 3", "https://www.youtube.com/watch?v=Ev19oT34UwI"],
      ["Asignación", "https://www.youtube.com/watch?v=Zw0ASnXskfg"],
    ]},
  ];

  const PLAY = '<svg viewBox="0 0 24 24" class="vid-ico" aria-hidden="true"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>';

  IO.register({
    id: "videos",
    group: "Recursos",
    title: "Videos",
    tag: "▶",
    render(el) {
      let html = `
        <div class="page-head">
          <div class="page-kicker">Recursos · Videos explicativos</div>
          <h1>📺 Videos por tema</h1>
          <p class="lead">Clases en video que explican cada tema, ordenadas por unidad. Buen complemento para
          ver el desarrollo hablado y con ejemplos.</p>
        </div>
        <div class="callout info">
          <p>Son videos del canal de <b>Ricardo Carlevari</b> en YouTube (abren en una pestaña nueva).
          Si alguno deja de estar disponible, avisame y lo actualizo.</p>
        </div>
      `;

      SECCIONES.forEach((s) => {
        html += `<div class="card"><h3 style="margin-top:0">${s.cat}</h3><div class="vid-list">`;
        s.vids.forEach(([titulo, url]) => {
          html += `<a class="vid-row" href="${url}" target="_blank" rel="noopener">${PLAY}<span>${titulo}</span><span class="vid-ext">↗</span></a>`;
        });
        html += `</div></div>`;
      });

      el.innerHTML = html;
    },
  });
})();
