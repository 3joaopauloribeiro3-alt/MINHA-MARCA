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

    return statuses[status] || "Em análise";
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

                <a href="pedidos.html">
                    VOLTAR AOS PEDIDOS
                </a>

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
        console.error("Erro ao carregar itens:", itemsError);
    }

    renderOrder(order, items || []);
}

function renderOrder(order, items) {

    document.title =
        `Pedido #${String(order.id).slice(0, 8)} | GUIP`;

    const date = order.created_at
        ? new Date(order.created_at).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        )
        : "—";

    const itemsHTML = items.length
        ? items.map(item => {

            const image =
                item.image_url ||
                "https://placehold.co/200x250/f5f5f5/111111?text=GUIP";

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            return `
                <div class="order-item">

                    <img
                        src="${image}"
                        alt="${item.product_name || "Produto GUIP"}"
                    >

                    <div class="order-item-info">

                        <strong>
                            ${item.product_name || "Produto GUIP"}
                        </strong>

                        <span>
                            Quantidade: ${quantity}
                        </span>

                        ${
                            item.size
                                ? `
                                    <span>
                                        Tamanho: ${item.size}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                    <div class="order-item-price">
                        ${orderPrice(price * quantity)}
                    </div>

                </div>
            `;

        }).join("")
        : `
            <p style="padding:25px 0;color:#777;">
                Nenhum item encontrado neste pedido.
            </p>
        `;

    const shippingValue =
        order.shipping_total ||
        order.shipping_cost ||
        0;

    document.getElementById("orderContainer").innerHTML = `

        <header class="order-header">

            <div class="order-kicker">
                GUIP / PEDIDO
            </div>

            <h1 class="order-title">
                SEU PEDIDO
            </h1>

            <div class="order-number">
                Pedido #${String(order.id)
                    .slice(0, 8)
                    .toUpperCase()}
            </div>

        </header>


        <div class="order-status-box">

            <div>

                <div class="status-label">
                    Status
                </div>

                <div class="status-value">
                    ${translateStatus(order.status)}
                </div>

            </div>


            <div class="order-date">

                <div class="status-label">
                    Data do pedido
                </div>

                <div class="status-value">
                    ${date}
                </div>

            </div>

        </div>


        <div class="order-grid">

            <section>

                <div class="order-section">

                    <h2 class="order-section-title">
                        Produtos
                    </h2>

                    <div class="order-items">
                        ${itemsHTML}
                    </div>

                </div>


                <div class="order-section">

                    <h2 class="order-section-title">
                        Pagamento
                    </h2>

                    <div class="payment-box">

                        <strong>
                            ${
                                order.payment_method === "pix"
                                    ? "PIX"
                                    : (
                                        order.payment_method ||
                                        "Pagamento"
                                    )
                            }
                        </strong>

                        <span>
                            Status:
                            ${translateStatus(order.status)}
                        </span>

                    </div>

                </div>

            </section>


            <aside class="order-summary">

                <div class="summary-title">
                    RESUMO
                </div>

                <div class="summary-row">

                    <span>
                        Produtos
                    </span>

                    <strong>
                        ${orderPrice(order.total)}
                    </strong>

                </div>

                <div class="summary-row">

                    <span>
                        Entrega
                    </span>

                    <strong>
                        ${
                            shippingValue > 0
                                ? orderPrice(shippingValue)
                                : "A calcular"
                        }
                    </strong>

                </div>

                <div class="summary-total">

                    <span>
                        Total
                    </span>

                    <span>
                        ${orderPrice(order.total)}
                    </span>

                </div>


                <div class="order-actions">

                    <a
                        href="pedidos.html"
                        class="order-button"
                    >
                        MEUS PEDIDOS
                    </a>

                    <a
                        href="index.html#shop"
                        class="order-button secondary"
                    >
                        CONTINUAR COMPRANDO
                    </a>

                </div>

            </aside>

        </div>
    `;
}

document.addEventListener(
    "DOMContentLoaded",
    loadOrder
);
