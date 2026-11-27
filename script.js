// ---------- Données produits ----------
const PRODUCTS = [
  { id: 1, name: "Chef Damas 21 cm", cat: "cuisine", shape: "knife-chef", price: 289, meta: "Acier damas 67 couches · Manche olivier", blade: "url(#damas)", handle: "#6b4a2b", tag: "Best-seller" },
  { id: 2, name: "Santoku Kiri", cat: "cuisine", shape: "knife-chef", price: 179, meta: "Acier VG-10 · Manche ébène", handle: "#1c1917" },
  { id: 3, name: "Office Petit Chef", cat: "cuisine", shape: "knife-chef", price: 89, meta: "Inox X50 · Manche hêtre", handle: "#a16207" },
  { id: 4, name: "Le Pliant Thiers", cat: "poche", shape: "knife-pocket", price: 129, meta: "Acier 14C28N · Corne blonde", handle: "#c2a878", tag: "Nouveau" },
  { id: 5, name: "Nomade Carbone", cat: "poche", shape: "knife-pocket", price: 149, meta: "Acier carbone · Fibre de carbone", handle: "#27272a" },
  { id: 6, name: "Pliant Damas Prestige", cat: "poche", shape: "knife-pocket", price: 249, meta: "Damas · Bois de cerf", blade: "url(#damas)", handle: "#8b6b4a", tag: "Édition limitée" },
  { id: 7, name: "Trappeur 12", cat: "chasse", shape: "knife-hunt", price: 199, meta: "Acier N690 · Micarta vert", handle: "#365314" },
  { id: 8, name: "Bushcraft Ardèche", cat: "chasse", shape: "knife-hunt", price: 169, meta: "Acier carbone 1095 · Noyer", handle: "#5b3a1e" },
];

const euro = (n) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const knifeSvg = (p) =>
  `<svg viewBox="0 0 400 80" style="--handle:${p.handle};${p.blade ? `--blade:${p.blade}` : ""}" aria-hidden="true"><use href="#${p.shape}"/></svg>`;

const CAT_LABEL = { cuisine: "Cuisine", poche: "Poche", chasse: "Chasse" };

// ---------- Rendu des produits ----------
function renderProducts(filter = "all") {
  const list = PRODUCTS.filter((p) => filter === "all" || p.cat === filter);
  $("#products").innerHTML = list
    .map(
      (p, i) => `
      <article class="product" style="animation-delay:${i * 60}ms">
        <div class="product__media">
          ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
          ${knifeSvg(p)}
        </div>
        <div class="product__body">
          <span class="product__cat">${CAT_LABEL[p.cat]}</span>
          <h3 class="product__name">${p.name}</h3>
          <p class="product__meta">${p.meta}</p>
          <div class="product__foot">
            <span class="price">${euro(p.price)}</span>
            <button class="add-btn" data-id="${p.id}" aria-label="Ajouter ${p.name} au panier">+</button>
          </div>
        </div>
      </article>`
    )
    .join("");
}

function setFilter(filter) {
  $$(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.filter === filter));
  renderProducts(filter);
}

$$(".chip").forEach((chip) => chip.addEventListener("click", () => setFilter(chip.dataset.filter)));
$$(".collection").forEach((card) => card.addEventListener("click", () => setFilter(card.dataset.filter)));

// ---------- Panier ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem("coteaux-cart")) || []; } catch { cart = []; }

const saveCart = () => { try { localStorage.setItem("coteaux-cart", JSON.stringify(cart)); } catch {} };

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const badge = $("#cartCount");
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 300);
  toast(`${PRODUCTS.find((p) => p.id === id).name} ajouté au panier`);
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
  const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find((p) => p.id === i.id).price, 0);
  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = euro(total);
  $("#checkout").disabled = count === 0;

  $("#cartItems").innerHTML = cart.length
    ? cart
        .map(({ id, qty }) => {
          const p = PRODUCTS.find((x) => x.id === id);
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
            <button class="remove" data-remove="${id}">Retirer</button>
          </li>`;
        })
        .join("")
    : `<li class="cart__empty">Votre panier est vide.<br/>Trouvez la lame qui vous ressemble.</li>`;
}

function openCart(open) {
  $("#cart").classList.toggle("open", open);
  $("#overlay").classList.toggle("open", open);
  $("#cart").setAttribute("aria-hidden", String(!open));
}

$("#products").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(Number(btn.dataset.id));
});
$("#cartItems").addEventListener("click", (e) => {
  const q = e.target.closest("[data-qty]");
  const r = e.target.closest("[data-remove]");
  if (q) changeQty(Number(q.dataset.id), Number(q.dataset.qty));
  if (r) changeQty(Number(r.dataset.remove), -Infinity);
});
$("#cartBtn").addEventListener("click", () => openCart(true));
$("#cartClose").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));
$("#checkout").addEventListener("click", () => {
  toast("Merci ! Le paiement en ligne arrive bientôt.");
});

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

// ---------- Navigation ----------
const nav = $(".nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const burger = $("#burger");
burger.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") !== "true";
  burger.setAttribute("aria-expanded", String(open));
  $("#navLinks").classList.toggle("open", open);
});
$$("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false");
    $("#navLinks").classList.remove("open");
  })
);

// ---------- Apparition au scroll ----------
const io = new IntersectionObserver(
  (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("visible"), io.unobserve(en.target))),
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => io.observe(el));

// ---------- Newsletter ----------
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#newsletterMsg").textContent = "Bienvenue ! Votre code −10 % arrive par e-mail.";
  e.target.reset();
});

// ---------- Init ----------
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
