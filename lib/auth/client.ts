"use client";

import { createAuthClient } from "better-auth/react";

import { siteUrl } from "@/lib/utils";

export const authClient = createAuthClient({ baseURL: siteUrl });

export const { signIn, signUp, signOut, useSession } = authClient;
