export const API_ROUTES = {
    AUTH: {
        LOGIN: "/auth/login",
        SIGNUP: "/auth/signup",
        ME: "/auth/me",
        LOGOUT: "/auth/logout",
        VERIFY_EMAIL: "/auth/verify-email",
        RESEND_VERIFICATION: "/auth/resend-verification",
    },
} as const;