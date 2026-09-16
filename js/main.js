(() => {
  const data = window.siteData || { life: [], works: [], products: [] };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = n => `$${Number(n).toLocaleString("en-US")}`;

  // Header / mobile navigation
  const header = $("[data-header]");
  const menu = $(".menu-toggle");
  const panel = $("#mobile-menu");
  const closeMenu = $(".mobile-close");
  const setMenu = open => {
    if (!menu || !panel) return;
    menu.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("no-scroll", open);
  };
  menu?.addEventListener("click", () => setMenu(true));
  closeMenu?.addEventListener("click", () => setMenu(false));
  $$(".mobile-nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setMenu(false); closeCart(); } });
  window.addEventListener("scroll", () => header?.classList.toggle("scrolled", window.scrollY > 30), { passive: true });

  // Scroll reveal
  const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
  }, { threshold: .12 }) : null;
  if (observer) $$(".reveal:not(.is-visible)").forEach(el => observer.observe(el));

  function lifeMarkup(item, index, archive = false) {
    if (archive) return `<article class="archive-item archive-item--feature reveal">
      <div class="archive-image-wrap">
        <a href="${item.url}" aria-label="Open ${item.title}"><img class="archive-image" src="${item.image}" width="1200" height="900" loading="lazy" alt="${item.title}"></a>
      </div>
      <div class="archive-copy">
        <div class="archive-heading">
          <p class="archive-meta">LIFE / ${item.date} / ${item.type}</p>
          <h2 class="archive-title">${item.title}</h2>
        </div>
        <p class="archive-description">${item.body || item.description}</p>
      </div>
    </article>`;
    return `<article class="life-item reveal">
      <a href="${item.url}" aria-label="Open ${item.title}"><div class="life-image"><img src="${item.image}" width="1200" height="900" loading="lazy" alt="${item.title}"></div></a>
      <div class="life-copy">
        <p class="life-meta">LIFE / ${item.date}</p>
        <div class="life-text">
          <h3 class="life-title">${item.title}</h3>
          <p class="life-description">${item.body || item.description}</p>
          <p class="life-cta">
        <a class="text-link" href="life.html">EXPLORE LIFE →</a>
    </p>
        </div>
      </div>
    </article>`;
  }
  const lifePreview = $("[data-life-preview]");
  if (lifePreview) {
    lifePreview.innerHTML = data.life.slice(0, 1).map((item, index) => lifeMarkup(item, index)).join("");
    lifePreview.querySelectorAll(".reveal").forEach(el => observer?.observe(el));
  }
  const lifeArchive = $("[data-life-archive]");
  if (lifeArchive) {
    lifeArchive.innerHTML = data.life.map((item, index) => lifeMarkup(item, index, true)).join("");
    lifeArchive.querySelectorAll(".reveal").forEach(el => observer?.observe(el));
  }

  // Works: one editorial showcase + category navigation
  function workShell(target, full = false) {
    if (!target) return;
    target.classList.add("works-shell");
    const categories = ["ALL PROJECTS", "GRAPHIC", "SPACE", "VIDEO"];
    target.innerHTML = `<nav class="work-categories" aria-label="Work categories">${categories.map((c, i) => `<button type="button" class="work-category ${i === 0 ? "is-active" : ""}" data-work-filter="${c}" aria-pressed="${i === 0}"><span class="name">${c}</span><span class="count">${i === 0 ? data.works.length : data.works.filter(w => w.category === c).length.toString().padStart(2, "0")}</span></button>`).join("")}</nav>
    <article class="work-showcase" data-work-showcase aria-live="polite"></article>`;
    const show = $("[data-work-showcase]", target);
    let list = data.works, current = 0;
    const render = (idx, filtered = list) => {
      const w = filtered[idx] || filtered[0];
      if (!w) return;
      const total = filtered.length;
      show.innerHTML = `<div class="work-main-image"><img src="${w.image}" width="1400" height="950" alt="${w.project} 作品主視覺"></div>
      <div class="work-info"><div><div class="work-index">${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
      <h3 class="work-project">${w.project}</h3><div class="work-category-label">${w.category}</div></div>
      <div><p class="work-description">${w.description}</p><div class="metadata">
      <div class="metadata-row"><span>YEAR</span><span>${w.year}</span></div><div class="metadata-row"><span>TYPE</span><span>${w.type}</span></div><div class="metadata-row"><span>ROLE</span><span>${w.role}</span></div></div>
      <p class="work-cta"><a class="text-link" href="${w.url}">VIEW MORE WORKS →</a></p></div></div>`;
    };
    render(current, list);
    $$("[data-work-filter]", target).forEach(btn => btn.addEventListener("click", () => {
      $$("[data-work-filter]", target).forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false") });
      btn.classList.add("is-active"); btn.setAttribute("aria-pressed", "true");
      const filter = btn.dataset.workFilter;
      list = filter === "ALL PROJECTS" ? data.works : data.works.filter(w => w.category === filter);
      current = 0; show.classList.add("is-switching");
      setTimeout(() => { render(current, list); show.classList.remove("is-switching") }, 180);
    }));
  }
  workShell($("[data-works]"));
  workShell($("[data-works-full]"), true);

  // Products + front-end cart
  let cart;
  try { cart = JSON.parse(localStorage.getItem("iray-cart") || "[]"); } catch { cart = []; }
  if (!Array.isArray(cart)) cart = [];
  const productMarkup = p => `<article class="product-item reveal">
    <a href="${p.url}" aria-label="View ${p.name}"><div class="product-image"><img src="${p.image}" width="900" height="900" loading="lazy" alt="${p.name}"></div></a>
    <h3 class="product-name">${p.name}</h3><p class="product-description">${p.description}</p>
    <div class="product-row"><span class="price">${money(p.price)}</span><button class="add-cart" type="button" data-add="${p.id}">ADD TO CART +</button></div>
  </article>`;
  function renderProducts() {
    $$("[data-products]").forEach(el => {
      const count = el.dataset.products;
      const isHomeThingsPreview = el.closest("#things");
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const defaultCount = count === "all" ? data.products.length : Number(count) || 3;
      const resolvedCount = isHomeThingsPreview && isMobile ? 4 : defaultCount;
      el.innerHTML = data.products.slice(0, resolvedCount).map(productMarkup).join("");
      el.querySelectorAll(".reveal").forEach(x => observer?.observe(x));
    });
  }
  renderProducts();
  window.addEventListener("resize", renderProducts);

  const panelCart = $("[data-cart-panel]");
  const itemsBox = $("[data-cart-items]");
  const countBox = $("[data-cart-count]");
  const totalBox = $("[data-cart-total]");
  const summaryBox = $("[data-cart-summary]");
  const openCart = $("[data-cart-open]");
  const closeCartBtn = $("[data-cart-close]");
  const cartOverlay = $("[data-cart-overlay]");
  function setCart(open) {
    if (!panelCart) return;
    panelCart.classList.toggle("is-open", open);
    panelCart.setAttribute("aria-hidden", String(!open));
    cartOverlay?.classList.toggle("is-visible", open);
    cartOverlay?.setAttribute("aria-hidden", String(!open));
    openCart?.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("cart-open", open);
    if (open) closeCartBtn?.focus(); else openCart?.focus();
  }
  function closeCart() { setCart(false); }
  function save() { localStorage.setItem("iray-cart", JSON.stringify(cart)); renderCart(); }
  function renderCart() {
    if (!itemsBox) return;
    const count = cart.reduce((s, x) => s + x.qty, 0); if (countBox) countBox.textContent = count;
    openCart?.classList.toggle("has-items", count > 0);
    if (summaryBox) summaryBox.textContent = `${count} item${count === 1 ? "" : "s"}`;
    if (!cart.length) { itemsBox.innerHTML = '<p class="empty-cart">目前還沒有選物。</p>'; totalBox.textContent = "$0"; return; }
    itemsBox.innerHTML = cart.map(x => {
      const p = data.products.find(p => p.id === x.id); return `<div class="cart-row">
      <img src="${p.image}" width="100" height="100" alt="">
      <div><h3>${p.name}</h3><div class="qty"><button type="button" data-dec="${p.id}" aria-label="Decrease ${p.name}">−</button><span>${x.qty}</span><button type="button" data-inc="${p.id}" aria-label="Increase ${p.name}">+</button></div><button class="remove" type="button" data-remove="${p.id}">remove</button></div>
      <strong>${money(p.price * x.qty)}</strong></div>`
    }).join("");
    totalBox.textContent = money(cart.reduce((s, x) => s + (data.products.find(p => p.id === x.id).price * x.qty), 0));
    itemsBox.querySelectorAll(".cart-row").forEach((row, index) => {
      const product = data.products.find(p => p.id === cart[index].id);
      const details = $("div", row);
      const unitPrice = document.createElement("p");
      unitPrice.textContent = money(product.price);
      details.querySelector(".qty")?.before(unitPrice);
      const decrement = $("[data-dec]", row);
      if (decrement) decrement.textContent = "−";
      const remove = $("[data-remove]", row);
      if (remove) remove.textContent = "REMOVE";
    });
    itemsBox.querySelectorAll("[data-inc]").forEach(b => b.onclick = () => { cart.find(x => x.id === b.dataset.inc).qty++; save() });
    itemsBox.querySelectorAll("[data-dec]").forEach(b => b.onclick = () => { const x = cart.find(x => x.id === b.dataset.dec); x.qty--; if (x.qty <= 0) cart.splice(cart.indexOf(x), 1); save() });
    itemsBox.querySelectorAll("[data-remove]").forEach(b => b.onclick = () => { const i = cart.findIndex(x => x.id === b.dataset.remove); cart.splice(i, 1); save() });
  }
  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) { const x = cart.find(x => x.id === add.dataset.add); if (x) x.qty++; else cart.push({ id: add.dataset.add, qty: 1 }); save(); add.classList.add("is-added"); setTimeout(() => add.classList.remove("is-added"), 550); }
  });
  openCart?.addEventListener("click", () => setCart(true));
  closeCartBtn?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);
  renderCart();

})();
