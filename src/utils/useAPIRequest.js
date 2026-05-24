const headers = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: "https://qa-portal.breachsecurenow.com",
};
export function getCached(role) {
    const cached = localStorage.getItem(role);
    if (!cached) return null;

    try {
        return JSON.parse(cached);
    } catch {
        return null;
    }
}

export async function Request(method, request) {
  try {
    if (!method) throw new Error("Invalid Method.");
    if (!request) throw new Error("Invalid Request.");

    const { url, authorization: auth, body: bodyRaw } = request;

    const authorization = auth ? `${getCached(auth)?.token}` : {};
    const response = await fetch(url, {
      method,
      headers: { ...headers, authorization },
      body: bodyRaw ? JSON.stringify(bodyRaw) : undefined,
    });

    console.log("response => ",response)

    if (!response.ok) {
      const errorText = await response.text().catch(() => null);
      throw new Error(
        `HTTP error! status: ${response.status} ${errorText || ""}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Request error:", error.message);
    throw error;
  }
}
