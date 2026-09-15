// ============================================================
// GUIP ADMIN — SISTEMA ADMINISTRATIVO
// ============================================================

let currentUser = null;
let productsCache = [];
let editingProductId = null;


// ============================================================
// UTILIDADES
// ============================================================

function formatPrice(value) {

    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// AUTENTICAÇÃO
// ============================================================

async function checkAdmin() {

    const {
        data: {
            session
        }
    } = await db.auth.getSession();


    if (!session) {

        window.location.href = "login.html";

        return;

    }


    currentUser = session.user;


    const {
        data: profile,
        error
    } = await db
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();


    if (error) {

        console.error(error);

        alert(
            "Não foi possível verificar suas permissões."
        );

        window.location.href = "index.html";

        return;

    }


    if (!profile || profile.role !== "admin") {

        alert(
            "Acesso negado. Esta área é somente para administradores."
        );

        window.location.href = "index.html";

        return;

    }


    showAdmin();

    loadDashboard();

    loadProducts();

}


// ============================================================
// MOSTRAR ADMIN
// ============================================================

function showAdmin() {

    document
        .getElementById("loadingScreen")
        .classList.add("hidden");


    document
        .getElementById("adminApp")
        .classList.remove("hidden");


    const email =
        currentUser.email || "Administrador";


    document
        .getElementById("adminEmail")
        .textContent = email;


    document
        .getElementById("accountEmail")
        .textContent = email;

}


// ============================================================
// NAVEGAÇÃO
// ============================================================

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    changeSection(
                        button.dataset.section
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-section]")
        .forEach(button => {

            if (
                button.classList.contains("nav-item")
            ) {
                return;
            }


            button.addEventListener(
                "click",
                () => {

                    changeSection(
                        button.dataset.section
                    );

                }
            );

        });

}


function changeSection(section) {

    document
        .querySelectorAll(".admin-section")
        .forEach(item => {

            item.classList.remove("active");

        });


    const target =
        document.getElementById(
            `section-${section}`
        );


    if (!target) return;


    target.classList.add("active");


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });


    const titles = {

        dashboard: "Dashboard",
        products: "Produtos",
        orders: "Pedidos",
        customers: "Clientes",
        coupons: "Cupons",
        banners: "Banners",
        themes: "Temas",
        settings: "Configurações"

    };


    document
        .getElementById("pageTitle")
        .textContent =
        titles[section] || "Administração";

}


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        const products =
            await db
                .from("products")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (products.count !== null) {

            document
                .getElementById("statProducts")
                .textContent =
                products.count;

        }


        const orders =
            await db
                .from("orders")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (orders.count !== null) {

            document
                .getElementById("statOrders")
                .textContent =
                orders.count;

        }


        const customers =
            await db
                .from("profiles")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (customers.count !== null) {

            document
                .getElementById("statCustomers")
                .textContent =
                customers.count;

        }


        const newsletter =
            await db
                .from("newsletter_subscribers")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (newsletter.count !== null) {

            document
                .getElementById("statNewsletter")
                .textContent =
                newsletter.count;

        }

    } catch (error) {

        console.error(
            "Erro ao carregar dashboard:",
            error
        );

    }

}


// ============================================================
// PRODUTOS
// ============================================================

