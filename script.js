{
// ---------- Catalogue (exemples) ----------
const PRODUCTS = [
  { id: 1, name: "Chef Damas Nordique 21 cm", cats: ["cuisine", "damas"], shape: "knife-chef", price: 329, meta: "Damas 67 couches · Manche ébène", blade: "url(#damas)", handle: "#0c0a09", tag: "Nouveau" },
  { id: 2, name: "Santoku Kiri 18 cm", cats: ["cuisine"], shape: "knife-chef", price: 179, meta: "Acier VG-10 · Manche chêne fumé", handle: "#3f2a1d" },
  { id: 3, name: "Office 9 cm", cats: ["cuisine"], shape: "knife-chef", price: 89, meta: "Inox X50 · Manche hêtre", handle: "#a16207" },
  { id: 4, name: "Le Pliant du Nord", cats: ["poche"], shape: "knife-pocket", price: 129, meta: "Acier suédois 14C28N · Corne blonde", handle: "#a8a29e", tag: "Best-seller" },
  { id: 5, name: "Nomade Carbone", cats: ["poche"], shape: "knife-pocket", price: 149, meta: "Acier carbone · Fibre de carbone", handle: "#27272a" },
  { id: 6, name: "Pliant Damas Prestige", cats: ["poche", "damas"], shape: "knife-pocket", price: 259, meta: "Damas · Bois de cerf", blade: "url(#damas)", handle: "#8b6b4a", tag: "Édition limitée" },
  { id: 7, name: "Trappeur 12", cats: ["chasse"], shape: "knife-hunt", price: 199, meta: "Acier N690 · Micarta vert · Fourreau cuir", handle: "#1f2a1d" },
  { id: 8, name: "Bushcraft Ardennes", cats: ["chasse"], shape: "knife-hunt", price: 169, meta: "Acier carbone 1095 · Noyer", handle: "#5b3a1e" },
  { id: 9, name: "Coffret Brigade", cats: ["coffret", "cuisine"], shape: "knife-chef", price: 449, meta: "Chef, santoku et office · Gravure offerte", handle: "#292524", tag: "Idée cadeau" },
  { id: 10, name: "Coffret Découverte", cats: ["coffret", "poche"], shape: "knife-pocket", price: 169, meta: "Pliant, étui cuir et pierre d'affûtage", handle: "#57534e" },
];
const QUICK_LINKS = [
  ["Couteaux en acier damas", "#boutique", "damas"],
  ["Affûtage offert à vie", "#services"],
  ["Coffrets cadeaux", "#boutique", "coffret"],
  ["Questions fréquentes", "#faq"],
  ["Venir à l'atelier", "#contact"],
];
const FREE_SHIPPING = 80;
const SHIPPING = 6.9;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const euro = (n) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const byId = (id) => PRODUCTS.find((p) => p.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const knifeSvg = (p) =>
  `<svg viewBox="0 0 400 80" style="--handle:${p.handle};${p.blade ? `--blade:${p.blade}` : ""}" aria-hidden="true"><use href="#${p.shape}"/></svg>`;

// ---------- Boutique ----------
let currentFilter = "all";
function renderProducts() {
  const list = PRODUCTS.filter((p) => currentFilter === "all" || p.cats.includes(currentFilter));
  $("#products").innerHTML = list
    .map(
      (p, i) => `
      <article class="product" style="animation-delay:${i * 50}ms">
        <div class="product__media">${p.tag ? `<span class="tag">${p.tag}</span>` : ""}${knifeSvg(p)}</div>
        <div class="product__body">
          <h3 class="product__name">${p.name}</h3>
          <p class="product__meta">${p.meta}</p>
          <div class="product__foot">
            <span class="price">${euro(p.price)}</span>
            <button class="pill pill--fill" data-add="${p.id}" aria-label="Acheter ${p.name}">Acheter</button>
          </div>
        </div>
      </article>`
    )
    .join("");
}
function setFilter(filter) {
  currentFilter = filter;
  $$(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === filter));
  renderProducts();
}

// ---------- Panier ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem("lfdn-cart")) || []; } catch { cart = []; }
cart = cart.filter((i) => byId(i.id));
const saveCart = () => { try { localStorage.setItem("lfdn-cart", JSON.stringify(cart)); } catch {} };

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const badge = $("#cartCount");
  badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
  toast(`${byId(id).name} ajouté au panier`);
}
function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}
function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const sub = cart.reduce((s, i) => s + i.qty * byId(i.id).price, 0);
  const ship = sub === 0 || sub >= FREE_SHIPPING ? 0 : SHIPPING;
  $("#cartCount").textContent = count;
  $("#cartCount").hidden = count === 0;
  $("#cartShip").textContent = ship ? euro(ship) : "Offerte";
  $("#cartTotal").textContent = euro(sub + ship);
  $("#checkout").disabled = count === 0;
  $("#cartItems").innerHTML = cart.length
    ? cart
        .map(({ id, qty }) => {
          const p = byId(id);
          return `
          <li class="cart-item">
            <div class="cart-item__thumb">${knifeSvg(p)}</div>
            <div>
              <div class="cart-item__name">${p.name}</div>
              <div class="cart-item__price">${euro(p.price)}</div>
              <div class="qty">
                <button data-qty="-1" data-id="${id}" aria-label="Retirer un">−</button>
                <span>${qty}</span>
                <button data-qty="1" data-id="${id}" aria-label="Ajouter un">+</button>
              </div>
            </div>
            <button class="remove" data-remove="${id}">Supprimer</button>
          </li>`;
        })
        .join("")
    : `<li class="cart__empty">Votre panier est vide.</li>`;
}
function openCart(open) {
  $("#cart").classList.toggle("open", open);
  $("#overlay").classList.toggle("open", open);
  $("#cart").setAttribute("aria-hidden", String(!open));
}

