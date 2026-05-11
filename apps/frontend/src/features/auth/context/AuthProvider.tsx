import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STORAGE_KEYS } from "../../../app/constants/storage";
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  signupRequest,
} from "../api/authApi";
import type { LoginPayload, SignupPayload } from "../types";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

const AUTH_QUERY_KEY = ["auth", "me"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));

  const { data: user = null, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: getCurrentUserRequest,
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupRequest,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      await loginMutation.mutateAsync(payload);
    },
    [loginMutation]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      await signupMutation.mutateAsync(payload);
    },
    [signupMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isLoggingIn: loginMutation.isPending,
      isSigningUp: signupMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      login,
      signup,
      logout,
    }),
    [
      user,
      isLoading,
      loginMutation.isPending,
      signupMutation.isPending,
      logoutMutation.isPending,
      login,
      signup,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}