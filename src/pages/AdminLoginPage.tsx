import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../lib/supabase";

function AdminLoginPage() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    try {
      setIsSubmitting(true);

      const {
        data,
        error:
          signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email,
            password,
          },
        );

      if (signInError) {
        throw signInError;
      }

      const user =
        data.user;

      if (!user) {
        throw new Error(
          "Autentificarea nu a returnat un utilizator.",
        );
      }

      const {
        data:
          adminMembership,
        error:
          adminError,
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

      if (adminError) {
        throw adminError;
      }

      if (
        !adminMembership
      ) {
        await supabase.auth.signOut();

        throw new Error(
          "Acest cont nu are drepturi de administrator.",
        );
      }

      navigate("/admin");
    } catch (loginError) {
      console.error(
        loginError,
      );

      setError(
        loginError instanceof
          Error
          ? loginError.message
          : "Autentificarea a eșuat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <h1>
          Admin Login
        </h1>

        <p>
          Acces restricționat.
        </p>

        <form
          className="lead-form"
          onSubmit={
            handleSubmit
          }
        >
          <div className="lead-field">
            <label className="lead-label">
              Email
            </label>

            <input
              className="lead-input"
              type="email"
              value={email}
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <div className="lead-field">
            <label className="lead-label">
              Parolă
            </label>

            <input
              className="lead-input"
              type="password"
              value={
                password
              }
              onChange={(
                event,
              ) =>
                setPassword(
                  event.target
                    .value,
                )
              }
            />
          </div>

          <button
            className="lead-submit"
            type="submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Se verifică..."
              : "Autentificare"}
          </button>

          {error && (
            <div className="lead-submit-error">
              {error}
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

export default AdminLoginPage;