import type { ProductSchema } from "../schema/productSchema";
import type { ConfigurationState } from "../core/configurationEngine";

export type PreviewRenderer =
  | "window-basic"
  | "gate-basic";

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
  const value = state[optionId];

  if (typeof value !== "number") {
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
    schema.preview?.colorOption;

  if (!colorOptionId) {
    return "#ffffff";
  }

  const option =
    schema.options[colorOptionId];

  if (
    !option ||
    option.inputType !==
      "color_swatch"
  ) {
    return "#ffffff";
  }

  const selectedValue =
    state[colorOptionId];

  if (
    typeof selectedValue !== "string"
  ) {
    return "#ffffff";
  }

  const selected =
    option.values.find(
      (value) =>
        value.id === selectedValue,
    );

  return selected?.color ?? "#ffffff";
}

export function buildPreview(
  schema: ProductSchema,
  state: ConfigurationState,
): PreviewResult {
  if (!schema.preview) {
    throw new Error(
      "This product does not define a preview configuration.",
    );
  }

  const widthOption =
    schema.pricing.base.widthOption;

  const heightOption =
    schema.pricing.base.heightOption;

  const width = getNumericValue(
    state,
    widthOption,
  );

  const height = getNumericValue(
    state,
    heightOption,
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