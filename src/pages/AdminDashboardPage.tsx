import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../lib/supabase";

import LeadInbox from "../components/LeadInbox";

function AdminDashboardPage() {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [authorized, setAuthorized] =
    useState(false);

  useEffect(() => {
    async function checkAccess() {
      const {
        data:
          sessionData,
      } =
        await supabase.auth.getSession();

      const user =
        sessionData.session
          ?.user;

      if (!user) {
        navigate(
          "/admin/login",
          {
            replace: true,
          },
        );

        return;
      }

      const {
        data:
          adminMembership,
        error,
      } =
        await supabase
          .from(
            "admin_users",
          )
          .select(
            "user_id",
          )
          .eq(
            "user_id",
            user.id,
          )
          .maybeSingle();

      if (
        error ||
        !adminMembership
      ) {
        await supabase.auth.signOut();

        navigate(
          "/admin/login",
          {
            replace: true,
          },
        );

        return;
      }

      setAuthorized(true);
      setLoading(false);
    }

    void checkAccess();
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();

    navigate(
      "/admin/login",
    );
  }

  if (loading) {
    return (
      <main className="admin-page">
        <p>
          Se verifică accesul...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="admin-page">
      <div className="admin-page-header">
        <div>
          <div className="product-switcher-label">
            Admin
          </div>

          <h1>
            Lead Dashboard
          </h1>
        </div>

        <button
          type="button"
          className="lead-inbox-refresh"
          onClick={() =>
            void handleLogout()
          }
        >
          Logout
        </button>
      </div>

      <LeadInbox />
    </main>
  );
}

export default AdminDashboardPage;