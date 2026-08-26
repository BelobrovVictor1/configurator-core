import {
  useEffect,
  useState,
} from "react";

import {
  getLeadsFromDatabase,
  type DatabaseLead,
} from "../lead/leadRepository";

function LeadInbox() {
  const [leads, setLeads] =
    useState<DatabaseLead[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getLeadsFromDatabase();

      setLeads(result);
    } catch (loadError) {
      console.error(loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Lead-urile nu au putut fi încărcate.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  return (
    <section className="lead-inbox-card">
      <div className="lead-inbox-header">
        <div>
          <h2>
            Lead Inbox
          </h2>

          <p>
            Lead-uri salvate în
            baza de date Supabase.
          </p>
        </div>

        <button
          type="button"
          className="lead-inbox-refresh"
          onClick={() =>
            void loadLeads()
          }
          disabled={loading}
        >
          {loading
            ? "Se încarcă..."
            : "Reîncarcă lista"}
        </button>
      </div>

      {error && (
        <div className="lead-submit-error">
          {error}
        </div>
      )}

      {!error &&
        loading &&
        leads.length === 0 && (
          <div className="lead-inbox-empty">
            Se încarcă lead-urile...
          </div>
        )}

      {!error &&
        !loading &&
        leads.length === 0 && (
          <div className="lead-inbox-empty">
            Nu există lead-uri în
            baza de date încă.
          </div>
        )}

      {leads.length > 0 && (
        <div className="lead-inbox-list">
          {leads.map((lead) => (
            <article
              className="lead-inbox-item"
              key={lead.id}
            >
              <div className="lead-inbox-item-top">
                <div>
                  <strong>
                    {lead.customer_name}
                  </strong>

                  <div className="lead-inbox-product">
                    {lead.product_name}
                  </div>
                </div>

                <div className="lead-inbox-price">
                  {
                    lead.pricing
                      .formattedTotal
                  }
                </div>
              </div>

              <div className="lead-inbox-meta">
                <div>
                  <span>
                    Telefon
                  </span>

                  <strong>
                    {lead.customer_phone}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {lead.customer_email ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Dimensiuni
                  </span>

                  <strong>
                    {
                      lead.preview.label
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Data
                  </span>

                  <strong>
                    {new Date(
                      lead.created_at,
                    ).toLocaleString(
                      "ro-MD",
                    )}
                  </strong>
                </div>
              </div>

              <details className="lead-inbox-details">
                <summary>
                  Vezi snapshot-ul
                  complet
                </summary>

                <pre className="lead-debug-code">
                  {JSON.stringify(
                    lead,
                    null,
                    2,
                  )}
                </pre>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default LeadInbox;