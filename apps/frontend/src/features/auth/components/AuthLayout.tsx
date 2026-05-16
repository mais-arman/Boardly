import type { ReactNode } from "react";

type AuthLayoutProps = {
  badge: string;
  title: string;
  description: string;
  cardTitle: string;
  cardSubtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthLayout({
  badge,
  title,
  description,
  cardTitle,
  cardSubtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="hero-badge">{badge}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span className="brand-mark">B</span>

          <div>
            <h2>{cardTitle}</h2>
            <p>{cardSubtitle}</p>
          </div>
        </div>

        {children}

        <p className="auth-footer">{footer}</p>
      </section>
    </main>
  );
}