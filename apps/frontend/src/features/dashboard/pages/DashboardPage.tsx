import { useAuth } from "../../auth/hooks/useAuth";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <main className="dashboard-shell">
        <aside className="sidebar">
            <div className="brand">
            <span className="brand-mark">B</span>
            <div>
                <span>Boardly</span>
                <small>Kanban Workspace</small>
            </div>
            </div>
        </aside>

        <section className="dashboard-content">
            <header className="dashboard-header">
            <div>
                <p className="eyebrow">Workspace</p>
                <h1>Welcome, {user?.name || "User"}</h1>
            </div>
            </header>
        </section>
        </main>
    );
}