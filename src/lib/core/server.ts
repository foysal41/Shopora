const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// Get Better Auth Bearer token
const getAuthHeaders = (): HeadersInit => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("bearer_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const apiPost = async <T>(
  path: string,
  data: unknown,
  options?: { headers?: HeadersInit },
): Promise<T> => {
  try {
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }

    const url = `${baseUrl}${path}`;

    // console.log("API POST URL:", url);
    // console.log("API POST DATA:", data);

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
      body: JSON.stringify(data),
    });

    // console.log("API RESPONSE STATUS:", response.status);

    const responseText = await response.text();

    // console.log("API RESPONSE:", responseText);

    let result: T & { message?: string };

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned invalid JSON. Status: ${response.status}. Response: ${responseText.slice(
          0,
          300
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message || `Request failed with status ${response.status}`
      );
    }

    return result;
  } catch (error) {
    // console.error("API POST ERROR:", error);

    throw error instanceof Error
      ? error
      : new Error("Something went wrong");
  }
};

export const apiDelete = async <T>(
  path: string,
  options?: { headers?: HeadersInit },
): Promise<T> => {
  try {
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }

    const url = `${baseUrl}${path}`;

    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });

    const responseText = await response.text();

    let result: T & { message?: string };

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned invalid JSON. Status: ${response.status}. Response: ${responseText.slice(
          0,
          300
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message || `Request failed with status ${response.status}`
      );
    }

    return result;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Something went wrong");
  }
};

export const apiGet = async <T>(
  path: string,
  options?: { headers?: HeadersInit },
): Promise<T> => {
  try {
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }

    const url = `${baseUrl}${path}`;

    // console.log("API GET URL:", url);

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    // console.log("API RESPONSE :", responseText);

    let result: T & { message?: string };

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned invalid JSON. Status: ${response.status}. Response: ${responseText.slice(
          0,
          300
        )}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return result;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Something went wrong");
  }
};

export const apiPatch = async <T>(
  endPoint: string,
  body: unknown,
  options?: { headers?: HeadersInit },
): Promise<T> => {

  // console.log("PATCH 1 - Endpoint:", endPoint);
  // console.log("PATCH 1 - Request Body:", body);

  const response = await fetch(`${baseUrl}${endPoint}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  // console.log("PATCH 2 - Response Status:", response.status);
  // console.log("PATCH 2 - Response OK:", response.ok);

  const data = await response.json();

  // console.log("PATCH 3 - Response Data:", data);

  if (!response.ok) {
    // console.log("PATCH 4 - API Error:", data?.message);

    throw new Error(data?.message || "Something went wrong");
  }

  // console.log("PATCH 5 - Success Data:", data);

  return data;
};