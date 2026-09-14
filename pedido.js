<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Pedido confirmado — NOME</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  >

  <link rel="stylesheet" href="style.css">
</head>

<body>

  <header class="header">

    <a href="index.html" class="brand">
      NOME<span>.</span>
    </a>

    <div class="header-actions">
      <a href="conta.html" class="account-link">
        Conta
      </a>

      <a href="index.html#produtos" class="cart-button">
        Loja
      </a>
    </div>

  </header>


  <main class="order-success-page">

    <section class="order-success">

      <span class="section-label">
        PEDIDO RECEBIDO
      </span>

      <div class="success-icon">
        ✓
      </div>

      <h1>
        COMPRA<br>
        <em>CONFIRMADA.</em>
      </h1>

      <p class="success-text">
        Obrigado por comprar com a NOME.
        Seu pedido foi registrado com sucesso.
      </p>


      <div class="order-card">

        <div class="order-card-row">

          <span>
            PEDIDO
          </span>

          <strong id="orderNumber">
            —
          </strong>

        </div>


        <div class="order-card-row">

          <span>
            STATUS
          </span>

          <strong id="orderStatus">
            Aguardando pagamento
          </strong>

        </div>


        <div class="order-card-row">

          <span>
            PAGAMENTO
          </span>

          <strong id="orderPayment">
            —
          </strong>

        </div>


        <div class="order-card-row">

          <span>
            TOTAL
          </span>

          <strong id="orderTotal">
            R$ 0,00
          </strong>

        </div>

      </div>


      <div class="success-actions">

        <a
          href="pedidos.html"
          class="button button-black"
        >
          VER MEUS PEDIDOS
        </a>

        <a
          href="index.html"
          class="button button-outline"
        >
          VOLTAR PARA A LOJA
        </a>

      </div>

    </section>

  </main>


  <footer>

    <div class="footer-bottom">

      <span>
        © 2026 NOME.
      </span>

      <span>
        TODOS OS DIREITOS RESERVADOS.
      </span>

    </div>

  </footer>


  <script>

    function formatOrderPrice(value) {

      return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

    }


    function loadOrder() {

      const params =
        new URLSearchParams(window.location.search);

      const orderId =
        params.get("id");


      if (!orderId) {
        return;
      }


      let orders = [];

      try {

        orders = JSON.parse(
          localStorage.getItem(
            "nome_streetwear_orders"
          ) || "[]"
        );

      } catch (error) {

        orders = [];

      }


      const order =
        orders.find(
          item => item.id === orderId
        );


      if (!order) {
        return;
      }


      document.getElementById(
        "orderNumber"
      ).textContent = order.id;


      document.getElementById(
        "orderStatus"
      ).textContent =
        order.status || "Aguardando pagamento";


      document.getElementById(
        "orderTotal"
      ).textContent =
        formatOrderPrice(order.total);


      const paymentNames = {
        pix: "PIX",
        card: "Cartão"
      };


      document.getElementById(
        "orderPayment"
      ).textContent =
        paymentNames[order.payment] ||
        order.payment ||
        "—";

    }


    document.addEventListener(
      "DOMContentLoaded",
      loadOrder
    );

  </script>

</body>
</html>
