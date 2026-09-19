import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,

  fetchOptions: {
    credentials: "include",

    // Store Better Auth Bearer token after successful authentication
    onSuccess: (ctx) => {
      if (typeof window !== "undefined") {
        const authToken = ctx.response.headers.get("set-auth-token");

        if (authToken) {
          localStorage.setItem("bearer_token", authToken);
        }
      }
    },

    // Send Bearer token with Better Auth requests
    auth: {
      type: "Bearer",
      token: () => {
        if (typeof window === "undefined") {
          return "";
        }

        return localStorage.getItem("bearer_token") || "";
      },
    },
  },

  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
} = authClient;

export const { useSession } = authClient;