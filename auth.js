/* =========================================================
   GUIP — AUTENTICAÇÃO
========================================================= */


/* =========================================================
   CADASTRO
========================================================= */

async function registerUser(
    name,
    email,
    password
) {

    try {

        const {
            data,
            error
        } = await db.auth.signUp({

            email: email,

            password: password,

            options: {
                data: {
                    full_name: name
                }
            }

        });


        if (error) {
            throw error;
        }


        return {
            success: true,
            data
        };


    } catch (error) {

        console.error(
            "Erro no cadastro:",
            error
        );


        return {
            success: false,
            error: error.message
        };

    }

}


/* =========================================================
   LOGIN
========================================================= */

async function loginUser(
    email,
    password
) {

    try {

        const {
            data,
            error
        } = await db.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {
            throw error;
        }


        return {
            success: true,
            data
        };


    } catch (error) {

        console.error(
            "Erro no login:",
            error
        );


        return {
            success: false,
            error: error.message
        };

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    try {

        const {
            error
        } = await db.auth.signOut();


        if (error) {
            throw error;
        }


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

        alert(
            "Não foi possível sair da conta."
        );

    }

}


/* =========================================================
   USUÁRIO ATUAL
========================================================= */

async function getCurrentUser() {

    try {

        const {
            data,
            error
        } = await db.auth.getUser();


        if (error) {
            return null;
        }


        return data.user || null;


    } catch {

        return null;

    }

}


/* =========================================================
   SESSION
========================================================= */

async function getCurrentSession() {

    try {

        const {
            data
        } = await db.auth.getSession();


        return data.session || null;

    } catch {

        return null;

    }

}


/* =========================================================
   REQUIRE LOGIN
========================================================= */

async function requireLogin() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return null;

    }


    return user;

}


/* =========================================================
   PROFILE
========================================================= */

async function getProfile() {

    const user =
        await getCurrentUser();


    if (!user) {
        return null;
    }


    try {

        const {
            data,
            error
        } = await db
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();


        if (error) {
            throw error;
        }


        return data;


    } catch (error) {

        console.error(
            "Erro ao carregar perfil:",
            error
        );

        return null;

    }

}


/* =========================================================
   ADMIN
========================================================= */

async function isAdmin() {

    const profile =
        await getProfile();


    return (
        profile &&
        profile.role === "admin"
    );

}


/* =========================================================
   REQUIRE ADMIN
========================================================= */

async function requireAdmin() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return false;

    }


    const admin =
        await isAdmin();


    if (!admin) {

        alert(
            "Você não possui permissão para acessar esta área."
        );

        window.location.href =
            "index.html";

        return false;

    }


    return true;

}


/* =========================================================
   UPDATE PROFILE
========================================================= */

async function updateProfile(
    updates
) {

    const user =
        await getCurrentUser();


    if (!user) {

        return {
            success: false,
            error: "Usuário não autenticado."
        };

    }


    try {

        const {
            error
        } = await db
            .from("profiles")
            .update(updates)
            .eq("id", user.id);


        if (error) {
            throw error;
        }


        return {
            success: true
        };


    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}


/* =========================================================
   PASSWORD
========================================================= */

async function updatePassword(
    newPassword
) {

    try {

        const {
            error
        } = await db.auth.updateUser({
            password: newPassword
        });


        if (error) {
            throw error;
        }


        return {
            success: true
        };


    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }

}


/* =========================================================
   AUTH STATE
========================================================= */

if (
    typeof db !== "undefined"
) {

    db.auth.onAuthStateChange(
        (event, session) => {

            window.dispatchEvent(
                new CustomEvent(
                    "guip-auth-change",
                    {
                        detail: {
                            event,
                            session
                        }
                    }
                )
            );

        }
    );

}
