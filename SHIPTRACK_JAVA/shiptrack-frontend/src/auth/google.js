function loadGsiScript() {

    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () =>
            reject(new Error("Failed to load Google Identity Services."));
        document.head.appendChild(script);
    });
}

export async function initGoogleIdentity(callback) {

    const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.startsWith("PASTE_")) {
        throw new Error(
            "VITE_GOOGLE_CLIENT_ID is not configured in .env"
        );
    }

    await loadGsiScript();

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback,
        auto_select: false
    });
}

export function renderGoogleButton(element) {

    window.google.accounts.id.renderButton(element, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        logo_alignment: "left",
        width: 300
    });
}
