import { useEffect, useRef } from "react";
import "./GoogleSignInButton.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_ID = "google-identity-services";

function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve();
            return;
        }

        const existing = document.getElementById(SCRIPT_ID);
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.id = SCRIPT_ID;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
        document.body.appendChild(script);
    });
}

// onSuccess(idToken) — called with Google's raw credential (ID token).
// The parent page sends that to the backend, which verifies it and returns
// our own app JWT, exactly like a password login response.
export default function GoogleSignInButton({ onSuccess, onError }) {
    const containerRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        if (!GOOGLE_CLIENT_ID) {
            console.error(
                "GoogleSignInButton: VITE_GOOGLE_CLIENT_ID is not set in the frontend .env — the button won't render.",
            );
            return;
        }

        loadGoogleScript()
            .then(() => {
                if (cancelled || !containerRef.current || !window.google) return;

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => {
                        if (response?.credential) {
                            onSuccess(response.credential);
                        } else {
                            onError?.(new Error("Google did not return a credential."));
                        }
                    },
                });

                window.google.accounts.id.renderButton(containerRef.current, {
                    theme: "outline",
                    size: "large",
                    width: 320,
                    text: "continue_with",
                });
            })
            .catch((err) => {
                console.error(err);
                onError?.(err);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!GOOGLE_CLIENT_ID) {
        return (
            <div className="google-signin-missing-config">
                Google sign-in isn't configured yet (missing VITE_GOOGLE_CLIENT_ID).
            </div>
        );
    }

    return <div ref={containerRef} className="google-signin-container" />;
}
