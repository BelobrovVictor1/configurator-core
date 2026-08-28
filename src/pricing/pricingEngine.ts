import type {
  ProductSchema,
} from "../schema/productSchema";

import type {
  ConfigurationState,
} from "../core/configurationEngine";

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
  const value =
    state[optionId];

  if (
    typeof value !== "number"
  ) {
    throw new Error(
      `Pricing requires numeric value for option "${optionId}".`,
    );
  }

  return value;
}

function getSelectedOptionDefinition(
  schema: ProductSchema,
  state: ConfigurationState,
  optionId: string,
) {
  const option =
    schema.options[
      optionId
    ];

  if (!option) {
    throw new Error(
      `Unknown pricing option "${optionId}".`,
    );
  }

  const selectedValue =
    state[optionId];

  if (
    typeof selectedValue !==
    "string"
  ) {
    throw new Error(
      `Pricing option "${optionId}" requires a selected string value.`,
    );
  }

  if (
    option.inputType !==
      "select" &&
    option.inputType !==
      "color_swatch"
  ) {
    throw new Error(
      `Option "${optionId}" cannot be used as a pricing selection.`,
    );
  }

  const selectedDefinition =
    option.values.find(
      (candidate) =>
        candidate.id ===
        selectedValue,
    );

  if (
    !selectedDefinition
  ) {
    throw new Error(
      `Selected value "${selectedValue}" does not exist for option "${optionId}".`,
    );
  }

  return selectedDefinition;
}

