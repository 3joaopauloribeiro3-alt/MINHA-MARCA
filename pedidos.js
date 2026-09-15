async function loadOrders() {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href =
            "login.html?next=pedidos.html";

        return;
    }


    const container =
        document.getElementById("ordersList");


    const { data, error } =
        await db
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        container.innerHTML = `
            <div class="empty-state">
                Não foi possível carregar seus pedidos.
            </div>
        `;

        return;
    }


    if (!data || !data.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h2>Você ainda não fez nenhum pedido.</h2>
                <a href="index.html" class="primary-button">
                    IR PARA A LOJA
                </a>
            </div>
        `;

        return;
    }


    container.innerHTML = data.map(order => {

        const date =
            new Date(order.created_at)
                .toLocaleDateString("pt-BR");


        const status =
            order.status || "pending";


        const statusText = {

            pending: "Aguardando pagamento",
            paid: "Pago",
            processing: "Em preparação",
            shipped: "Enviado",
            delivered: "Entregue",
            cancelled: "Cancelado"

        }[status] || status;


        return `

            <a
                href="pedido.html?id=${order.id}"
                class="order-card"
            >

                <div>

                    <span class="order-label">
                        PEDIDO
                    </span>

                    <strong>
                        #${String(order.id).slice(0, 8).toUpperCase()}
                    </strong>

                    <small>
                        ${date}
                    </small>

                </div>


                <div class="order-right">

                    <span>
                        ${statusText}
                    </span>

                    <strong>
                        ${formatPrice(order.total || 0)}
                    </strong>

                    <span>→</span>

                </div>

            </a>

        `;

    }).join("");
}


document.addEventListener(
    "DOMContentLoaded",
    loadOrders
);
