const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

let loadingPromise = null;

export function loadGeoapifyAutocomplete() {
    if (window.GeoapifyAutocomplete) {
        return Promise.resolve(window.GeoapifyAutocomplete);
    }
    if (loadingPromise) {
        return loadingPromise;
    }
    loadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.geoapify.com/js/geoa-autocomplete.js';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.GeoapifyAutocomplete);
        script.onerror = (err) => {
            loadingPromise = null;
            reject(new Error('Failed to load Geoapify Autocomplete', err));
        };
        document.head.appendChild(script);
    });
    return loadingPromise;
}

export function hasApiKey() {
    return GEOAPIFY_API_KEY && GEOAPIFY_API_KEY.length > 0;
}
