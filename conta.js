async function loadAccount() {

    const user = await getCurrentUser();

    if (!user) {
        window.location.href =
            "login.html?next=conta.html";
        return;
    }

    const profile = await getProfile();

    const nameInput =
        document.getElementById("accountName");

    const emailInput =
        document.getElementById("accountEmail");

    const phoneInput =
        document.getElementById("accountPhone");

    const userEmail =
        document.getElementById("accountUserEmail");

    if (nameInput)
        nameInput.value =
            profile?.full_name || profile?.name || "";

    if (phoneInput)
        phoneInput.value =
            profile?.phone || "";

    if (emailInput)
        emailInput.value =
            user.email || "";

    if (userEmail)
        userEmail.textContent =
            user.email || "";

    const adminLink =
        document.getElementById("adminLink");

    if (adminLink && profile?.role === "admin") {
        adminLink.style.display = "block";
    }
}


async function saveAccount(event) {

    event.preventDefault();

    const message =
        document.getElementById("accountMessage");

    const name =
        document.getElementById("accountName").value.trim();

    const phone =
        document.getElementById("accountPhone").value.trim();


    const result =
        await updateProfile({
            full_name: name,
            phone: phone
        });


    if (!result.success) {

        message.textContent =
            result.error || "Erro ao salvar.";

        return;
    }


    message.textContent =
        "Dados atualizados com sucesso.";
}


async function logoutAccount() {

    await logoutUser();

    window.location.href =
        "index.html";
}


document.addEventListener(
    "DOMContentLoaded",
    loadAccount
);
