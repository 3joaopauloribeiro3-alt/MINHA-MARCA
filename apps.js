/* =========================================================
   GUIP — APP
========================================================= */

let currentProduct = null;
let selectedSize = null;


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("active");

    clearTimeout(
        window.guipToastTimeout
    );

    window.guipToastTimeout =
        setTimeout(() => {

            toast.classList.remove("active");

        }, 2800);

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
    filter = "todos",
    target = "productsGrid"
) {

    const container =
        document.getElementById(target);

    if (!container) return;


    let products = PRODUCTS;


    if (filter !== "todos") {

        products =
            PRODUCTS.filter(
                product =>
                    product.category === filter
            );

    }


    if (!products.length) {

        container.innerHTML = `
            <div class="products-loading">
                NENHUM PRODUTO ENCONTRADO.
            </div>
        `;

        return;

    }


    container.innerHTML =
        products.map(product => `

            <article
                class="product-card"
                onclick="openProduct('${escapeHTML(product.id)}')"
            >

                <div class="product-image">

                    <span class="product-tag">
                        ${escapeHTML(product.tag)}
                    </span>

                    ${
                        product.image_url
                            ? `
                                <img
                                    src="${escapeHTML(product.image_url)}"
                                    alt="${escapeHTML(product.name)}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div class="product-number">
                                    ${String(product.id)
                                        .slice(-2)
                                        .padStart(2, "0")}
                                </div>
                              `
                    }

                </div>


                <div class="product-details">

                    <div>

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p>
                            ${escapeHTML(product.categoryName)}
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
   BEST SELLERS
========================================================= */

function renderFeaturedProducts() {

    const container =
        document.getElementById(
            "featuredProducts"
        );

    if (!container) return;


    const products =
        PRODUCTS
            .filter(
                product =>
                    product.tag === "BEST SELLER" ||
                    product.tag === "DROP 01"
            )
            .slice(0, 3);


    const finalProducts =
        products.length
            ? products
            : PRODUCTS.slice(0, 3);


    container.innerHTML =
        finalProducts.map(product => `

            <article
                class="product-card"
                onclick="openProduct('${escapeHTML(product.id)}')"
            >

                <div class="product-image">

                    <span class="product-tag">
                        ${escapeHTML(product.tag)}
                    </span>

                    ${
                        product.image_url
                            ? `
                                <img
                                    src="${escapeHTML(product.image_url)}"
                                    alt="${escapeHTML(product.name)}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div class="product-number">
                                    ${String(product.id)
                                        .slice(-2)
                                        .padStart(2, "0")}
                                </div>
                              `
                    }

                </div>


                <div class="product-details">

                    <div>

                        <h3>
                            ${escapeHTML(product.name)}
                        </h3>

                        <p>
                            ${escapeHTML(product.categoryName)}
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
   FILTERS
========================================================= */

function setupFilters() {

    const filters =
        document.querySelectorAll(".filter");


    filters.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filters.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );

                renderProducts(
                    button.dataset.filter
                );

            }
        );

    });

}


/* =========================================================
   OPEN PRODUCT
========================================================= */

function openProduct(id) {

    currentProduct =
        PRODUCTS.find(
            product =>
                String(product.id) ===
                String(id)
        );


    if (!currentProduct) return;


    selectedSize = null;


    const modal =
        document.getElementById(
            "productModal"
        );


    document.getElementById(
        "modalName"
    ).textContent =
        currentProduct.name;


    document.getElementById(
        "modalCategory"
    ).textContent =
        currentProduct.categoryName;


    document.getElementById(
        "modalPrice"
    ).textContent =
        formatPrice(
            currentProduct.price
        );


    document.getElementById(
        "modalDescription"
    ).textContent =
        currentProduct.description;


    document.getElementById(
        "modalTag"
    ).textContent =
        currentProduct.tag;


    const imageContainer =
        document.getElementById(
            "modalImage"
        );


    if (currentProduct.image_url) {

        imageContainer.innerHTML = `
            <img
                src="${escapeHTML(
                    currentProduct.image_url
                )}"
                alt="${escapeHTML(
                    currentProduct.name
                )}"
            >
        `;

    } else {

        imageContainer.innerHTML = `
            <div
                style="
                    width:100%;
                    height:100%;
                    min-height:550px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:100px;
                    font-weight:900;
                    color:#dededb;
                "
            >
                G
            </div>
        `;

    }


    renderSizes();


    document.getElementById(
        "sizeError"
    ).textContent = "";


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "no-scroll"
    );

}


