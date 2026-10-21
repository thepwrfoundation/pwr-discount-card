
/*
 PWR Foundation Community Discount Card
 Website Script
*/

const cfg = window.PWR_CONFIG || {};

const DIRECTORY_URL =
  "https://script.google.com/macros/s/AKfycbxpy_j6WmYLjmNc4SQpuxX5nteZ8VO2rlzuXtvhZetjDjgzb2kiEC-6ewGe6E2t25Su/exec";

let active = "All";
let liveDeals = null;

const grid = document.querySelector("#deals-grid");
const filters = document.querySelector("#filters");
const search = document.querySelector("#search");

const cats = [
  "All",
  "Food & Drinks",
  "Shopping & Retail",
  "Services",
  "Entertainment"
];

const icons = {
  "Food & Drinks": "☕",
  "Shopping & Retail": "✿",
  "Services": "✂",
  "Entertainment": "★"
};

const escapeHtml = s =>
  String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

function getDeals() {
  return liveDeals === null
    ? (cfg.deals || [])
    : liveDeals;
}

function drawFilters() {
  const categories = [
    ...cats,
    ...getDeals().map(d => d.category).filter(Boolean)
  ].filter((c, i, arr) => arr.indexOf(c) === i);

  filters.innerHTML = categories.map(c =>
    `<button class="chip ${c === active ? "selected" : ""}"
      data-category="${escapeHtml(c)}">
      ${escapeHtml(c)}
    </button>`
  ).join("");

  filters.querySelectorAll("button").forEach(b => {
    b.onclick = () => {
      active = b.dataset.category;
      drawFilters();
      drawDeals();
    };
  });
}

function drawDeals() {
  const q = search.value.trim().toLowerCase();

  const items = getDeals().filter(d =>
    (active === "All" || d.category === active) &&
    [
      d.name,
      d.category,
      d.town,
      d.offer,
      d.detail
    ].join(" ").toLowerCase().includes(q)
  );

  grid.innerHTML = items.map(d => {
    const logo = /^https:\/\//i.test(d.logo || "")
      ? `<img src="${escapeHtml(d.logo)}"
          alt="${escapeHtml(d.name)} logo"
          loading="lazy"
          style="max-width:65px;max-height:65px;object-fit:contain;"
          onerror="this.style.display='none'">`
      : "";

    return `
      <article class="deal-card">
        <div class="deal-top">
          <span class="deal-icon">
            ${icons[d.category] || "✦"}
          </span>
          <span class="deal-cat">
            ${escapeHtml(d.category)}
          </span>
          ${d.featured
            ? '<span class="feature-label">★ Featured</span>'
            : ''}
        </div>

        <div class="deal-content">
          ${logo}
          <p class="deal-town">
            ⌁ ${escapeHtml(d.town)}
          </p>
          <h3>${escapeHtml(d.name)}</h3>
          <div class="deal-offer">
            ${escapeHtml(d.offer)}
          </div>
          <p class="deal-detail">
            ${escapeHtml(d.detail)}
          </p>
        </div>

        <div class="deal-bottom">
          <span>
            ✂ &nbsp; ${escapeHtml(d.terms)}
          </span>
        </div>
      </article>
    `;
  }).join("") ||
    '<div class="empty">No matching offers yet. Try another category or search.</div>';

  document.querySelector("#results").textContent =
    `Showing ${items.length} ${items.length === 1 ? "offer" : "offers"}`;
}

/*
 Receives the approved businesses
 from Google Apps Script.
*/

window.PWR_receiveBusinesses = function(data) {
  if (!data || !Array.isArray(data.businesses)) {
    console.error("Invalid PWR directory response", data);
    return;
  }

  liveDeals = data.businesses;

  drawFilters();
  drawDeals();
};

/*
 Loads the public business directory.
*/

function loadBusinessDirectory() {
  const script = document.createElement("script");

  script.src =
    DIRECTORY_URL +
    "?callback=PWR_receiveBusinesses&t=" +
    Date.now();

  script.onerror = function() {
    console.error("Unable to load PWR business directory.");
  };

  document.body.appendChild(script);
}

/*
 Initialize website.
*/

drawFilters();
drawDeals();

search.addEventListener("input", drawDeals);

document.querySelector("#year").textContent =
  new Date().getFullYear();

const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#nav");

menu.onclick = () => {
  const on = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", on);
};

nav.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  })
);

const dialog = document.querySelector("#setup-dialog");

[
  ["business-apply", "businessFormUrl"],
  ["fundraise-apply", "fundraiserFormUrl"]
].forEach(([id, key]) => {
  const el = document.getElementById(id);

  if (cfg[key] && /^https:\/\//.test(cfg[key])) {
    el.href = cfg[key];
    el.target = "_blank";
    el.rel = "noopener noreferrer";
  } else {
    el.addEventListener("click", e => {
      e.preventDefault();
      dialog.showModal();
    });
  }
});

document.querySelector("#close-dialog").onclick =
  () => dialog.close();

document.querySelector("#dismiss").onclick =
  () => dialog.close();

/*
 Load approved businesses.
*/

loadBusinessDirectory();
