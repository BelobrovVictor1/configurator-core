import type { LeadSnapshot } from "../lead/leadEngine";

type LeadDebugPanelProps = {
  lead: LeadSnapshot | null;
};

function LeadDebugPanel({
  lead,
}: LeadDebugPanelProps) {
  if (!lead) {
    return null;
  }

  return (
    <section className="lead-debug-card">
      <div className="lead-debug-header">
        <div>
          <h2>
            Ultimul lead salvat
          </h2>

          <p>
            Acesta este snapshot-ul
            complet pe care îl vom
            trimite ulterior către
            backend.
          </p>
        </div>

        <div className="lead-debug-status">
          SAVED
        </div>
      </div>

      <pre className="lead-debug-code">
        {JSON.stringify(
          lead,
          null,
          2,
        )}
      </pre>
    </section>
  );
}

export default LeadDebugPanel;