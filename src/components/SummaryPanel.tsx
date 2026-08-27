import type {
  ConfigurationState,
} from "../core/configurationEngine";

import type {
  PricingResult,
} from "../pricing/pricingEngine";

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
  const width =
    typeof configuration.width === "number"
      ? configuration.width
      : null;

  const height =
    typeof configuration.height === "number"
      ? configuration.height
      : null;

  const profile =
    typeof configuration.profile === "string"
      ? configuration.profile
      : null;

  const material =
    typeof configuration.material === "string"
      ? configuration.material
      : null;

  const color =
    typeof configuration.color === "string"
      ? configuration.color
      : null;

  const installation =
    typeof configuration.installation === "string"
      ? configuration.installation
      : null;

  const profileLabels: Record<
    string,
    string
  > = {
    standard: "Standard",
    premium: "Premium",
    "premium-plus": "Premium Plus",
  };

  const materialLabels: Record<
    string,
    string
  > = {
    "steel-standard": "Oțel Standard",
    "steel-premium": "Oțel Premium",
    aluminium: "Aluminiu",
  };

  const colorLabels: Record<
    string,
    string
  > = {
    white: "Alb",
    anthracite: "Antracit",
    "golden-oak": "Stejar auriu",
    black: "Negru",
    brown: "Maro",
  };

  const installationLabels: Record<
    string,
    string
  > = {
    "product-only": "Doar produs",
    "standard-installation":
      "Produs + montaj standard",
    "premium-installation":
      "Produs + montaj complex",
  };

  return (
    <aside className="summary-panel">
      <h2>
        Rezumat
      </h2>

      <div className="summary-price-label">
        Preț estimativ
      </div>

      <div className="summary-price">
        {pricing
          ? pricing.formattedTotal
          : "—"}
      </div>

      <div className="summary-divider" />

      {!isValid ? (
        <div className="summary-warning">
          Configurația conține valori
          invalide. Corectează câmpurile
          marcate pentru a calcula prețul.
        </div>
      ) : pricing ? (
        <>
          <section className="summary-section">
            <h3>
              Calcul
            </h3>

            <ul className="summary-list">
              {pricing.breakdown.map(
                (item) => (
                  <li
                    key={`${item.label}-${item.formattedValue}`}
                  >
                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {
                        item.formattedValue
                      }
                    </strong>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section className="summary-section">
            <h3>
              Configurația aleasă
            </h3>

            <ul className="summary-list">
              {width !== null &&
                height !== null && (
                  <li>
                    <span>
                      Dimensiuni
                    </span>

                    <strong>
                      {width} × {height} cm
                    </strong>
                  </li>
                )}

              {profile && (
                <li>
                  <span>
                    Profil
                  </span>

                  <strong>
                    {profileLabels[
                      profile
                    ] ?? profile}
                  </strong>
                </li>
              )}

              {material && (
                <li>
                  <span>
                    Material
                  </span>

                  <strong>
                    {materialLabels[
                      material
                    ] ?? material}
                  </strong>
                </li>
              )}

              {color && (
                <li>
                  <span>
                    Culoare
                  </span>

                  <strong>
                    {colorLabels[
                      color
                    ] ?? color}
                  </strong>
                </li>
              )}

              {installation && (
                <li>
                  <span>
                    Serviciu
                  </span>

                  <strong>
                    {installationLabels[
                      installation
                    ] ??
                      installation}
                  </strong>
                </li>
              )}
            </ul>
          </section>
        </>
      ) : null}

      <p className="summary-disclaimer">
        Prețul este orientativ. Oferta
        finală va fi confirmată de
        companie.
      </p>
    </aside>
  );
}

export default SummaryPanel;