// ---------- Menu et recherche plein écran ----------
function openSheet(id) {
  closeSheets();
  $(id).hidden = false;
  document.body.style.overflow = "hidden";
  if (id === "#searchSheet") { renderSearch(""); setTimeout(() => $("#searchInput").focus(), 50); }
}
function closeSheets() {
  $$(".sheet").forEach((s) => (s.hidden = true));
  document.body.style.overflow = "";
}
function renderSearch(q) {
  const term = q.trim().toLowerCase();
  if (!term) {
    $("#searchLabel").textContent = "Liens rapides";
    $("#searchResults").innerHTML = QUICK_LINKS.map(
      ([label, href, f]) => `<li><a href="${href}"${f ? ` data-filter="${f}"` : ""}>${label}</a></li>`
    ).join("");
    return;
  }
  const found = PRODUCTS.filter((p) => (p.name + " " + p.meta + " " + p.cats.join(" ")).toLowerCase().includes(term));
  $("#searchLabel").textContent = found.length ? `${found.length} résultat${found.length > 1 ? "s" : ""}` : "Résultats";
  $("#searchResults").innerHTML = found.length
    ? found.map((p) => `<li><a href="#boutique" data-filter="${p.cats[0]}">${p.name}<span class="price">${euro(p.price)}</span></a></li>`).join("")
    : `<li class="quick__empty">Aucun résultat pour « ${esc(q.trim())} ».</li>`;
}

// ---------- Délégation des clics ----------
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { addToCart(Number(add.dataset.add)); return; }

  const filt = e.target.closest("[data-filter]");
  if (filt) setFilter(filt.dataset.filter);

  if (e.target.closest(".sheet a") || e.target.closest("[data-close]")) closeSheets();

  const q = e.target.closest("[data-qty]");
  if (q) changeQty(Number(q.dataset.id), Number(q.dataset.qty));
  const r = e.target.closest("[data-remove]");
  if (r) changeQty(Number(r.dataset.remove), -Infinity);
});
$("#menuBtn").addEventListener("click", () => openSheet("#menuSheet"));
$("#searchBtn").addEventListener("click", () => openSheet("#searchSheet"));
$("#searchInput").addEventListener("input", (e) => renderSearch(e.target.value));
$("#cartBtn").addEventListener("click", () => openCart(true));
$("#cartClose").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { openCart(false); closeSheets(); } });
$("#checkout").addEventListener("click", () => toast("Merci ! Le paiement en ligne arrive bientôt."));

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- Carrousel ----------
const track = $("#track");
const slides = $$(".slide", track);
let active = 0;
let playing = !matchMedia("(prefers-reduced-motion: reduce)").matches;
$("#dots").innerHTML = slides.map((_, i) => `<button aria-label="Diapositive ${i + 1}"></button>`).join("");
const dots = $$("#dots button");

function goTo(i) {
  const s = slides[i];
  track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: "smooth" });
}
function setActive(i) {
  active = i;
  slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
  dots.forEach((d, k) => d.classList.toggle("is-active", k === i));
}
const slideObserver = new IntersectionObserver(
  (entries) => entries.forEach((en) => en.isIntersecting && setActive(slides.indexOf(en.target))),
  { root: track, threshold: 0.6 }
);
slides.forEach((s) => slideObserver.observe(s));
setActive(0);
dots.forEach((d, i) => d.addEventListener("click", () => { goTo(i); setPlaying(false); }));
track.addEventListener("pointerdown", () => setPlaying(false));

function setPlaying(p) {
  playing = p;
  $("#playBtn").setAttribute("aria-label", p ? "Mettre en pause" : "Lire");
  $("#playIcon").innerHTML = p
    ? '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'
    : '<path d="M7 5v14l12-7z"/>';
}
setPlaying(playing);
$("#playBtn").addEventListener("click", () => setPlaying(!playing));
setInterval(() => { if (playing && !document.hidden) goTo((active + 1) % slides.length); }, 5000);

// ---------- Apparition au défilement ----------
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); revealObserver.unobserve(en.target); } }),
  { threshold: 0.12 }
);
$$(".tile, .shop__head, .perks, .faq, .contact").forEach((el) => { el.classList.add("reveal"); revealObserver.observe(el); });

// ---------- Pied de page : colonnes repliables sur mobile ----------
const mobile = matchMedia("(max-width: 833px)");
const syncFooter = () => $$(".footer__cols details").forEach((d) => (d.open = !mobile.matches));
syncFooter();
mobile.addEventListener("change", syncFooter);
$$(".footer__cols summary").forEach((s) => s.addEventListener("click", (e) => { if (!mobile.matches) e.preventDefault(); }));

// ---------- Newsletter ----------
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#newsletterMsg").textContent = "Merci ! Les inscriptions ouvriront avec la boutique en ligne.";
  e.target.reset();
});

// ---------- Init ----------
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
}
