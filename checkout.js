let checkoutUser = null;

function checkoutFormatPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function getCheckoutCart() {
    try {
        return JSON.parse(localStorage.getItem("guip_cart") || "[]");
    } catch {
        return [];
    }
}

function calculateCheckoutTotal() {
    return getCheckoutCart().reduce((total, item) => {
        return total + (Number(item.price) * Number(item.quantity || 1));
    }, 0);
}

function showCheckoutMessage(message) {
    const box = document.getElementById("checkoutMessage");

    if (!box) return;

    box.textContent = message;
    box.classList.add("show");
}

function renderCheckout() {
    const container = document.getElementById("checkoutItems");

    if (!container) return;

    const cart = getCheckoutCart();

    if (!cart.length) {
        container.innerHTML = `
            <p style="color:#666;">
                Seu carrinho está vazio.
            </p>
        `;

        const button = document.getElementById("finishOrderButton");

        if (button) {
            button.disabled = true;
        }

        return;
    }

    container.innerHTML = cart.map(item => {

        const image =
            item.image_url ||
            item.image ||
            "https://placehold.co/150x180/f5f5f5/111111?text=GUIP";

        return `
            <div class="summary-item">

                <img
                    src="${image}"
                    alt="${item.name || "Produto GUIP"}"
                >

                <div>
                    <div class="summary-item-name">
                        ${item.name || "Produto"}
                    </div>

                    <div class="summary-item-meta">
                        ${item.size ? `Tamanho: ${item.size}<br>` : ""}
                        Quantidade: ${item.quantity || 1}
                    </div>
                </div>

                <div class="summary-item-price">
                    ${checkoutFormatPrice(
                        Number(item.price) * Number(item.quantity || 1)
                    )}
                </div>

            </div>
        `;
    }).join("");

    const total = calculateCheckoutTotal();

    document.getElementById("checkoutSubtotal").textContent =
        checkoutFormatPrice(total);

    document.getElementById("checkoutTotal").textContent =
        checkoutFormatPrice(total);

    document.getElementById("checkoutShipping").textContent =
        "A calcular";
}

async function loadCheckoutUser() {

    if (typeof getCurrentUser !== "function") {
        window.location.href = "login.html";
        return;
    }

    checkoutUser = await getCurrentUser();

    if (!checkoutUser) {
        window.location.href = "login.html?redirect=checkout.html";
        return;
    }

    const email = document.getElementById("email");

    if (email) {
        email.value = checkoutUser.email || "";
    }

    if (typeof getProfile === "function") {

        try {

            const profile = await getProfile(checkoutUser.id);

            if (profile) {

                const name = document.getElementById("fullName");

                if (name && profile.full_name) {
                    name.value = profile.full_name;
                }

            }

        } catch (error) {
            console.log("Perfil não carregado:", error);
        }
    }
}

async function createAddress(address) {

    const { data, error } = await db
        .from("addresses")
        .insert({
            user_id: checkoutUser.id,
            name: address.fullName,
            phone: address.phone,
            cep: address.cep,
            state: address.state,
            city: address.city,
            street: address.street,
            number: address.number,
            complement: address.complement || null,
            neighborhood: address.neighborhood
        })
        .select()
        .single();

    if (error) {
        console.warn("Não foi possível salvar endereço:", error);
        return null;
    }

    return data;
}

async function createOrder() {

    if (!checkoutUser) {
        window.location.href = "login.html";
        return;
    }

    const cart = getCheckoutCart();

    if (!cart.length) {
        showCheckoutMessage("Seu carrinho está vazio.");
        return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const state = document.getElementById("state").value.trim();
    const city = document.getElementById("city").value.trim();
    const street = document.getElementById("street").value.trim();
    const number = document.getElementById("number").value.trim();
    const complement = document.getElementById("complement").value.trim();
    const neighborhood = document.getElementById("neighborhood").value.trim();

    if (
        !fullName ||
        !phone ||
        !cep ||
        !state ||
        !city ||
        !street ||
        !number ||
        !neighborhood
    ) {
        showCheckoutMessage(
            "Preencha todos os campos obrigatórios."
        );
        return;
    }

    const button = document.getElementById("finishOrderButton");

    button.disabled = true;
    button.textContent = "PROCESSANDO...";

    try {

        const total = calculateCheckoutTotal();

        const addressObject = {
            fullName,
            phone,
            cep,
            state,
            city,
            street,
            number,
            complement,
            neighborhood
        };

        const address = await createAddress(addressObject);

        const orderPayload = {
            user_id: checkoutUser.id,
            status: "pending",
            total: total,
            payment_method: "pix"
        };

        if (address?.id) {
            orderPayload.address_id = address.id;
        }

        const { data: order, error: orderError } = await db
            .from("orders")
            .insert(orderPayload)
            .select()
            .single();

        if (orderError) {
            throw orderError;
        }

        const orderItems = cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            quantity: Number(item.quantity || 1),
            price: Number(item.price),
            size: item.size || null
        }));

        const { error: itemsError } = await db
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            throw itemsError;
        }

        localStorage.removeItem("guip_cart");

        window.location.href =
            `pedido.html?id=${encodeURIComponent(order.id)}`;

    } catch (error) {

        console.error("Erro ao criar pedido:", error);

        showCheckoutMessage(
            "Não foi possível finalizar o pedido agora. Verifique os dados e tente novamente."
        );

        button.disabled = false;
        button.textContent = "FINALIZAR PEDIDO";
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    renderCheckout();

    await loadCheckoutUser();

    const form = document.getElementById("checkoutForm");

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            createOrder();
        });
    }

    const button = document.getElementById("finishOrderButton");

    if (button) {
        button.addEventListener("click", createOrder);
    }

});
