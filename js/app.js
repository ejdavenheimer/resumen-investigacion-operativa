/* =====================================================================
   IO Interactiva — arranque, navegación y routing
   ===================================================================== */
(function () {
  "use strict";
  const IO = window.IO;
  const navEl = document.getElementById("nav");
  const contentEl = document.getElementById("content");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");
  const progress = document.getElementById("progressTop");

  /* ---------- Construir navegación ---------- */
  function buildNav() {
    navEl.innerHTML = "";
    IO.groups.forEach((group) => {
      const wrap = document.createElement("div");
      wrap.className = "nav-group";
      const title = document.createElement("div");
      title.className = "nav-group-title";
      title.textContent = group;
      wrap.appendChild(title);
      IO.sections
        .filter((s) => s.group === group)
        .forEach((s) => {
          const a = document.createElement("a");
          a.className = "nav-link";
          a.href = "#" + s.id;
          a.dataset.id = s.id;
          a.innerHTML =
            "<span>" + s.title + "</span>" +
            (s.tag ? '<span class="tag">' + s.tag + "</span>" : "");
          wrap.appendChild(a);
        });
      navEl.appendChild(wrap);
    });
  }

  /* ---------- Render de una sección ---------- */
  function renderSection(id) {
    const section =
      IO.sections.find((s) => s.id === id) || IO.sections[0];
    if (!section) return;

    contentEl.innerHTML = "";
    const container = document.createElement("div");
    container.className = "section-body";
    try {
      section.render(container);
    } catch (e) {
      container.innerHTML =
        '<div class="callout warn"><b>Error al renderizar esta sección.</b><br>' +
        (e && e.message) + "</div>";
      console.error(e);
    }
    contentEl.appendChild(container);

    // Render de fórmulas $...$ presentes como texto
    IO.renderMath(container);

    // marcar link activo
    document.querySelectorAll(".nav-link").forEach((a) => {
      const isActive = a.dataset.id === section.id;
      a.classList.toggle("active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    // scroll arriba
    window.scrollTo(0, 0);
    contentEl.scrollTop = 0;

    // cerrar sidebar en mobile
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");

    document.title = section.title + " · Investigación Operativa (UTN.BA)";
  }

  /* ---------- Routing ---------- */
  function route() {
    const id = location.hash.replace(/^#/, "") || (IO.sections[0] && IO.sections[0].id);
    renderSection(id);
  }
  window.addEventListener("hashchange", route);

  /* navegar por código */
  IO.go = function (id) { location.hash = "#" + id; };

  /* ---------- Mobile ---------- */
  const menuBtn = document.getElementById("menuBtn");
  menuBtn.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    backdrop.classList.toggle("show");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  backdrop.addEventListener("click", () => {
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");
  });

  /* ---------- Barra de progreso de scroll ---------- */
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight || 1);
    progress.style.width = Math.min(100, scrolled * 100) + "%";
  });

  /* ---------- Init (espera a KaTeX si hace falta) ---------- */
  function init() {
    buildNav();
    route();
  }
  if (window.katex) init();
  else {
    // KaTeX se carga con defer; esperamos al load
    window.addEventListener("load", init);
    // fallback por si load ya pasó
    setTimeout(function () { if (!navEl.children.length) init(); }, 800);
  }
})();