function formatMoney(
  value: number,
  currency: string,
): string {
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

function applyPricingModifiers(
  schema: ProductSchema,
  state: ConfigurationState,
  startingTotal: number,
  breakdown: PricingBreakdownItem[],
): number {
  let total =
    startingTotal;

  for (
    const modifier of
    schema.pricing.modifiers
  ) {
    const selectedDefinition =
      getSelectedOptionDefinition(
        schema,
        state,
        modifier.option,
      );

    if (
      modifier.type ===
      "option_multiplier"
    ) {
      const multiplier =
        selectedDefinition
          .priceModifier ?? 1;

      total *=
        multiplier;

      breakdown.push({
        label:
          selectedDefinition
            .label,

        value:
          multiplier,

        formattedValue:
          `× ${multiplier.toFixed(2)}`,
      });

      continue;
    }

    if (
      modifier.type ===
      "option_addition"
    ) {
      const addition =
        selectedDefinition
          .priceAddon ?? 0;

      total +=
        addition;

      if (
        addition > 0
      ) {
        breakdown.push({
          label:
            selectedDefinition
              .label,

          value:
            addition,

          formattedValue:
            `+ ${formatMoney(
              addition,
              schema.pricing
                .currency,
            )}`,
        });
      }
    }
  }

  return total;
}

function calculateAreaPrice(
  schema: ProductSchema,
  state: ConfigurationState,
): PricingResult {
  const base =
    schema.pricing.base;

  if (
    base.type !== "area"
  ) {
    throw new Error(
      "Area pricing expected.",
    );
  }

  const rawWidth =
    getNumericConfigurationValue(
      state,
      base.widthOption,
    );

  const rawHeight =
    getNumericConfigurationValue(
      state,
      base.heightOption,
    );

  const widthMeters =
    convertDimensionToMeters(
      rawWidth,
      base.unit,
    );

  const heightMeters =
    convertDimensionToMeters(
      rawHeight,
      base.unit,
    );

  const area =
    widthMeters *
    heightMeters;

  if (
    area <= 0
  ) {
    throw new Error(
      "Calculated product area must be greater than zero.",
    );
  }

  const basePrice =
    area *
    base.pricePerUnit;

  const breakdown:
    PricingBreakdownItem[] =
    [
      {
        label:
          "Suprafață",

        value:
          area,

        formattedValue:
          `${area.toFixed(2)} m²`,
      },

      {
        label:
          "Preț de bază",

        value:
          basePrice,

        formattedValue:
          `${basePrice.toFixed(
            2,
          )} ${
            schema.pricing
              .currency
          }`,
      },
    ];

  const total =
    applyPricingModifiers(
      schema,
      state,
      basePrice,
      breakdown,
    );

  return {
    subtotal:
      basePrice,

    total,

    currency:
      schema.pricing
        .currency,

    formattedTotal:
      formatMoney(
        total,
        schema.pricing
          .currency,
      ),

    breakdown,
  };
}

function calculateModularPrice(
  schema: ProductSchema,
  state: ConfigurationState,
): PricingResult {
  const base =
    schema.pricing.base;

  if (
    base.type !==
    "modular"
  ) {
    throw new Error(
      "Modular pricing expected.",
    );
  }

  const rawTotalLength =
    getNumericConfigurationValue(
      state,
      base.lengthOption,
    );

  const totalLengthMeters =
    convertDimensionToMeters(
      rawTotalLength,
      base.unit,
    );

  const moduleWidthMeters =
    convertDimensionToMeters(
      base.moduleWidth,
      base.unit,
    );

  let totalDeductionMeters =
    0;

  for (
    const optionId of
    base.deductionOptions
  ) {
    const selectedDefinition =
      getSelectedOptionDefinition(
        schema,
        state,
        optionId,
      );

    const rawDeduction =
      selectedDefinition
        .lengthDeduction ?? 0;

    totalDeductionMeters +=
      convertDimensionToMeters(
        rawDeduction,
        base.unit,
      );
  }

  const effectiveFenceLength =
    totalLengthMeters -
    totalDeductionMeters;

  if (
    totalLengthMeters <= 0
  ) {
    throw new Error(
      "Total fence length must be greater than zero.",
    );
  }

  if (
    effectiveFenceLength <= 0
  ) {
    throw new Error(
      "Gate and wicket deductions cannot consume the entire fence length.",
    );
  }

  const moduleCount =
    Math.ceil(
      effectiveFenceLength /
        moduleWidthMeters,
    );

  const postCount =
    moduleCount + 1;

  const clipCount =
    moduleCount *
    base.clipsPerModule;

  const modulesCost =
    moduleCount *
    base.modulePrice;

  const postsCost =
    postCount *
    base.postPrice;

  const clipsCost =
    clipCount *
    base.clipPrice;

  const basePrice =
    modulesCost +
    postsCost +
    clipsCost;

  const breakdown:
    PricingBreakdownItem[] =
    [
      {
        label:
          "Lungime totală",

        value:
          totalLengthMeters,

        formattedValue:
          `${totalLengthMeters.toFixed(
            2,
          )} m`,
      },

      {
        label:
          "Lungime ocupată de poartă/portiță",

        value:
          totalDeductionMeters,

        formattedValue:
          `${totalDeductionMeters.toFixed(
            2,
          )} m`,
      },

      {
        label:
          "Lungime din panouri",

        value:
          effectiveFenceLength,

        formattedValue:
          `${effectiveFenceLength.toFixed(
            2,
          )} m`,
      },

      {
        label:
          "Panouri",

        value:
          moduleCount,

        formattedValue:
          `${moduleCount} buc. × ${formatMoney(
            base.modulePrice,
            schema.pricing
              .currency,
          )}`,
      },

      {
        label:
          "Stâlpi",

        value:
          postCount,

        formattedValue:
          `${postCount} buc. × ${formatMoney(
            base.postPrice,
            schema.pricing
              .currency,
          )}`,
      },

      {
        label:
          "Elemente de fixare",

        value:
          clipCount,

        formattedValue:
          `${clipCount} buc. × ${formatMoney(
            base.clipPrice,
            schema.pricing
              .currency,
          )}`,
      },

      {
        label:
          "Subtotal structură",

        value:
          basePrice,

        formattedValue:
          formatMoney(
            basePrice,
            schema.pricing
              .currency,
          ),
      },
    ];

  const total =
    applyPricingModifiers(
      schema,
      state,
      basePrice,
      breakdown,
    );

  return {
    subtotal:
      basePrice,

    total,

    currency:
      schema.pricing
        .currency,

    formattedTotal:
      formatMoney(
        total,
        schema.pricing
          .currency,
      ),

    breakdown,
  };
}

function calculateModularSegmentsPrice(
  schema: ProductSchema,
  state: ConfigurationState,
): PricingResult {
  const base =
    schema.pricing.base;

  if (
    base.type !==
    "modular_segments"
  ) {
    throw new Error(
      "Segment modular pricing expected.",
    );
  }

  const moduleWidthMeters =
    convertDimensionToMeters(
      base.moduleWidth,
      base.unit,
    );

  const rawSegments =
    base.segmentOptions.map(
      (optionId) => ({
        optionId,

        lengthMeters:
          convertDimensionToMeters(
            getNumericConfigurationValue(
              state,
              optionId,
            ),
            base.unit,
          ),
      }),
    );

  const positiveSegments =
    rawSegments.filter(
      (segment) =>
        segment.lengthMeters >
        0,
    );

  if (
    positiveSegments.length ===
    0
  ) {
    throw new Error(
      "At least one fence segment must be greater than zero.",
    );
  }

  let totalDeductionMeters =
    0;

  for (
    const optionId of
    base.deductionOptions
  ) {
    const selectedDefinition =
      getSelectedOptionDefinition(
        schema,
        state,
        optionId,
      );

    totalDeductionMeters +=
      convertDimensionToMeters(
        selectedDefinition
          .lengthDeduction ?? 0,
        base.unit,
      );
  }

  const totalLengthMeters =
    positiveSegments.reduce(
      (
        sum,
        segment,
      ) =>
        sum +
        segment.lengthMeters,
      0,
    );

  if (
    totalDeductionMeters >=
    totalLengthMeters
  ) {
    throw new Error(
      "Gate and wicket deductions cannot consume the entire fence length.",
    );
  }

  /*
   * V1 rule:
   * deductions are applied against the first
   * positive segment. This is explicit and
   * deterministic, but later we should let the
   * user specify on which segment each gate sits.
   */
  const adjustedSegments =
    positiveSegments.map(
      (
        segment,
        index,
      ) => ({
        ...segment,

        adjustedLength:
          index === 0
            ? Math.max(
                0,
                segment.lengthMeters -
                  totalDeductionMeters,
              )
            : segment.lengthMeters,
      }),
    );

  const segmentResults =
    adjustedSegments.map(
      (
        segment,
        index,
      ) => ({
        index:
          index + 1,

        length:
          segment.adjustedLength,

        modules:
          segment.adjustedLength >
          0
            ? Math.ceil(
                segment.adjustedLength /
                  moduleWidthMeters,
              )
            : 0,
      }),
    );

  const moduleCount =
    segmentResults.reduce(
      (
        sum,
        segment,
      ) =>
        sum +
        segment.modules,
      0,
    );

  /*
   * Each separate segment needs its own
   * start/end posts, then cornerPostExtra can
   * account for project-specific corner logic.
   */
  const postCount =
    segmentResults.reduce(
      (
        sum,
        segment,
      ) =>
        sum +
        (
          segment.modules >
          0
            ? segment.modules +
              1
            : 0
        ),
      0,
    ) +
    base.cornerPostExtra;

  const clipCount =
    moduleCount *
    base.clipsPerModule;

  const modulesCost =
    moduleCount *
    base.modulePrice;

  const postsCost =
    postCount *
    base.postPrice;

  const clipsCost =
    clipCount *
    base.clipPrice;

  const basePrice =
    modulesCost +
    postsCost +
    clipsCost;

  const breakdown:
    PricingBreakdownItem[] =
    [
      {
        label:
          "Lungime totală traseu",

        value:
          totalLengthMeters,

        formattedValue:
          `${totalLengthMeters.toFixed(
            2,
          )} m`,
      },

      {
        label:
          "Lungime ocupată de poartă/portiță",

        value:
          totalDeductionMeters,

        formattedValue:
          `${totalDeductionMeters.toFixed(
            2,
          )} m`,
      },
    ];

  for (
    const segment of
    segmentResults
  ) {
    breakdown.push({
      label:
        `Segment ${segment.index}`,

      value:
        segment.modules,

      formattedValue:
        `${segment.length.toFixed(
          2,
        )} m → ${
          segment.modules
        } panouri`,
    });
  }

  breakdown.push(
    {
      label:
        "Panouri total",

      value:
        moduleCount,

      formattedValue:
        `${moduleCount} buc. × ${formatMoney(
          base.modulePrice,
          schema.pricing
            .currency,
        )}`,
    },

    {
      label:
        "Stâlpi total",

      value:
        postCount,

      formattedValue:
        `${postCount} buc. × ${formatMoney(
          base.postPrice,
          schema.pricing
            .currency,
        )}`,
    },

    {
      label:
        "Elemente de fixare",

      value:
        clipCount,

      formattedValue:
        `${clipCount} buc. × ${formatMoney(
          base.clipPrice,
          schema.pricing
            .currency,
        )}`,
    },

    {
      label:
        "Subtotal structură",

      value:
        basePrice,

      formattedValue:
        formatMoney(
          basePrice,
          schema.pricing
            .currency,
        ),
    },
  );

  const total =
    applyPricingModifiers(
      schema,
      state,
      basePrice,
      breakdown,
    );

  return {
    subtotal:
      basePrice,

    total,

    currency:
      schema.pricing
        .currency,

    formattedTotal:
      formatMoney(
        total,
        schema.pricing
          .currency,
      ),

    breakdown,
  };
}

export function calculatePrice(
  schema: ProductSchema,
  state: ConfigurationState,
): PricingResult {
  if (
    schema.pricing.base
      .type === "area"
  ) {
    return calculateAreaPrice(
      schema,
      state,
    );
  }

  if (
    schema.pricing.base
      .type === "modular"
  ) {
    return calculateModularPrice(
      schema,
      state,
    );
  }

  if (
    schema.pricing.base
      .type ===
    "modular_segments"
  ) {
    return calculateModularSegmentsPrice(
      schema,
      state,
    );
  }

  throw new Error(
    "Unsupported pricing strategy.",
  );
}