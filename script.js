const products = [
  {
    id: 1,
    name: "Essential Tee",
    type: "Camiseta",
    category: "camisetas",
    price: 149.90,
    desc: "Camiseta oversized em algodão premium, gola estruturada e acabamento minimalista.",
    tag: "BEST SELLER"
  },
  {
    id: 2,
    name: "Heavy Hoodie",
    type: "Moletom",
    category: "moletons",
    price: 329.90,
    desc: "Moletom heavyweight de caimento amplo, interior macio e construção robusta.",
    tag: "DROP 01"
  },
  {
    id: 3,
    name: "Core Tee",
    type: "Camiseta",
    category: "camisetas",
    price: 169.90,
    desc: "Silhueta relaxed com algodão encorpado e assinatura discreta.",
    tag: "NEW"
  },
  {
    id: 4,
    name: "Wide Cargo",
    type: "Calça",
    category: "calcas",
    price: 379.90,
    desc: "Calça cargo wide leg com bolsos funcionais e ajuste na cintura.",
    tag: "LIMITED"
  },
  {
    id: 5,
    name: "Boxy Tee",
    type: "Camiseta",
    category: "camisetas",
    price: 159.90,
    desc: "Modelagem boxy e tecido pesado para uma presença mais estruturada.",
    tag: "NEW"
  },
  {
    id: 6,
    name: "Zip Hoodie",
    type: "Moletom",
    category: "moletons",
    price: 349.90,
    desc: "Moletom com zíper, capuz estruturado e acabamento premium.",
    tag: "DROP 01"
  },
  {
    id: 7,
    name: "Relaxed Pant",
    type: "Calça",
    category: "calcas",
    price: 299.90,
    desc: "Calça reta de construção limpa para compor qualquer look.",
    tag: "ESSENTIAL"
  },
  {
    id: 8,
    name: "Signature Cap",
    type: "Acessório",
    category: "acessorios",
    price: 119.90,
    desc: "Boné de seis gomos com bordado minimalista e ajuste traseiro.",
    tag: "NEW"
  }
];

let cart = [];
let currentProduct = null;
let selectedSize = "M";

const money = v =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function renderProducts(filter = "all") {
  const list =
    filter === "all"
      ? products
      : products.filter(p => p.category === filter);

  document.getElementById("products").innerHTML = list
    .map(
      p => `
        <article class="product" onclick="openProduct(${p.id})">
          <div class="product-image">
            <span class="product-tag">${p.tag}</span>
          </div>

          <div class="product-info">
            <div>
              <div class="product-name">${p.name}</div>
              <div class="product-type">${p.type}</div>
            </div>

            <div class="product-price">
              ${money(p.price)}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter")
      .forEach(x => x.classList.remove("active"));

    btn.classList.add("active");

    renderProducts(btn.dataset.filter);
  });
});

function openProduct(id) {
  currentProduct = products.find(p => p.id === id);

  document.getElementById("modalName").textContent =
    currentProduct.name;

  document.getElementById("modalCategory").textContent =
    `${currentProduct.type} — DROP 01`;

 
