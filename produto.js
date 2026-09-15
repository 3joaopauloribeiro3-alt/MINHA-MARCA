let currentProduct = null;
let selectedSize = null;

function getProductId() {
    return new URLSearchParams(window.location.search).get("id");
}

async function loadProductPage() {
    const id = getProductId();

    if (!id) {
        document.body.innerHTML = `
            <main style="padding:120px 20px;text-align:center">
                <h1>Produto não encontrado</h1>
                <a href="index.html">Voltar para a loja</a>
            </main>
        `;
        return;
    }

    let product = null;

    const { data, error } = await db
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

    if (!error && data) {
        product = normalizeProduct(data);
    }

    if (!product && typeof PRODUCTS !== "undefined") {
        product = PRODUCTS.find(p => String(p.id) === String(id));
    }

    if (!product) {
        document.body.innerHTML = `
            <main style="padding:120px 20px;text-align:center">
                <h1>Produto não encontrado</h1>
                <p>Esse produto não está disponível.</p>
                <a href="index.html">Voltar para a loja</a>
            </main>
        `;
        return;
    }

    currentProduct = product;

    document.title = `${product.name} — GUIP`;

    const image = document.getElementById("productImage");
    const tag = document.getElementById("productTag");
    const category = document.getElementById("productCategory");
    const name = document.getElementById("productName");
    const price = document.getElementById("productPrice");
    const description = document.getElementById("productDescription");
    const sizes = document.getElementById("productSizes");
    const stock = document.getElementById("productStock");

    if (image) {
        image.src = product.image_url || product.image || "";
        image.alt = product.name;
    }

    if (tag) tag.textContent = product.tag || "";
    if (category) category.textContent = product.categoryName || getCategoryName(product.category);
    if (name) name.textContent = product.name;
    if (price) price.textContent = formatPrice(product.price);
    if (description) description.textContent = product.description || "";

    if (stock) {
        stock.textContent = product.stock > 0
            ? `${product.stock} disponíveis`
            : "Produto esgotado";
    }

    if (sizes) {
        sizes.innerHTML = "";

        (product.sizes || []).forEach(size => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "size-option";
            button.textContent = size;

            button.addEventListener("click", () => {
                selectedSize = size;

                document
                    .querySelectorAll(".size-option")
                    .forEach(btn => btn.classList.remove("selected"));

                button.classList.add("selected");

                const error = document.getElementById("sizeError");
                if (error) error.textContent = "";
            });

            sizes.appendChild(button);
        });
    }

    const addButton = document.getElementById("addProduct");

    if (addButton) {
        addButton.onclick = () => {
            if ((product.sizes || []).length && !selectedSize) {
                const error = document.getElementById("sizeError");
                if (error) error.textContent = "Selecione um tamanho.";
                return;
            }

            addToCart(product, selectedSize || "ÚNICO");

            if (typeof showToast === "function") {
                showToast("Produto adicionado ao carrinho.");
            }
        };
    }
}

document.addEventListener("DOMContentLoaded", loadProductPage);
