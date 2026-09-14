let currentProduct = null;
let selectedSize = null;


/* =========================================================
   FORMATAÇÃO DE PREÇO
========================================================= */

function formatPrice(value) {

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

}


/* =========================================================
   RENDERIZAR PRODUTOS
========================================================= */

function renderProducts(filter = "todos") {

  const container = document.getElementById("productsGrid");

  if (!container) return;


  const products =
    filter === "todos"
      ? PRODUCTS
      : PRODUCTS.filter(
          product => product.category === filter
        );


  container.innerHTML = products.map(product => `

    <article
      class="product-card"
      onclick="openProduct(${product.id})"
    >

      <div class="product-image">

        <span class="product-tag">
          ${product.tag}
        </span>

        <div class="product-number">
          ${String(product.id).padStart(2, "0")}
        </div>

      </div>


      <div class="product-details">

        <div>

          <h3>
            ${product.name}
          </h3>

          <p>
            ${product.categoryName}
          </p>

        </div>


        <strong>
          ${formatPrice(product.price)}
        </strong>

      </div>

    </article>

  `).join("");

}


/* =========================================================
   FILTROS
========================================================= */

function setupFilters() {

  const filters =
    document.querySelectorAll(".filter");


  filters.forEach(button => {

    button.addEventListener("click", () => {

      filters.forEach(item => {
        item.classList.remove("active");
      });


      button.classList.add("active");


      renderProducts(
        button.dataset.filter
      );

    });

  });

}


/* =========================================================
   ABRIR PRODUTO
========================================================= */

function openProduct(id) {

  currentProduct =
    PRODUCTS.find(product => product.id === id);


  if (!currentProduct) return;


  selectedSize = null;


  document.getElementById("modalName")
    .textContent = currentProduct.name;


  document.getElementById("modalCategory")
    .textContent = currentProduct.categoryName;


  document.getElementById("modalPrice")
    .textContent = formatPrice(
      currentProduct.price
    );


  document.getElementById("modalDescription")
    .textContent = currentProduct.description;


  document.getElementById("modalTag")
    .textContent = currentProduct.tag;


  renderSizes();


  document
    .getElementById("productModal")
    .classList.add("active");


  document.body.classList.add("no-scroll");

}


/* =========================================================
   TAMANHOS
========================================================= */

function renderSizes() {

  const container =
    document.getElementById("sizeOptions");


  container.innerHTML =
    currentProduct.sizes.map(size => `

      <button
        type="button"
        class="size-option"
        onclick="selectSize('${size}')"
      >
        ${size}
      </button>

    `).join("");

}


/* =========================================================
   SELECIONAR TAMANHO
========================================================= */

function selectSize(size) {

  selectedSize = size;


  document
    .querySelectorAll(".size-option")
    .forEach(button => {

      button.classList.toggle(
        "selected",
        button.textContent.trim() === size
      );

    });


  document.getElementById("sizeError")
    .textContent = "";

}


/* =========================================================
   FECHAR PRODUTO
========================================================= */

function closeProduct() {

  document
    .getElementById("productModal")
    .classList.remove("active");


  document.body.classList.remove("no-scroll");

}


/* =========================================================
   ADICIONAR PRODUTO
========================================================= */

function addCurrentProduct() {

  if (!currentProduct) return;


  if (!selectedSize) {

    document.getElementById("sizeError")
      .textContent = "Selecione um tamanho.";

    return;

  }


  addToCart(
    currentProduct,
    selectedSize
  );


  closeProduct();

  openCart();

}


/* =========================================================
   NEWSLETTER
========================================================= */

function subscribe(event) {

  event.preventDefault();


  const form = event.target;


  alert(
    "Você entrou para a lista do DROP."
  );


  form.reset();

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderProducts();

    setupFilters();

    updateCart();

  }
);
