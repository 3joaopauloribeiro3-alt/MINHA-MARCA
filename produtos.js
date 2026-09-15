/* =========================================================
   GUIP — PRODUTOS
========================================================= */

let PRODUCTS = [];

const DEMO_PRODUCTS = [
    {
        id: "demo-1",
        name: "Heavy Essential Tee",
        category: "camisetas",
        categoryName: "Camiseta",
        price: 149.90,
        stock: 10,
        tag: "BEST SELLER",
        sizes: ["P", "M", "G", "GG"],
        description:
            "Camiseta oversized produzida em algodão pesado, com gola estruturada e construção premium.",
        image_url: ""
    },
    {
        id: "demo-2",
        name: "Signature Hoodie",
        category: "moletons",
        categoryName: "Moletom",
        price: 329.90,
        stock: 10,
        tag: "DROP 01",
        sizes: ["P", "M", "G", "GG"],
        description:
            "Moletom heavyweight de caimento amplo, interior macio e acabamento premium.",
        image_url: ""
    },
    {
        id: "demo-3",
        name: "Core Boxy Tee",
        category: "camisetas",
        categoryName: "Camiseta",
        price: 169.90,
        stock: 10,
        tag: "NEW",
        sizes: ["P", "M", "G", "GG"],
        description:
            "Modelagem boxy com tecido encorpado e proporções contemporâneas.",
        image_url: ""
    },
    {
        id: "demo-4",
        name: "Wide Cargo",
        category: "calcas",
        categoryName: "Calça",
        price: 379.90,
        stock: 10,
        tag: "LIMITED",
        sizes: ["36", "38", "40", "42", "44"],
        description:
            "Calça cargo de modelagem ampla com bolsos funcionais e acabamento resistente.",
        image_url: ""
    },
    {
        id: "demo-5",
        name: "Essential Tee",
        category: "camisetas",
        categoryName: "Camiseta",
        price: 139.90,
        stock: 10,
        tag: "ESSENTIAL",
        sizes: ["P", "M", "G", "GG"],
        description:
            "Uma camiseta essencial para qualquer composição.",
        image_url: ""
    },
    {
        id: "demo-6",
        name: "Zip Heavy Hoodie",
        category: "moletons",
        categoryName: "Moletom",
        price: 349.90,
        stock: 10,
        tag: "DROP 01",
        sizes: ["P", "M", "G", "GG"],
        description:
            "Moletom com fechamento frontal, capuz estruturado e construção heavyweight.",
        image_url: ""
    }
];


/* =========================================================
   NORMALIZAR
========================================================= */

function normalizeProduct(product) {

    return {
        ...product,

        id: product.id,

        name: product.name || "Produto GUIP",

        category: product.category || "outros",

        categoryName:
            product.category_name ||
            getCategoryName(product.category),

        price: Number(product.price || 0),

        stock: Number(product.stock || 0),

        tag: product.tag || "GUIP",

        sizes:
            Array.isArray(product.sizes)
                ? product.sizes
                : typeof product.sizes === "string"
                    ? product.sizes
                        .split(",")
                        .map(item => item.trim())
                        .filter(Boolean)
                    : ["ÚNICO"],

        description:
            product.description ||
            "Produto oficial GUIP.",

        image_url:
            product.image_url || ""
    };
}


function getCategoryName(category) {

    const categories = {
        camisetas: "Camiseta",
        moletons: "Moletom",
        calcas: "Calça",
        acessorios: "Acessório"
    };

    return categories[category] || "Produto";

}


/* =========================================================
   CARREGAR
========================================================= */

async function loadProducts() {

    try {

        if (
            typeof db === "undefined"
        ) {
            PRODUCTS = DEMO_PRODUCTS.map(normalizeProduct);
            return PRODUCTS;
        }

        const {
            data,
            error
        } = await db
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        if (!data || !data.length) {
            PRODUCTS = DEMO_PRODUCTS.map(normalizeProduct);
        } else {
            PRODUCTS = data.map(normalizeProduct);
        }

    } catch (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        PRODUCTS = DEMO_PRODUCTS.map(normalizeProduct);

    }

    return PRODUCTS;
}


/* =========================================================
   FORMATAR PREÇO
========================================================= */

function formatPrice(value) {

    return Number(value || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   IMAGEM
========================================================= */

function productImageHTML(product, className = "") {

    if (product.image_url) {

        return `
            <img
                src="${escapeHTML(product.image_url)}"
                alt="${escapeHTML(product.name)}"
                class="${className}"
                loading="lazy"
            >
        `;

    }

    return `
        <div class="product-number">
            ${String(product.id)
                .slice(-2)
                .padStart(2, "0")}
        </div>
    `;

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
