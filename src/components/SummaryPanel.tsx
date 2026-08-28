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

const valueLabels: Record<
  string,
  string
> = {
  standard: "Standard",
  premium: "Premium",
  "premium-plus": "Premium Plus",

  white: "Alb",
  anthracite: "Antracit",
  "golden-oak": "Stejar auriu",
  black: "Negru",
  brown: "Maro",
  green: "Verde",

  "steel-standard":
    "Oțel Standard",

  "steel-premium":
    "Oțel Premium",

  aluminium:
    "Aluminiu",

  "product-only":
    "Doar produs",

  "standard-installation":
    "Produs + montaj standard",

  "premium-installation":
    "Produs + montaj complex",

  "panel-2d":
    "Panou 2D",

  "panel-3d":
    "Panou 3D",

  "panel-3d-premium":
    "Panou 3D Premium",

  "height-123":
    "1,23 m",

  "height-153":
    "1,53 m",

  "height-173":
    "1,73 m",

  "height-203":
    "2,03 m",

  none:
    "Fără",

  "gate-3m":
    "Poartă 3 m",

  "gate-4m":
    "Poartă 4 m",

  "gate-5m":
    "Poartă 5 m",

  "wicket-1m":
    "Portiță 1 m",

  "wicket-12m":
    "Portiță 1,2 m",
};

const optionLabels: Record<
  string,
  string
> = {
  width:
    "Lățime",

  height:
    "Înălțime",

  profile:
    "Profil",

  material:
    "Material",

  color:
    "Culoare",

  installation:
    "Serviciu",

  fenceLength:
    "Lungime totală",

  panelType:
    "Tip panou",

  fenceHeight:
    "Înălțime gard",

  vehicleGate:
    "Poartă auto",

  pedestrianGate:
    "Portiță",
};

function formatConfigurationValue(
  optionId: string,
  value: string | number,
): string {
  if (
    typeof value === "string"
  ) {
    return (
      valueLabels[value] ??
      value
    );
  }

  if (
    optionId ===
    "fenceLength"
  ) {
    return `${value} m`;
  }

  if (
    optionId ===
      "width" ||
    optionId ===
      "height"
  ) {
    return `${value} cm`;
  }

  return String(value);
}

function SummaryPanel({
  configuration,
  pricing,
  isValid,
}: SummaryPanelProps) {
  const configurationEntries =
    Object.entries(
      configuration,
    ).filter(
      (
        entry,
      ): entry is [
        string,
        string | number,
      ] =>
        typeof entry[1] ===
          "string" ||
        typeof entry[1] ===
          "number",
    );

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
          Configurația conține
          valori invalide.
          Corectează câmpurile
          marcate pentru a calcula
          prețul.
        </div>
      ) : pricing ? (
        <>
          <section className="summary-section">
            <h3>
              Calcul
            </h3>

            <ul className="summary-list">
              {pricing.breakdown.map(
                (
                  item,
                  index,
                ) => (
                  <li
                    key={`${item.label}-${index}`}
                  >
                    <span>
                      {
                        item.label
                      }
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
              {configurationEntries.map(
                ([
                  optionId,
                  value,
                ]) => (
                  <li
                    key={
                      optionId
                    }
                  >
                    <span>
                      {optionLabels[
                        optionId
                      ] ??
                        optionId}
                    </span>

                    <strong>
                      {formatConfigurationValue(
                        optionId,
                        value,
                      )}
                    </strong>
                  </li>
                ),
              )}
            </ul>
          </section>
        </>
      ) : null}

      <p className="summary-disclaimer">
        Prețul este orientativ.
        Oferta finală va fi
        confirmată de companie.
      </p>
    </aside>
  );
}

export default SummaryPanel;