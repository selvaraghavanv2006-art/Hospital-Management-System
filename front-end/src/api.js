const BASE_URL = "http://127.0.0.1:8000/api/";

export function getToken() {
  return sessionStorage.getItem("hospital_token");
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response;

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to Django server. Check port 8000."
    );
  }

  if (!response.ok) {
    const details = await response.json().catch(() => null);

    if (response.status === 401 && endpoint !== "auth/login/") {
      sessionStorage.removeItem("hospital_token");

      window.dispatchEvent(
        new Event("hospital:unauthorized")
      );
    }

    let errorMessage = `Request failed: ${response.status}`;

    if (details) {
      errorMessage =
        typeof details === "string"
          ? details
          : JSON.stringify(details);
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}