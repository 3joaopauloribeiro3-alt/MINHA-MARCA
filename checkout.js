// =========================================================
// NOME STREETWEAR — CHECKOUT
// =========================================================

const ORDERS_STORAGE_KEY = "nome_streetwear_orders";

let checkoutCart = [];
let checkoutSubtotal = 0;
let checkoutShipping = 19.90;


// =========================================================
// FORMATAÇÃO
// =========================================================

function checkoutFormatPrice(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


// =========================================================
// CARREGAR USUÁRIO
// =========================================================

function loadCheckoutUser() {
  const session = localStorage.getItem("nome_streetwear_session");

  if (!session) {
    window.location.href = "login.html?redirect=checkout.html";
    return null;
  }

  try {
    return JSON.parse(session);
  } catch (error) {
    localStorage.removeItem("nome_streetwear_session");
    window.location.href = "login.html?redirect=checkout.html";
    return null;
  }
}


// =========================================================
// CARREGAR CARRINHO
// =========================================================

function loadCheckoutCart() {
  try {
    const savedCart = localStorage.getItem("nome_streetwear_cart");

    checkoutCart = savedCart
      ? JSON.parse(savedCart)
      : [];

    if (!Array.isArray(checkoutCart)) {
      checkoutCart = [];
    }
  } catch (error) {
    checkoutCart = [];
  }

  calculateCheckoutSubtotal();
}


// =========================================================
// CALCULAR SUBTOTAL
// =========================================================

function calculateCheckoutSubtotal() {
  checkoutSubtotal = checkoutCart.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;

    return total + price * quantity;
  }, 0);
}


// =========================================================
// RENDERIZAR PRODUTOS
// =========================================================

function renderCheckoutItems() {
  const container = document.getElementById("checkoutItems");

  if (!container) return;

  if (checkoutCart.length === 0) {

    container.innerHTML = `
      <div class="checkout-empty">
        <strong>SUA SACOLA ESTÁ VAZIA.</strong>

        <p>
          Adicione produtos antes de continuar.
        </p>

        <a
          href="index.html#produtos"
          class="button button-black"
        >
          IR PARA A LOJA
        </a>
      </div>
    `;

    const submitButton =
      document.querySelector(".checkout-submit");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.style.opacity = "0.5";
      submitButton.style.cursor = "not-allowed";
    }

    return;
  }

  container.innerHTML = checkoutCart.map(item => {

    const subtotal =
      (Number(item.price) || 0) *
      (Number(item.quantity) || 1);

    return `
      <div class="checkout-item">

        <div class="checkout-item-image">
          <span>
            ${String(item.id || "").padStart(2, "0")}
          </span>
        </div>

        <div class="checkout-item-info">

          <strong>
            ${escapeCheckoutHTML(item.name || "Produto")}
          </strong>

          <small>
            Tamanho: ${escapeCheckoutHTML(item.size || "Único")}
          </small>

          <small>
            Quantidade: ${Number(item.quantity) || 1}
          </small>

        </div>

        <strong class="checkout-item-price">
          ${checkoutFormatPrice(subtotal)}
        </strong>

      </div>
    `;

  }).join("");
}


// =========================================================
// ATUALIZAR TOTAIS
// =========================================================

function updateCheckoutTotals() {

  calculateCheckoutSubtotal();

  const shippingElement =
    document.getElementById("checkoutShipping");

  const subtotalElement =
    document.getElementById("checkoutSubtotal");

  const totalElement =
    document.getElementById("checkoutTotal");


  // Frete grátis acima de R$ 299
  // Apenas quando o usuário selecionar a opção grátis.

  const selectedShipping =
    document.querySelector(
      'input[name="shipping"]:checked'
    );

  if (selectedShipping) {

    const selectedValue =
      selectedShipping.value;

    const selectedPrice =
      Number(selectedShipping.dataset.price) || 0;

    if (
      selectedValue === "free" &&
      checkoutSubtotal < 299
    ) {

      checkoutShipping = 19.90;

      showCheckoutMessage(
        "O frete grátis está disponível para pedidos acima de R$ 299.",
        "error"
      );

      const standard =
        document.querySelector(
          'input[name="shipping"][value="standard"]'
        );

      if (standard) {
        standard.checked = true;
      }

    } else {

      checkoutShipping = selectedPrice;

    }
  }


  const total =
    checkoutSubtotal + checkoutShipping;


  if (subtotalElement) {
    subtotalElement.textContent =
      checkoutFormatPrice(checkoutSubtotal);
  }


  if (shippingElement) {

    shippingElement.textContent =
      checkoutShipping === 0
        ? "GRÁTIS"
        : checkoutFormatPrice(checkoutShipping);

  }


  if (totalElement) {
    totalElement.textContent =
      checkoutFormatPrice(total);
  }

}


