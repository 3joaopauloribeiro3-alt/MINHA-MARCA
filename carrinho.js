/* =========================================================
   GUIP — CARRINHO
========================================================= */

const CART_STORAGE_KEY = "guip_cart";

let CART = loadCart();


/* =========================================================
   STORAGE
========================================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(CART_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Erro ao carregar carrinho:",
            error
        );

        return [];

    }

}


function saveCart() {

    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(CART)
    );

}


/* =========================================================
   ADD
========================================================= */

function addToCart(product, size) {

    if (!product) return;

    const existing =
        CART.find(item =>
            String(item.productId) === String(product.id) &&
            item.size === size
        );

    if (existing) {

        existing.quantity += 1;

    } else {

        CART.push({

            productId: product.id,

            name: product.name,

            price: Number(product.price || 0),

            size: size,

            quantity: 1,

            image_url:
                product.image_url || ""

        });

    }

    saveCart();
    updateCart();

    showToast(
        `${product.name} foi adicionado ao carrinho.`
    );

}


/* =========================================================
   REMOVE
========================================================= */

function removeFromCart(index) {

    if (
        index < 0 ||
        index >= CART.length
    ) {
        return;
    }

    CART.splice(index, 1);

    saveCart();
    updateCart();

}


/* =========================================================
   QUANTIDADE
========================================================= */

function changeCartQuantity(index, amount) {

    if (!CART[index]) return;

    CART[index].quantity += amount;

    if (CART[index].quantity <= 0) {

        CART.splice(index, 1);

    }

    saveCart();
    updateCart();

}


/* =========================================================
   TOTAL
========================================================= */

function getCartTotal() {

    return CART.reduce(
        (total, item) =>
            total +
            Number(item.price) *
            Number(item.quantity),
        0
    );

}


function getCartQuantity() {

    return CART.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );

}


/* =========================================================
   RENDER
========================================================= */

function updateCart() {

    const container =
        document.getElementById("cartItems");

    const totalElement =
        document.getElementById("cartTotal");

    const countElement =
        document.getElementById("cartCount");


    if (countElement) {

        countElement.textContent =
            getCartQuantity();

    }


    if (totalElement) {

        totalElement.textContent =
            formatPrice(getCartTotal());

    }


    if (!container) return;


    if (!CART.length) {

        container.innerHTML = `
            <div class="cart-empty">

                <p>
                    SEU CARRINHO ESTÁ VAZIO.
                </p>

                <button
                    type="button"
                    onclick="
                        closeCart();
                        document
                            .getElementById('shop')
                            ?.scrollIntoView({
                                behavior: 'smooth'
                            });
                    "
                >
                    CONTINUAR COMPRANDO →
                </button>

            </div>
        `;

        return;

    }


    container.innerHTML =
        CART.map((item, index) => `

            <div class="cart-item">

                <div class="cart-item-image">

                    ${
                        item.image_url
                            ? `
                                <img
                                    src="${escapeHTML(item.image_url)}"
                                    alt="${escapeHTML(item.name)}"
                                >
                              `
                            : `
                                <div class="cart-placeholder">
                                    G
                                </div>
                              `
                    }

                </div>


                <div class="cart-item-info">

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <p>
                        TAMANHO:
                        ${escapeHTML(item.size)}
                    </p>


                    <div class="cart-quantity">

                        <button
                            type="button"
                            onclick="changeCartQuantity(${index}, -1)"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            onclick="changeCartQuantity(${index}, 1)"
                        >
                            +
                        </button>

                    </div>

                </div>


                <div>

                    <div class="cart-item-price">
                        ${formatPrice(
                            item.price *
                            item.quantity
                        )}
                    </div>

                    <button
                        type="button"
                        class="cart-remove"
                        onclick="removeFromCart(${index})"
                    >
                        REMOVER
                    </button>

                </div>

            </div>

        `).join("");

}


/* =========================================================
   OPEN / CLOSE
========================================================= */

function openCart() {

    const drawer =
        document.getElementById("cartDrawer");

    const overlay =
        document.getElementById("cartOverlay");

    if (!drawer) return;

    drawer.classList.add("active");

    drawer.setAttribute(
        "aria-hidden",
        "false"
    );

    if (overlay) {
        overlay.classList.add("active");
    }

    document.body.classList.add("no-scroll");

    updateCart();

}


function closeCart() {

    const drawer =
        document.getElementById("cartDrawer");

    const overlay =
        document.getElementById("cartOverlay");

    if (drawer) {

        drawer.classList.remove("active");

        drawer.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    if (overlay) {

        overlay.classList.remove("active");

    }

    document.body.classList.remove("no-scroll");

}


/* =========================================================
   CHECKOUT
========================================================= */

function goToCheckout() {

    if (!CART.length) {

        showToast(
            "Seu carrinho está vazio."
        );

        return;

    }

    window.location.href =
        "checkout.html";

}


/* =========================================================
   CLEAR
========================================================= */

function clearCart() {

    CART = [];

    saveCart();
    updateCart();

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCart();

    }
);