/* =========================================================
   SIZES
========================================================= */

function renderSizes() {

    const container =
        document.getElementById(
            "sizeOptions"
        );

    if (!container) return;


    container.innerHTML =
        currentProduct.sizes.map(
            size => `

                <button
                    type="button"
                    class="size-option"
                    onclick="selectSize('${escapeHTML(size)}')"
                >
                    ${escapeHTML(size)}
                </button>

            `
        ).join("");

}


function selectSize(size) {

    selectedSize = size;


    document
        .querySelectorAll(
            ".size-option"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.textContent.trim() ===
                size
            );

        });


    const error =
        document.getElementById(
            "sizeError"
        );

    if (error) {
        error.textContent = "";
    }

}


/* =========================================================
   CLOSE PRODUCT
========================================================= */

function closeProduct() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (!modal) return;


    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================================
   ADD PRODUCT
========================================================= */

function addCurrentProduct() {

    if (!currentProduct) return;


    if (!selectedSize) {

        const error =
            document.getElementById(
                "sizeError"
            );

        if (error) {

            error.textContent =
                "Selecione um tamanho.";

        }

        return;

    }


    if (
        Number(currentProduct.stock) <= 0
    ) {

        showToast(
            "Produto sem estoque."
        );

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
   SEARCH
========================================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );

    const results =
        document.getElementById(
            "searchResults"
        );


    if (!input || !results) return;


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                results.innerHTML = "";

                return;

            }


            const matches =
                PRODUCTS.filter(
                    product =>
                        product.name
                            .toLowerCase()
                            .includes(query) ||
                        product.categoryName
                            .toLowerCase()
                            .includes(query)
                ).slice(0, 6);


            if (!matches.length) {

                results.innerHTML = `
                    <div
                        class="search-result"
                    >
                        NENHUM PRODUTO ENCONTRADO
                    </div>
                `;

                return;

            }


            results.innerHTML =
                matches.map(
                    product => `

                        <button
                            type="button"
                            class="search-result"
                            onclick="
                                closeSearch();
                                openProduct('${escapeHTML(product.id)}');
                            "
                        >
                            <span>
                                ${escapeHTML(product.name)}
                            </span>

                            <strong>
                                ${formatPrice(product.price)}
                            </strong>
                        </button>

                    `
                ).join("");

        }
    );

}


/* =========================================================
   NEWSLETTER
========================================================= */

async function subscribe(event) {

    event.preventDefault();


    const form =
        event.target;


    const input =
        form.querySelector(
            'input[type="email"]'
        );


    if (!input) return;


    const email =
        input.value.trim();


    if (!email) return;


    try {

        if (typeof db !== "undefined") {

            const {
                error
            } = await db
                .from(
                    "newsletter_subscribers"
                )
                .insert({
                    email: email
                });


            if (
                error &&
                !String(error.message)
                    .toLowerCase()
                    .includes("duplicate")
            ) {
                throw error;
            }

        }


        showToast(
            "Você entrou para a lista da GUIP."
        );


        form.reset();


    } catch (error) {

        console.error(
            "Newsletter:",
            error
        );

        showToast(
            "Não foi possível cadastrar agora."
        );

    }

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadProducts();

        renderProducts();

        renderFeaturedProducts();

        setupFilters();

        setupSearch();

        updateCart();

    }
);
