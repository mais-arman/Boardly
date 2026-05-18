import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { STORAGE_KEYS } from "../../../app/constants/storage";
import { disconnectSocket } from "../../../shared/services/socket";
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  signupRequest,
} from "../api/authApi";
import type { LoginPayload, SignupPayload } from "../types";
import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";

function saveAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

function clearAuthTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));

  const { data: user = null, isLoading } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: getCurrentUserRequest,
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      saveAuthTokens(data.access_token, data.refresh_token);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      saveAuthTokens(data.access_token, data.refresh_token);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      disconnectSocket();
      clearAuthTokens();
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