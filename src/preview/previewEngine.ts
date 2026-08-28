import type {
  ProductSchema,
} from "../schema/productSchema";

import type {
  ConfigurationState,
} from "../core/configurationEngine";

export type PreviewRenderer =
  | "window-basic"
  | "gate-basic"
  | "fence-basic";

export type PreviewResult = {
  renderer: PreviewRenderer;

  width: number;
  height: number;
  aspectRatio: number;

  primaryColor: string;

  label: string;
};

function getNumericValue(
  state: ConfigurationState,
  optionId: string,
): number {
  const value =
    state[optionId];

  if (
    typeof value !== "number"
  ) {
    throw new Error(
      `Preview requires numeric value for "${optionId}".`,
    );
  }

  return value;
}

function getColorValue(
  schema: ProductSchema,
  state: ConfigurationState,
): string {
  const colorOptionId =
    schema.preview
      ?.colorOption;

  if (!colorOptionId) {
    return "#ffffff";
  }

  const option =
    schema.options[
      colorOptionId
    ];

  if (
    !option ||
    option.inputType !==
      "color_swatch"
  ) {
    return "#ffffff";
  }

  const selectedValue =
    state[
      colorOptionId
    ];

  if (
    typeof selectedValue !==
    "string"
  ) {
    return "#ffffff";
  }

  const selected =
    option.values.find(
      (value) =>
        value.id ===
        selectedValue,
    );

  return (
    selected?.color ??
    "#ffffff"
  );
}

function buildAreaPreview(
  schema: ProductSchema,
  state: ConfigurationState,
): PreviewResult {
  const base =
    schema.pricing.base;

  if (
    base.type !== "area"
  ) {
    throw new Error(
      "Area preview requires area pricing.",
    );
  }

  if (
    !schema.preview
  ) {
    throw new Error(
      "This product does not define a preview configuration.",
    );
  }

  const width =
    getNumericValue(
      state,
      base.widthOption,
    );

  const height =
    getNumericValue(
      state,
      base.heightOption,
    );

  return {
    renderer:
      schema.preview.renderer,

    width,

    height,

    aspectRatio:
      width / height,

    primaryColor:
      getColorValue(
        schema,
        state,
      ),

    label:
      `${width} × ${height} cm`,
  };
}

function buildModularPreview(
  schema: ProductSchema,
  state: ConfigurationState,
): PreviewResult {
  const base =
    schema.pricing.base;

  if (
    base.type !==
    "modular"
  ) {
    throw new Error(
      "Modular preview requires modular pricing.",
    );
  }

  if (
    !schema.preview
  ) {
    throw new Error(
      "This product does not define a preview configuration.",
    );
  }

  const length =
    getNumericValue(
      state,
      base.lengthOption,
    );

  /*
   * Pentru gard nu folosim raportul geometric
   * lungime totală / înălțime reală pentru
   * reprezentare, deoarece un gard de 30 m ar
   * deveni aproape o linie pe ecran.
   *
   * Preview-ul fence-basic are propriul renderer
   * proporțional și folosește această dimensiune
   * doar ca informație semantică.
   */
  const representativeHeight =
    1.5;

  return {
    renderer:
      schema.preview.renderer,

    width:
      length,

    height:
      representativeHeight,

    aspectRatio:
      4,

    primaryColor:
      getColorValue(
        schema,
        state,
      ),

    label:
      `${length} ${base.unit} traseu`,
  };
}

export function buildPreview(
  schema: ProductSchema,
  state: ConfigurationState,
): PreviewResult {
  if (
    schema.pricing.base
      .type === "area"
  ) {
    return buildAreaPreview(
      schema,
      state,
    );
  }

  if (
    schema.pricing.base
      .type === "modular"
  ) {
    return buildModularPreview(
      schema,
      state,
    );
  }

  throw new Error(
    "Unsupported preview strategy.",
  );
}