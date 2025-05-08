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
  /* scroll only as far as needed so the whole expanded block stays in view */
  wrap.scrollIntoView({
    behavior: "smooth",
    block:    "center",   // or "center"
    inline:   "nearest"
  });
}
function closeViewer(id) { document.getElementById(id).innerHTML = ""; }
window.viewPDF = viewPDF;
window.closeViewer = closeViewer;

/* ---------- Expand / collapse rows ---------- */let viewerSeq = 0;                         // new: unique IDs
let expandedRow = null;                    // already present

function toggleDetails(row, inst, desc, link1Name, link1, link2Name, link2) {

  /* ---------- close any open block ---------- */
  if (expandedRow && expandedRow !== row) {
    expandedRow.nextElementSibling.remove();          // remove <tr class="details-row">
    expandedRow.classList.remove('open');
    expandedRow.querySelector('.toggle-icon').textContent = '+';
  }
  if (expandedRow === row) {                           // clicked the same row → collapse
    row.nextElementSibling.remove();
    row.classList.remove('open');
    row.querySelector('.toggle-icon').textContent = '+';
    expandedRow = null;
    return;
  }

  /* ---------- unique wrapper ID for this row ---------- */
  const viewerId = `pdf-viewer-${++viewerSeq}`;

  /* ---------- optional links ---------- */
  const linkPairs = [
    [link1Name, link1],
    [link2Name, link2],
  ];
  const linksHtml = linkPairs
    .filter(([name, url]) => name && url)              // only complete pairs
    .map(
      ([name, url]) =>
        `<a href="#" onclick="viewPDF('${url}','${viewerId}');return false;">${name}</a>`
    )
    .join(' ');

  /* ---------- build + insert details row ---------- */
  const details = document.createElement('tr');
  details.className = 'details-row';
  details.innerHTML = `
    <td></td>
    <td colspan="2">
      ${inst}
      <ul>${desc.split('|').map(t => `<li>${t.trim()}</li>`).join('')}</ul>
      ${linksHtml}
      <div id="${viewerId}" class="pdf-wrap"></div>    <!-- viewer injected here -->
    </td>`;
  row.parentElement.insertBefore(details, row.nextSibling);

  /* ---------- mark row as open ---------- */
  row.classList.add('open');
  row.querySelector('.toggle-icon').textContent = '–';
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
