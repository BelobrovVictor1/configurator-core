import type { ProductSchema } from "../schema/productSchema";
import type { ConfigurationState } from "../core/configurationEngine";

export type PricingBreakdownItem = {
  label: string;
  value: number;
  formattedValue: string;
};

export type PricingResult = {
  subtotal: number;
  total: number;
  currency: string;
  formattedTotal: string;
  breakdown: PricingBreakdownItem[];
};

function convertDimensionToMeters(
  value: number,
  unit: "mm" | "cm" | "m",
): number {
  if (unit === "mm") {
    return value / 1000;
  }

  if (unit === "cm") {
    return value / 100;
  }

  return value;
}

function getNumericConfigurationValue(
  state: ConfigurationState,
  optionId: string,
): number {
  const value = state[optionId];

  if (typeof value !== "number") {
    throw new Error(
      `Pricing requires numeric value for option "${optionId}".`,
    );
  }

  return value;
}

function getOptionModifier(
  schema: ProductSchema,
  state: ConfigurationState,
  optionId: string,
): {
  label: string;
  modifier: number;
} {
  const option = schema.options[optionId];

  if (!option) {
    throw new Error(`Unknown pricing option "${optionId}".`);
  }

  const selectedValue = state[optionId];

  if (typeof selectedValue !== "string") {
    throw new Error(
      `Pricing modifier option "${optionId}" requires a selected string value.`,
    );
  }

  if (
    option.inputType !== "select" &&
    option.inputType !== "color_swatch"
  ) {
    throw new Error(
      `Option "${optionId}" cannot be used as an option multiplier.`,
    );
  }

  const selectedDefinition = option.values.find(
    (candidate) => candidate.id === selectedValue,
  );

  if (!selectedDefinition) {
    throw new Error(
      `Selected value "${selectedValue}" does not exist for option "${optionId}".`,
    );
  }

  return {
    label: selectedDefinition.label,
    modifier: selectedDefinition.priceModifier ?? 1,
  };
}

export function calculatePrice(
  schema: ProductSchema,
  state: ConfigurationState,
): PricingResult {
  const {
    widthOption,
    heightOption,
    pricePerUnit,
    unit,
  } = schema.pricing.base;

  const rawWidth = getNumericConfigurationValue(
    state,
    widthOption,
  );

  const rawHeight = getNumericConfigurationValue(
    state,
    heightOption,
  );

  const widthMeters = convertDimensionToMeters(
    rawWidth,
    unit,
  );

  const heightMeters = convertDimensionToMeters(
    rawHeight,
    unit,
  );

  const area = widthMeters * heightMeters;

  if (area <= 0) {
    throw new Error("Calculated product area must be greater than zero.");
  }

  const basePrice = area * pricePerUnit;

  let total = basePrice;

  const breakdown: PricingBreakdownItem[] = [
    {
      label: "Suprafață",
      value: area,
      formattedValue: `${area.toFixed(2)} m²`,
    },
    {
      label: "Preț de bază",
      value: basePrice,
      formattedValue: `${basePrice.toFixed(2)} ${schema.pricing.currency}`,
    },
  ];

  for (const pricingModifier of schema.pricing.modifiers) {
    const modifierData = getOptionModifier(
      schema,
      state,
      pricingModifier.option,
    );

    total *= modifierData.modifier;

    breakdown.push({
      label: modifierData.label,
      value: modifierData.modifier,
      formattedValue: `× ${modifierData.modifier.toFixed(2)}`,
    });
  }

  return {
    subtotal: basePrice,
    total,
    currency: schema.pricing.currency,
    formattedTotal: new Intl.NumberFormat("ro-MD", {
      maximumFractionDigits: 0,
    }).format(total) + ` ${schema.pricing.currency}`,
    breakdown,
  };
}