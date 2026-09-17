import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  fetchOptions: {
    credentials: "include",
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


