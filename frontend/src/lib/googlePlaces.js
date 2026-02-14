let googlePlacesPromise;

function buildScriptSrc(apiKey) {
  const params = new URLSearchParams({
    key: apiKey,
    libraries: "places",
  });
  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}

export function loadGooglePlaces(apiKey) {
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps API key"));
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));

  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (googlePlacesPromise) return googlePlacesPromise;

  googlePlacesPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-places="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = buildScriptSrc(apiKey);
    script.dataset.googlePlaces = "1";
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googlePlacesPromise;
}

function getComponent(components, type) {
  if (!Array.isArray(components)) return null;
  return components.find((c) => Array.isArray(c.types) && c.types.includes(type)) || null;
}

export function parseUsAddressComponents(place) {
  const components = place?.address_components || [];

  const streetNumber = getComponent(components, "street_number")?.long_name || "";
  const route = getComponent(components, "route")?.long_name || "";
  const subpremise = getComponent(components, "subpremise")?.long_name || "";

  const locality =
    getComponent(components, "locality")?.long_name ||
    getComponent(components, "postal_town")?.long_name ||
    getComponent(components, "sublocality")?.long_name ||
    "";

  const state = getComponent(components, "administrative_area_level_1")?.short_name || "";
  const postalCode = getComponent(components, "postal_code")?.long_name || "";

  const streetAddress = [streetNumber, route].filter(Boolean).join(" ").trim();
  const streetAddressWithUnit = subpremise ? `${streetAddress} #${subpremise}` : streetAddress;

  return {
    streetAddress: streetAddressWithUnit || "",
    city: locality || "",
    state: state || "",
    postalCode: postalCode || "",
  };
}

