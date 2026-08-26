import type { ConfigurationState } from "../core/configurationEngine";
import type { PricingResult } from "../pricing/pricingEngine";

type SummaryPanelProps = {
  configuration: ConfigurationState;
  pricing: PricingResult | null;
  isValid: boolean;
};

function SummaryPanel({
  configuration,
  pricing,
  isValid,
}: SummaryPanelProps) {
  return (
    <aside className="summary-panel">
      <h2>Rezumat</h2>

      <div className="summary-price">
        <div className="summary-price-label">
          Preț estimativ
        </div>

        <div className="summary-price-value">
          {isValid && pricing
            ? pricing.formattedTotal
            : "—"}
        </div>
      </div>

      {!isValid && (
        <div className="summary-validation-warning">
          Configurația conține valori invalide.
          Corectează câmpurile marcate pentru a
          calcula prețul.
        </div>
      )}

      {isValid && pricing && (
        <section className="summary-section">
          <h3>Calcul</h3>

          <div className="summary-breakdown">
            {pricing.breakdown.map(
              (item, index) => (
                <div
                  className="summary-breakdown-row"
                  key={`${item.label}-${index}`}
                >
                  <span>{item.label}</span>

                  <strong>
                    {item.formattedValue}
                  </strong>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      <section className="summary-section">
        <h3>Configurație</h3>

        <pre className="configuration-code">
          {JSON.stringify(
            configuration,
            null,
            2,
          )}
        </pre>
      </section>

      <p className="summary-disclaimer">
        Prețul este orientativ. Oferta finală
        va fi confirmată de companie.
      </p>
    </aside>
  );
}

export default SummaryPanel;