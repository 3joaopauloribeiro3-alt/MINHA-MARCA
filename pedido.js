let currentOrder = null;

function orderPrice(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function getOrderId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function translateStatus(status) {

    const statuses = {
        pending: "Aguardando pagamento",
        paid: "Pagamento aprovado",
        processing: "Em preparação",
        shipped: "Enviado",
        delivered: "Entregue",
        cancelled: "Cancelado",
        canceled: "Cancelado"
    };

    return statuses[status] || status || "Em análise";
}

async function loadOrder() {

    const orderId = getOrderId();

    if (!orderId) {
        window.location.href = "pedidos.html";
        return;
    }

    if (typeof getCurrentUser !== "function") {
        window.location.href = "login.html";
        return;
    }

    const user = await getCurrentUser();

    if (!user) {
        window.location.href =
            `login.html?redirect=${encodeURIComponent(
                `pedido.html?id=${orderId}`
            )}`;

        return;
    }

    const { data: order, error } = await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

    if (error || !order) {

        document.getElementById("orderContainer").innerHTML = `
            <div class="order-error">
                <h2>Pedido não encontrado</h2>
                <p>
                    Não encontramos esse pedido na sua conta.
                </p>
                <a href="pedidos.html">Voltar aos pedidos</a>
            </div>
        `;

        return;
    }

    currentOrder = order;

    const { data: items, error: itemsError } = await db
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

    if (itemsError) {
        console.error(itemsError);
    }

    renderOrder(order, items || []);
}

function renderOrder(order, items) {

    document.title = `Pedido #${String(order.id).slice(0, 8)} | GUIP`;

    document.getElementById("orderNumber").textContent =
        `#${String(order.id).slice(0, 8).toUpperCase()}`;

    document.getElementById("orderStatus").textContent =
        translateStatus(order.status);

    document.getElementById("orderTotal").textContent =
        orderPrice(order.total);

    if (order.created_at) {

        const date = new Date(order.created_at);

        document.getElementById("orderDate").textContent =
            date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
    }

    const container = document.getElementById("orderItems");

    container.innerHTML = items.map(item => {

        const image =
            item.image_url ||
            "https://placehold.co/120x150/f5f5f5/111111?text=GUIP";

        return `
            <div class="order-item">

                <img src="${image}" alt="${item.product_name || "Produto"}">

                <div class="order-item-info">

                    <strong>
                        ${item.product_name || "Produto GUIP"}
                    </strong>

                    <span>
                        Quantidade: ${item.quantity || 1}
                    </span>

                    ${
                        item.size
                            ? `<span>Tamanho: ${item.size}</span>`
                            : ""
                    }

                </div>

                <strong>
                    ${orderPrice(
                        Number(item.price) *
                        Number(item.quantity || 1)
                    )}
                </strong>

            </div>
        `;

    }).join("");

    const shipping = document.getElementById("orderShipping");

    if (shipping) {
        shipping.textContent =
            order.shipping_total
                ? orderPrice(order.shipping_total)
                : "A calcular";
    }
}

document.addEventListener("DOMContentLoaded", loadOrder);
