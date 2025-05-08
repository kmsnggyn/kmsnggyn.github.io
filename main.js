/* main.js ──────────────────────────────────────────────────────────── */

// Inject shared navbar and highlight current link
document.addEventListener("DOMContentLoaded", () => {
  fetch("navbar.html")
    .then(r => r.text())
    .then(html => {
      const slot = document.getElementById("navbar-placeholder");
      slot.innerHTML = html;

      const current = location.pathname.split("/").pop() || "index.html";
      slot.querySelectorAll(".nav-link").forEach(a => {
        if (a.getAttribute("href") === current) a.classList.add("active");
      });
    });
});

/* ---------- PDF viewer ---------- */
function viewPDF(path, targetId) {
  const wrap = document.getElementById(targetId);
  wrap.innerHTML = `
    <button class="close-btn" onclick="closeViewer('${targetId}')">Close</button>
    <iframe src="${path}#zoom=page-width"></iframe>`;
  wrap.scrollIntoView({ behavior: "smooth" });
}
function closeViewer(id) { document.getElementById(id).innerHTML = ""; }
window.viewPDF = viewPDF;
window.closeViewer = closeViewer;

/* ---------- Expand / collapse rows ---------- */
let expandedRow = null;
function toggleDetails(row, pdf, title, inst, desc) {
  const tbody = row.parentElement, icon = row.querySelector(".toggle-icon");

  // close any other open row
  if (expandedRow && expandedRow !== row) {
    expandedRow.nextElementSibling?.remove();
    expandedRow.querySelector(".toggle-icon").textContent = "+";
  }

  // collapse if clicking the same row
  if (expandedRow === row && row.nextElementSibling?.classList.contains("details-row")) {
    row.nextElementSibling.remove(); icon.textContent = "+"; expandedRow = null; return;
  }

  // otherwise expand this row
  const details = document.createElement("tr");
  details.className = "details-row";
  details.innerHTML = `
    <td colspan="2">
      <strong>${title}</strong> | ${inst}
      <ul>${desc.split("|").map(t => `<li>${t.trim()}</li>`).join("")}</ul>
      <a href="#" onclick="viewPDF('${pdf}','project-viewer');return false;">View PDF</a>
    </td>`;
  tbody.insertBefore(details, row.nextSibling);
  icon.textContent = "–";
  expandedRow = row;
}
window.toggleDetails = toggleDetails;

/* ---------- Simple table sorter ---------- */
function sortTable(col) {
  const table = document.getElementById("project-table");
  const rows  = Array.from(table.tBodies[0].rows);
  const asc   = !table._asc;                         // toggle direction
  rows.sort((a, b) => {
    const va = a.cells[col].textContent.trim();
    const vb = b.cells[col].textContent.trim();
    return col === 1                                // Year column numeric
      ? (asc ? va - vb : vb - va)
      : (asc ? va.localeCompare(vb) : vb.localeCompare(va));
  });
  rows.forEach(r => table.tBodies[0].appendChild(r));
  table._asc = asc;
}
window.sortTable = sortTable;

/* -------------------------------------------------------------------
   NAVBAR ACTIVE-HIGHLIGHT + TRAVELLING UNDERLINE
------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-link");
  const bar   = document.querySelector(".nav-underline");

  // Helper: position the underline under 'elem'
  function moveBar(elem) {
    const rect = elem.getBoundingClientRect();
    const navRect = elem.parentElement.getBoundingClientRect();
    bar.style.width  = rect.width + "px";
    bar.style.transform = `translateX(${rect.left - navRect.left}px)`;
  }

  // Highlight the current page and set bar position on load
  const current = location.pathname.split("/").pop() || "index.html";
  links.forEach(a => {
    if (a.getAttribute("href") === current) {
      a.classList.add("active");
      moveBar(a);
    }
    // Animate bar when a link is clicked (before navigation happens)
    a.addEventListener("click", e => moveBar(e.currentTarget));
  });

  // Re‑centre on window resize (e.g. mobile rotation)
  window.addEventListener("resize", () => {
    const active = document.querySelector(".nav-link.active");
    if (active) moveBar(active);
  });
});