async function loadProducts() {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );


    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                Carregando produtos...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } = await db
        .from("products")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Erro ao carregar produtos.
                </td>
            </tr>
        `;

        return;

    }


    productsCache = data || [];


    renderProducts(productsCache);

}


function renderProducts(products) {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );


    if (!products.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Nenhum produto cadastrado.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        products.map(product => {

            const active =
                product.is_active !== false;


            return `
                <tr>

                    <td>
                        <div class="product-table-name">
                            ${escapeHTML(
                                product.name
                            )}
                        </div>
                    </td>

                    <td>
                        <span class="product-table-category">
                            ${escapeHTML(
                                product.category || "-"
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="product-price">
                            ${formatPrice(
                                product.price
                            )}
                        </span>
                    </td>

                    <td>
                        ${product.stock ?? 0}
                    </td>

                    <td>

                        <span class="
                            product-status
                            ${active ? "" : "inactive"}
                        ">

                            ${
                                active
                                    ? "Ativo"
                                    : "Inativo"
                            }

                        </span>

                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="table-action"
                                onclick="editProduct('${product.id}')"
                            >
                                Editar
                            </button>

                            <button
                                class="table-action"
                                onclick="deleteProduct('${product.id}')"
                            >
                                Excluir
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


// ============================================================
// BUSCA / FILTRO
// ============================================================

function setupProductFilters() {

    const search =
        document.getElementById(
            "productSearch"
        );


    const status =
        document.getElementById(
            "productStatusFilter"
        );


    function filter() {

        const query =
            search.value
                .trim()
                .toLowerCase();


        const statusValue =
            status.value;


        const filtered =
            productsCache.filter(product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const matchesSearch =
                    !query ||
                    name.includes(query);


                const active =
                    product.is_active !== false;


                const matchesStatus =
                    statusValue === "all" ||
                    (
                        statusValue === "active" &&
                        active
                    ) ||
                    (
                        statusValue === "inactive" &&
                        !active
                    );


                return (
                    matchesSearch &&
                    matchesStatus
                );

            });


        renderProducts(filtered);

    }


    search.addEventListener(
        "input",
        filter
    );


    status.addEventListener(
        "change",
        filter
    );

}


// ============================================================
// MODAL PRODUTO
// ============================================================

function openProductModal(product = null) {

    const modal =
        document.getElementById(
            "productModal"
        );


    const form =
        document.getElementById(
            "productForm"
        );


    form.reset();


    document
        .getElementById(
            "productFormMessage"
        )
        .textContent = "";


    document
        .getElementById(
            "productFormMessage"
        )
        .className =
        "form-message";


    document
        .getElementById(
            "imagePreview"
        )
        .classList.remove("active");


    if (!product) {

        editingProductId = null;


        document
            .getElementById(
                "productModalTitle"
            )
            .textContent =
            "Novo produto";


        document
            .getElementById(
                "productActive"
            )
            .checked = true;


    } else {

        editingProductId =
            product.id;


        document
            .getElementById(
                "productModalTitle"
            )
            .textContent =
            "Editar produto";


        document
            .getElementById(
                "productId"
            )
            .value =
            product.id || "";


        document
            .getElementById(
                "productName"
            )
            .value =
            product.name || "";


        document
            .getElementById(
                "productPrice"
            )
            .value =
            product.price || 0;


        document
            .getElementById(
                "productStock"
            )
            .value =
            product.stock || 0;


        document
            .getElementById(
                "productCategory"
            )
            .value =
            product.category || "";


        document
            .getElementById(
                "productTag"
            )
            .value =
            product.tag || "";


        document
            .getElementById(
                "productDescription"
            )
            .value =
            product.description || "";


        document
            .getElementById(
                "productSizes"
            )
            .value =
            Array.isArray(product.sizes)
                ? product.sizes.join(", ")
                : product.sizes || "";


        document
            .getElementById(
                "productActive"
            )
            .checked =
            product.is_active !== false;


        if (product.image_url) {

            showImagePreview(
                product.image_url
            );

        }

    }


    modal.classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeProductModal() {

    document
        .getElementById(
            "productModal"
        )
        .classList.remove("active");


    document.body.style.overflow = "";

}


// ============================================================
// PREVIEW IMAGEM
// ============================================================

function showImagePreview(url) {

    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML = `
        <img
            src="${escapeHTML(url)}"
            alt="Preview"
        >
    `;


    preview.classList.add("active");

}


function setupImagePreview() {

    const input =
        document.getElementById(
            "productImage"
        );


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];


            if (!file) return;


            const url =
                URL.createObjectURL(file);


            showImagePreview(url);

        }
    );

}


// ============================================================
// UPLOAD IMAGEM
// ============================================================