// =========================================================
// FRETE
// =========================================================

function setupShipping() {

  const options =
    document.querySelectorAll(
      'input[name="shipping"]'
    );

  options.forEach(option => {

    option.addEventListener("change", () => {

      clearCheckoutMessage();

      updateCheckoutTotals();

    });

  });

}


// =========================================================
// MÁSCARA CEP
// =========================================================

function setupCepMask() {

  const cep =
    document.getElementById("checkoutCep");

  if (!cep) return;

  cep.addEventListener("input", event => {

    let value =
      event.target.value.replace(/\D/g, "");

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length > 5) {

      value =
        value.substring(0, 5) +
        "-" +
        value.substring(5);

    }

    event.target.value = value;

  });

}


// =========================================================
// MÁSCARA TELEFONE
// =========================================================

function setupPhoneMask() {

  const phone =
    document.getElementById("checkoutPhone");

  if (!phone) return;

  phone.addEventListener("input", event => {

    let value =
      event.target.value.replace(/\D/g, "");

    if (value.length > 11) {
      value = value.substring(0, 11);
    }

    if (value.length <= 10) {

      value = value.replace(
        /^(\d{2})(\d)/,
        "($1) $2"
      );

      value = value.replace(
        /(\d{4})(\d)/,
        "$1-$2"
      );

    } else {

      value = value.replace(
        /^(\d{2})(\d)/,
        "($1) $2"
      );

      value = value.replace(
        /(\d{5})(\d)/,
        "$1-$2"
      );

    }

    event.target.value = value;

  });

}


// =========================================================
// PREENCHER DADOS DO USUÁRIO
// =========================================================

function fillCheckoutUser(user) {

  if (!user) return;

  const name =
    document.getElementById("checkoutName");

  const email =
    document.getElementById("checkoutEmail");


  if (name && user.name) {
    name.value = user.name;
  }


  if (email && user.email) {
    email.value = user.email;
  }

}


// =========================================================
// VALIDAR CHECKOUT
// =========================================================

function validateCheckout() {

  if (checkoutCart.length === 0) {

    showCheckoutMessage(
      "Sua sacola está vazia.",
      "error"
    );

    return false;
  }


  const form =
    document.getElementById("checkoutForm");

  if (!form) return false;


  if (!form.checkValidity()) {

    form.reportValidity();

    showCheckoutMessage(
      "Confira os dados preenchidos antes de continuar.",
      "error"
    );

    return false;
  }


  const selectedShipping =
    document.querySelector(
      'input[name="shipping"]:checked'
    );


  if (!selectedShipping) {

    showCheckoutMessage(
      "Selecione uma opção de envio.",
      "error"
    );

    return false;
  }


  if (
    selectedShipping.value === "free" &&
    checkoutSubtotal < 299
  ) {

    showCheckoutMessage(
      "O frete grátis está disponível apenas para pedidos acima de R$ 299.",
      "error"
    );

    return false;
  }


  const payment =
    document.querySelector(
      'input[name="payment"]:checked'
    );


  if (!payment) {

    showCheckoutMessage(
      "Selecione uma forma de pagamento.",
      "error"
    );

    return false;
  }


  return true;
}


// =========================================================
// CRIAR PEDIDO
// =========================================================

