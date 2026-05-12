export const t = {
    common: {
        loading: "Loading...",
        pleaseWait: "Please wait...",
        goToDashboard: "Go to dashboard",
    },

    auth: {
        email: "Email",
        password: "Password",
        name: "Name",
        login: "Login",
        signup: "Create account",

        loginTitle: "Welcome back",
        loginSubtitle: "Login to your workspace",
        loginHeroBadge: "Kanban Collaboration",
        loginHeroTitle: "Manage work clearly with Boardly.",
        loginHeroDescription:
        "Organize boards, track cards, invite collaborators, and keep your team aligned.",
        noAccount: "Don't have an account?",
        createAccount: "Create account",

        signupTitle: "Create account",
        signupSubtitle: "You can start now and verify your email later",
        signupHeroBadge: "Start Organized",
        signupHeroTitle: "Create your Boardly workspace.",
        signupHeroDescription:
        "Build boards, manage roles, assign cards, and collaborate with your team.",
        alreadyHaveAccount: "Already have an account?",

        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "At least 8 characters",
        loginPasswordPlaceholder: "Your password",
        namePlaceholder: "Your name",

        loginFailed: "Login failed. Please check your credentials.",
        loginTryAgain: "Login failed. Please try again.",
        signupFailed: "Signup failed. Please check your information.",
        signupTryAgain: "Signup failed. Please try again.",
    },

    verification: {
        title: "Email verification",
        loading: "Verifying your email address...",
        missingToken: "Verification token is missing.",
        success: "Your email has been verified successfully.",
        failed: "Verification failed. The link may be invalid or expired.",
        tryAgain: "Verification failed. Please try again.",

        bannerTitle: "We've sent a verification email.",
        bannerDescription: "Please verify your email to secure your account.",
        resendButton: "Resend Email",
        resendSuccess: "Verification email has been sent again.",
        resendFailed: "Failed to resend verification email.",
    },

    dashboard: {
        appName: "Boardly",
        appSubtitle: "Kanban Workspace",
        eyebrow: "Workspace",
        welcome: "Welcome",
        fallbackUser: "User",
    },
} as const;