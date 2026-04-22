import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000/api";

export const http = axios.create({
  baseURL: API_BASE_URL,
});

function getTokens() {
  try {
    return {
      access: localStorage.getItem("access_token") || "",
      refresh: localStorage.getItem("refresh_token") || "",
    };
  } catch {
    return { access: "", refresh: "" };
  }
}

function setAccessToken(token) {
  try {
    localStorage.setItem("access_token", token || "");
  } catch {}
}

function clearTokens() {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  } catch {}
}

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (
    config.data !== undefined &&
    config.data !== null &&
    typeof config.data === "object" &&
    !(config.data instanceof URLSearchParams)
  ) {
    config.headers["Content-Type"] = "application/json";
  }
  const { access } = getTokens();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshing = null;

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status !== 401 || !original || original._retry) {
      throw error;
    }

    original._retry = true;

    const { refresh } = getTokens();
    if (!refresh) {
      clearTokens();
      throw error;
    }

    try {
      if (!refreshing) {
        refreshing = http
          .post("/auth/refresh/", { refresh_token: refresh })
          .then((r) => r.data)
          .finally(() => {
            refreshing = null;
          });
      }

      const data = await refreshing;
      const newAccess = data?.access_token || data?.accessToken;
      if (!newAccess) {
        clearTokens();
        throw error;
      }

      setAccessToken(newAccess);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return http(original);
    } catch (e) {
      clearTokens();
      throw e;
    }
  }
);

