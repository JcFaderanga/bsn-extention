const DEFAULT_HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: "https://qa-portal.breachsecurenow.com",
};

/**
 * Safely get cached JSON from localStorage
 */
export function getCached(key) {
	if (!key) return null;

	try {
		const cached = localStorage.getItem(key);
		return cached ? JSON.parse(cached) : null;
	} catch (err) {
		console.warn("Failed to parse cached data:", err);
		return null;
	}
}

/**
 * Standard API request wrapper
 */
export async function Request(method, request = {}) {
	const { url, authorization, body } = request;

	if (!method) {
		return { success: false, error: "HTTP method is required" };
	}

	if (!url) {
		return { success: false, error: "Request URL is required" };
	}

	// Resolve authorization safely
	let token = authorization;

	if (authorization && authorization.length < 255) {
		const cached = getCached(authorization);
		token = cached?.token || null;
	} 

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 15000);

	try {
		const response = await fetch(url, {
			method,
			headers: {
				...DEFAULT_HEADERS,
				...(token ? { authorization: token } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
			signal: controller.signal,
		});

		clearTimeout(timeout);

		let data;
		const contentType = response.headers.get("content-type");

		// Safe JSON parsing
		if (contentType?.includes("application/json")) {
			data = await response.json().catch(() => null);
		} else {
			data = await response.text().catch(() => null);
		}

		if (!response.ok) {
			return {
				success: false,
				status: response.status,
				error: data?.message || data?.description || data || "Request failed",
			};
		}

		return {
			success: true,
			status: response.status,
			data,
		};
	} catch (error) {
		clearTimeout(timeout);

		const isAbort = error.name === "AbortError";

		return {
			success: false,
			error: isAbort ? "Request timeout" : error.message,
		};
	}
}