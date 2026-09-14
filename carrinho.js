/* =========================================================
   CARRINHO — NOME STREETWEAR
========================================================= */

const CART_KEY = "nome_streetwear_cart";

function getCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


/* =========================================================
   ADICIONAR PRODUTO
========================================================= */

function addToCart(product, size) {
  const cart = getCart();

  const existingItem = cart.find(
    item => item.id === product.id && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      categoryName: product.categoryName,
      price: product.price,
      size: size,
      quantity: 1
    });
  }

  saveCart(cart);
  updateCart();
}


/* =========================================================
   REMOVER PRODUTO
========================================================= */

function removeFromCart(id, size) {
  let cart = getCart();

  cart = cart.filter(
    item => !(item.id === id && item.size === size)
  );

  saveCart(cart);
  updateCart();
}


/* =========================================================
   ALTERAR QUANTIDADE
========================================================= */

function changeQuantity(id, size, amount) {
  const cart = getCart();

  const item = cart.find(
    item => item.id === id && item.size === size
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id, size);
    return;
  }

  saveCart(cart);
  updateCart();
}


/* =========================================================
   TOTAL DE ITENS
========================================================= */

function getCartCount() {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
}


/* =========================================================
   TOTAL DA COMPRA
========================================================= */

function getCartTotal() {
  return getCart().reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}


/* =========================================================
   ATUALIZAR CONTADOR
========================================================= */

function updateCartCount() {
  const countElement = document.getElementById("cartCount");

  if (!countElement) return;

  countElement.textContent = getCartCount();
}


/* =========================================================
   FORMATAR PREÇO
========================================================= */

function cartFormatPrice(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */

function renderCart() {
  const container = document.getElementById("cartItems");

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div>
          <strong>SUA SACOLA ESTÁ VAZIA.</strong>
          <p style="margin-top:10px;">
            Adicione alguma peça para começar.
          </p>
        </div>
      </div>
    `;

    updateCartTotal();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">

      <div class="cart-item-image"></div>

      <div class="cart-item-info">

        <h4>${escapeCartHTML(item.name)}</h4>

        <p>
          Tamanho: ${escapeCartHTML(item.size)}
        </p>

        <p>
          ${cartFormatPrice(item.price)}
        </p>

        <div
          style="
            display:flex;
            align-items:center;
            gap:10px;
            margin-top:12px;
          "
        >

          <button
            type="button"
            onclick="changeQuantity(${item.id}, '${escapeAttribute(item.size)}', -1)"
            style="
              width:25px;
              height:25px;
              border:1px solid #ccc;
              background:#fff;
            "
          >
            −
          </button>

          <span
            style="
              min-width:18px;
              text-align:center;
              font-size:11px;
            "
          >
            ${item.quantity}
          </span>

          <button
            type="button"
            onclick="changeQuantity(${item.id}, '${escapeAttribute(item.size)}', 1)"
            style="
              width:25px;
              height:25px;
              border:1px solid #ccc;
              background:#fff;
            "
          >
            +
          </button>

        </div>

      </div>

      <div>
        <button
          type="button"
          class="cart-remove"
          onclick="removeFromCart(${item.id}, '${escapeAttribute(item.size)}')"
        >
          REMOVER
        </button>

        <div
          style="
            margin-top:14px;
            font-size:11px;
            font-weight:700;
            text-align:right;
          "
        >
          ${cartFormatPrice(item.price * item.quantity)}
        </div>
      </div>

    </div>
  `).join("");

  updateCartTotal();
}


/* =========================================================
   ATUALIZAR TOTAL
========================================================= */

function updateCartTotal() {
  const totalElement = document.getElementById("cartTotal");

  if (!totalElement) return;

  totalElement.textContent =
    cartFormatPrice(getCartTotal());
}


/* =========================================================
   ATUALIZAÇÃO GERAL
========================================================= */

function updateCart() {
  updateCartCount();
  renderCart();
}


/* =========================================================
   ABRIR CARRINHO
========================================================= */

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");

  if (!drawer) return;

  renderCart();

  drawer.classList.add("open");

  if (overlay) {
    overlay.classList.add("show");
  }

  document.body.classList.add("no-scroll");
}


/* =========================================================
   FECHAR CARRINHO
========================================================= */

function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");

  if (drawer) {
    drawer.classList.remove("open");
  }

  if (overlay) {
    overlay.classList.remove("show");
  }

  document.body.classList.remove("no-scroll");
}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escapeCartHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}


/* =========================================================
   CHECKOUT
========================================================= */

function canCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Sua sacola está vazia.");
    return false;
  }

  return true;
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  updateCart();
});
