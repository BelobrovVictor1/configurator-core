import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getLeadsFromDatabase,
  updateLeadStatus,
  type DatabaseLead,
  type LeadStatus,
} from "../lead/leadRepository";

type StatusFilter =
  | "all"
  | LeadStatus;

type ClientFilter =
  | "all"
  | string;

const statusLabels: Record<
  LeadStatus,
  string
> = {
  new: "Nou",
  contacted: "Contactat",
  quoted: "Ofertat",
  won: "Câștigat",
  lost: "Pierdut",
};

function formatMoney(
  value: number,
  currency = "MDL",
) {
  return (
    new Intl.NumberFormat(
      "ro-MD",
      {
        maximumFractionDigits: 0,
      },
    ).format(value) +
    ` ${currency}`
  );
}

function LeadInbox() {
  const [
    leads,
    setLeads,
  ] =
    useState<DatabaseLead[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    updatingLeadId,
    setUpdatingLeadId,
  ] =
    useState<
      string | null
    >(null);

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "all",
    );

  const [
    clientFilter,
    setClientFilter,
  ] =
    useState<ClientFilter>(
      "all",
    );

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getLeadsFromDatabase();

      setLeads(result);
    } catch (loadError) {
      console.error(
        loadError,
      );

      setError(
        loadError instanceof
          Error
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

  const clients =
    useMemo(() => {
      const clientMap =
        new Map<
          string,
          string
        >();

      for (
        const lead of leads
      ) {
        clientMap.set(
          lead.client_id,
          lead.client_name,
        );
      }

      return Array.from(
        clientMap.entries(),
      )
        .map(
          ([
            id,
            name,
          ]) => ({
            id,
            name,
          }),
        )
        .sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
              "ro",
            ),
        );
    }, [leads]);

  const leadsForSelectedClient =
    useMemo(() => {
      if (
        clientFilter ===
        "all"
      ) {
        return leads;
      }

      return leads.filter(
        (lead) =>
          lead.client_id ===
          clientFilter,
      );
    }, [
      leads,
      clientFilter,
    ]);

  const filteredLeads =
    useMemo(() => {
      if (
        statusFilter ===
        "all"
      ) {
        return leadsForSelectedClient;
      }

      return leadsForSelectedClient.filter(
        (lead) =>
          lead.status ===
          statusFilter,
      );
    }, [
      leadsForSelectedClient,
      statusFilter,
    ]);

  const stats =
    useMemo(() => {
      const source =
        leadsForSelectedClient;

      const total =
        source.length;

      const newCount =
        source.filter(
          (lead) =>
            lead.status ===
            "new",
        ).length;

      const contactedCount =
        source.filter(
          (lead) =>
            lead.status ===
            "contacted",
        ).length;

      const quotedCount =
        source.filter(
          (lead) =>
            lead.status ===
            "quoted",
        ).length;

      const wonCount =
        source.filter(
          (lead) =>
            lead.status ===
            "won",
        ).length;

      const lostCount =
        source.filter(
          (lead) =>
            lead.status ===
            "lost",
        ).length;

      const pipelineValue =
        source
          .filter(
            (lead) =>
              lead.status !==
              "lost",
          )
          .reduce(
            (
              totalValue,
              lead,
            ) =>
              totalValue +
              (
                lead.pricing
                  .total ?? 0
              ),
            0,
          );

      const wonValue =
        source
          .filter(
            (lead) =>
              lead.status ===
              "won",
          )
          .reduce(
            (
              totalValue,
              lead,
            ) =>
              totalValue +
              (
                lead.pricing
                  .total ?? 0
              ),
            0,
          );

      const closedCount =
        wonCount +
        lostCount;

      const winRate =
        closedCount > 0
          ? Math.round(
              (
                wonCount /
                closedCount
              ) * 100,
            )
          : 0;

      return {
        total,
        newCount,
        contactedCount,
        quotedCount,
        wonCount,
        lostCount,
        pipelineValue,
        wonValue,
        winRate,
      };
    }, [
      leadsForSelectedClient,
    ]);

  async function handleStatusChange(
    leadId: string,
    status: LeadStatus,
  ) {
    try {
      setUpdatingLeadId(
        leadId,
      );

      setError("");

      await updateLeadStatus(
        leadId,
        status,
      );

      setLeads(
        (
          currentLeads,
        ) =>
          currentLeads.map(
            (lead) =>
              lead.id ===
              leadId
                ? {
                    ...lead,
                    status,
                  }
                : lead,
          ),
      );
    } catch (
      updateError
    ) {
      console.error(
        updateError,
      );

      setError(
        updateError instanceof
          Error
          ? updateError.message
          : "Statusul nu a putut fi actualizat.",
      );
    } finally {
      setUpdatingLeadId(
        null,
      );
    }
  }

  const selectedClientName =
    clientFilter === "all"
      ? "Toate companiile"
      : clients.find(
          (client) =>
            client.id ===
            clientFilter,
        )?.name ??
        clientFilter;

  return (
    <section className="lead-inbox-card">
      <div className="lead-inbox-header">
        <div>
          <h2>
            Lead Dashboard
          </h2>

          <p>
            Lead-uri și performanță
            comercială pentru{" "}
            <strong>
              {
                selectedClientName
              }
            </strong>
            .
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
            : "Reîncarcă datele"}
        </button>
      </div>

      <div className="lead-admin-filters">
        <div className="lead-admin-filter">
          <label
            htmlFor="client-filter"
          >
            Companie
          </label>

          <select
            id="client-filter"
            className="lead-inbox-filter"
            value={
              clientFilter
            }
            onChange={(
              event,
            ) => {
              setClientFilter(
                event.target
                  .value,
              );

              setStatusFilter(
                "all",
              );
            }}
          >
            <option value="all">
              Toate companiile
            </option>

            {clients.map(
              (client) => (
                <option
                  key={
                    client.id
                  }
                  value={
                    client.id
                  }
                >
                  {
                    client.name
                  }
                </option>
              ),
            )}
          </select>
        </div>

        <div className="lead-admin-filter">
          <label
            htmlFor="status-filter"
          >
            Status
          </label>

          <select
            id="status-filter"
            className="lead-inbox-filter"
            value={
              statusFilter
            }
            onChange={(
              event,
            ) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter,
              )
            }
          >
            <option value="all">
              Toate
            </option>

            <option value="new">
              Noi
            </option>

            <option value="contacted">
              Contactate
            </option>

            <option value="quoted">
              Ofertate
            </option>

            <option value="won">
              Câștigate
            </option>

            <option value="lost">
              Pierdute
            </option>
          </select>
        </div>

        <div className="lead-inbox-count">
          {
            filteredLeads.length
          }{" "}
          afișate din{" "}
          {stats.total}
        </div>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>
            Total lead-uri
          </span>

          <strong>
            {stats.total}
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Lead-uri noi
          </span>

          <strong>
            {
              stats.newCount
            }
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Ofertate
          </span>

          <strong>
            {
              stats.quotedCount
            }
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Câștigate
          </span>

          <strong>
            {
              stats.wonCount
            }
          </strong>
        </article>

        <article className="admin-stat-card admin-stat-card-wide">
          <span>
            Pipeline estimativ
          </span>

          <strong>
            {formatMoney(
              stats.pipelineValue,
            )}
          </strong>
        </article>

        <article className="admin-stat-card admin-stat-card-wide">
          <span>
            Valoare câștigată
          </span>

          <strong>
            {formatMoney(
              stats.wonValue,
            )}
          </strong>
        </article>

        <article className="admin-stat-card">
          <span>
            Win rate
          </span>

          <strong>
            {
              stats.winRate
            }
            %
          </strong>
        </article>
      </div>

      <div className="admin-pipeline-strip">
        <span>
          Nou:{" "}
          <strong>
            {
              stats.newCount
            }
          </strong>
        </span>

        <span>
          Contactat:{" "}
          <strong>
            {
              stats.contactedCount
            }
          </strong>
        </span>

        <span>
          Ofertat:{" "}
          <strong>
            {
              stats.quotedCount
            }
          </strong>
        </span>

        <span>
          Câștigat:{" "}
          <strong>
            {
              stats.wonCount
            }
          </strong>
        </span>

        <span>
          Pierdut:{" "}
          <strong>
            {
              stats.lostCount
            }
          </strong>
        </span>
      </div>

      {error && (
        <div className="lead-submit-error">
          {error}
        </div>
      )}

      {!error &&
        loading &&
        leads.length ===
          0 && (
          <div className="lead-inbox-empty">
            Se încarcă
            lead-urile...
          </div>
        )}

      {!error &&
        !loading &&
        leads.length ===
          0 && (
          <div className="lead-inbox-empty">
            Nu există lead-uri
            în baza de date.
          </div>
        )}

      {!loading &&
        leads.length > 0 &&
        filteredLeads.length ===
          0 && (
          <div className="lead-inbox-empty">
            Nu există lead-uri
            pentru filtrele
            selectate.
          </div>
        )}

      {filteredLeads.length >
        0 && (
        <div className="lead-inbox-list">
          {filteredLeads.map(
            (lead) => (
              <article
                className="lead-inbox-item"
                key={lead.id}
              >
                <div className="lead-inbox-item-top">
                  <div>
                    <strong className="lead-customer-name">
                      {
                        lead.customer_name
                      }
                    </strong>

                    <div className="lead-inbox-product">
                      {
                        lead.product_name
                      }
                    </div>

                    <div className="lead-client-chip">
                      {
                        lead.client_name
                      }
                    </div>
                  </div>

                  <div className="lead-inbox-price">
                    {
                      lead.pricing
                        .formattedTotal
                    }
                  </div>
                </div>

                <div className="lead-status-row">
                  <div>
                    <span className="lead-status-label">
                      Status
                    </span>

                    <span
                      className={`lead-status-badge lead-status-${lead.status}`}
                    >
                      {
                        statusLabels[
                          lead.status
                        ]
                      }
                    </span>
                  </div>

                  <select
                    className="lead-status-select"
                    value={
                      lead.status
                    }
                    disabled={
                      updatingLeadId ===
                      lead.id
                    }
                    onChange={(
                      event,
                    ) =>
                      void handleStatusChange(
                        lead.id,
                        event.target
                          .value as LeadStatus,
                      )
                    }
                  >
                    <option value="new">
                      Nou
                    </option>

                    <option value="contacted">
                      Contactat
                    </option>

                    <option value="quoted">
                      Ofertat
                    </option>

                    <option value="won">
                      Câștigat
                    </option>

                    <option value="lost">
                      Pierdut
                    </option>
                  </select>
                </div>

                <div className="lead-inbox-meta">
                  <div>
                    <span>
                      Telefon
                    </span>

                    <strong>
                      {
                        lead.customer_phone
                      }
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
                        lead.preview
                          .label
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
                    Vezi detalii
                  </summary>

                  <div className="lead-details-grid">
                    <div>
                      <span>
                        Companie
                      </span>

                      <strong>
                        {
                          lead.client_name
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Produs
                      </span>

                      <strong>
                        {
                          lead.product_name
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Preț
                      </span>

                      <strong>
                        {
                          lead.pricing
                            .formattedTotal
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Schema
                      </span>

                      <strong>
                        {
                          lead.schema_version
                        }
                      </strong>
                    </div>
                  </div>

                  <h4>
                    Configurație
                  </h4>

                  <pre className="lead-debug-code">
                    {JSON.stringify(
                      lead.configuration,
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}

export default LeadInbox;