async function uploadProductImage(file) {

    if (!file) {
        return null;
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const fileName =
        `${crypto.randomUUID()}.${extension}`;


    const path =
        `products/${fileName}`;


    const {
        error
    } = await db
        .storage
        .from("products")
        .upload(
            path,
            file,
            {
                cacheControl: "3600",
                upsert: false
            }
        );


    if (error) {

        console.error(error);

        throw new Error(
            "Não foi possível enviar a imagem."
        );

    }


    const {
        data
    } = db
        .storage
        .from("products")
        .getPublicUrl(path);


    return data.publicUrl;

}


// ============================================================
// SALVAR PRODUTO
// ============================================================

async function saveProduct(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "productFormMessage"
        );


    message.textContent =
        "Salvando produto...";


    message.className =
        "form-message";


    try {

        const name =
            document
                .getElementById(
                    "productName"
                )
                .value
                .trim();


        const price =
            Number(
                document
                    .getElementById(
                        "productPrice"
                    )
                    .value
            );


        const stock =
            Number(
                document
                    .getElementById(
                        "productStock"
                    )
                    .value
            );


        const category =
            document
                .getElementById(
                    "productCategory"
                )
                .value;


        const tag =
            document
                .getElementById(
                    "productTag"
                )
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "productDescription"
                )
                .value
                .trim();


        const sizesText =
            document
                .getElementById(
                    "productSizes"
                )
                .value
                .trim();


        const sizes =
            sizesText
                ? sizesText
                    .split(",")
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean)
                : [];


        const isActive =
            document
                .getElementById(
                    "productActive"
                )
                .checked;


        const imageFile =
            document
                .getElementById(
                    "productImage"
                )
                .files?.[0];


        if (!name) {

            throw new Error(
                "Digite o nome do produto."
            );

        }


        if (price < 0) {

            throw new Error(
                "O preço não pode ser negativo."
            );

        }


        let imageUrl = null;


        if (imageFile) {

            message.textContent =
                "Enviando imagem...";


            imageUrl =
                await uploadProductImage(
                    imageFile
                );

        }


        const payload = {

            name,

            price,

            stock,

            category,

            tag,

            description,

            sizes,

            is_active: isActive

        };


        if (imageUrl) {

            payload.image_url =
                imageUrl;

        }


        message.textContent =
            "Salvando produto...";


        let result;


        if (editingProductId) {

            result =
                await db
                    .from("products")
                    .update(payload)
                    .eq(
                        "id",
                        editingProductId
                    );

        } else {

            result =
                await db
                    .from("products")
                    .insert(payload);

        }


        if (result.error) {

            console.error(
                result.error
            );

            throw new Error(
                result.error.message
            );

        }


        message.textContent =
            "Produto salvo com sucesso!";


        message.classList.add(
            "success"
        );


        await loadProducts();

        await loadDashboard();


        setTimeout(
            closeProductModal,
            700
        );


    } catch (error) {

        console.error(error);


        message.textContent =
            error.message ||
            "Erro ao salvar produto.";


        message.classList.add(
            "error"
        );

    }

}


// ============================================================
// EDITAR
// ============================================================

function editProduct(id) {

    const product =
        productsCache.find(
            item => item.id === id
        );


    if (!product) return;


    openProductModal(product);

}


// ============================================================
// EXCLUIR
// ============================================================

async function deleteProduct(id) {

    const product =
        productsCache.find(
            item => item.id === id
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Excluir "${product.name}"?`
        );


    if (!confirmed) return;


    const {
        error
    } = await db
        .from("products")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Não foi possível excluir o produto."
        );

        return;

    }


    await loadProducts();

    await loadDashboard();

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    await db.auth.signOut();

    window.location.href =
        "login.html";

}


// ============================================================
// EVENTOS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupProductFilters();

        setupImagePreview();


        document
            .getElementById(
                "newProductButton"
            )
            .addEventListener(
                "click",
                () => openProductModal()
            );


        document
            .getElementById(
                "closeProductModal"
            )
            .addEventListener(
                "click",
                closeProductModal
            );


        document
            .getElementById(
                "cancelProduct"
            )
            .addEventListener(
                "click",
                closeProductModal
            );


        document
            .getElementById(
                "productForm"
            )
            .addEventListener(
                "submit",
                saveProduct
            );


        document
            .getElementById(
                "logoutButton"
            )
            .addEventListener(
                "click",
                logout
            );


        document
            .getElementById(
                "productModal"
            )
            .addEventListener(
                "click",
                event => {

                    if (
                        event.target.id ===
                        "productModal"
                    ) {

                        closeProductModal();

                    }

                }
            );


        checkAdmin();

    }
);