function createOrder(user) {

  const orders =
    JSON.parse(
      localStorage.getItem(ORDERS_STORAGE_KEY) || "[]"
    );


  const selectedShipping =
    document.querySelector(
      'input[name="shipping"]:checked'
    );


  const selectedPayment =
    document.querySelector(
      'input[name="payment"]:checked'
    );


  const name =
    document.getElementById("checkoutName").value.trim();

  const email =
    document.getElementById("checkoutEmail").value.trim();

  const phone =
    document.getElementById("checkoutPhone").value.trim();

  const cep =
    document.getElementById("checkoutCep").value.trim();

  const address =
    document.getElementById("checkoutAddress").value.trim();

  const number =
    document.getElementById("checkoutNumber").value.trim();

  const complement =
    document.getElementById("checkoutComplement").value.trim();

  const neighborhood =
    document.getElementById("checkoutNeighborhood").value.trim();

  const city =
    document.getElementById("checkoutCity").value.trim();

  const state =
    document.getElementById("checkoutState").value;


  const orderId =
    "NOME-" +
    Date.now().toString().slice(-8);


  const shippingPrice =
    Number(selectedShipping.dataset.price) || 0;


  const total =
    checkoutSubtotal + shippingPrice;


  const order = {

    id: orderId,

    userId:
      user.id ||
      user.email,

    email,

    customerName: name,

    phone,

    date:
      new Date().toISOString(),

    status:
      "Aguardando pagamento",

    payment:
      selectedPayment.value,

    shipping: {

      method:
        selectedShipping.value,

      price:
        shippingPrice,

      cep,

      address,

      number,

      complement,

      neighborhood,

      city,

      state

    },

    items:
      checkoutCart.map(item => ({

        id:
          item.id,

        name:
          item.name,

        price:
          Number(item.price) || 0,

        size:
          item.size || "Único",

        quantity:
          Number(item.quantity) || 1

      })),

    subtotal:
      checkoutSubtotal,

    shippingPrice,

    total

  };


  orders.push(order);


  localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify(orders)
  );


  return order;
}


// =========================================================
// FINALIZAR PEDIDO
// =========================================================

function finishOrder(event) {

  event.preventDefault();

  clearCheckoutMessage();


  const user =
    loadCheckoutUser();

  if (!user) return;


  if (!validateCheckout()) {
    return;
  }


  const button =
    document.querySelector(".checkout-submit");


  if (button) {

    button.disabled = true;

    button.textContent =
      "PROCESSANDO...";

  }


  try {

    const order =
      createOrder(user);


    /*
     * Neste momento o pedido é salvo localmente.
     *
     * O pagamento real será conectado posteriormente
     * através de um gateway/backend.
     */


    localStorage.removeItem(
      "nome_streetwear_cart"
    );


    setTimeout(() => {

      window.location.href =
        "pedido.html?id=" +
        encodeURIComponent(order.id);

    }, 500);


  } catch (error) {

    console.error(
      "Erro ao criar pedido:",
      error
    );


    showCheckoutMessage(
      "Não foi possível criar o pedido. Tente novamente.",
      "error"
    );


    if (button) {

      button.disabled = false;

      button.textContent =
        "CONTINUAR PARA PAGAMENTO →";

    }

  }

}


// =========================================================
// MENSAGENS
// =========================================================

function showCheckoutMessage(
  message,
  type = "error"
) {

  const element =
    document.getElementById("checkoutMessage");

  if (!element) return;


  element.textContent = message;

  element.className =
    "auth-message " +
    type;

  element.style.display =
    "block";

}


function clearCheckoutMessage() {

  const element =
    document.getElementById("checkoutMessage");

  if (!element) return;


  element.textContent = "";

  element.style.display =
    "none";

}


// =========================================================
// ESCAPAR HTML
// =========================================================

function escapeCheckoutHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =========================================================
// INICIALIZAÇÃO
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const user =
      loadCheckoutUser();

    if (!user) return;


    loadCheckoutCart();

    fillCheckoutUser(user);

    renderCheckoutItems();

    setupShipping();

    setupCepMask();

    setupPhoneMask();

    updateCheckoutTotals();

  }
);
