import type { ProductSchema } from "../schema/productSchema";

export type ConfigurationValue = string | number;

export type ConfigurationState = Record<string, ConfigurationValue>;

export function createInitialConfiguration(
  schema: ProductSchema,
): ConfigurationState {
  const state: ConfigurationState = {};

  for (const [optionId, option] of Object.entries(schema.options)) {
    if (option.inputType === "numeric_single") {
      if (option.defaultValue !== undefined) {
        state[optionId] = option.defaultValue;
      }

      continue;
    }

    if (option.inputType === "select") {
      const firstValue = option.values[0];

      if (firstValue) {
        state[optionId] = firstValue.id;
      }

      continue;
    }

    if (option.inputType === "color_swatch") {
      const firstValue = option.values[0];

      if (firstValue) {
        state[optionId] = firstValue.id;
      }

      continue;
    }

    if (option.inputType === "numeric_pair") {
      for (const field of option.fields) {
        if (field.defaultValue !== undefined) {
          state[field.id] = field.defaultValue;
        }
      }
    }
  }

  return state;
}

export function setConfigurationValue(
  schema: ProductSchema,
  currentState: ConfigurationState,
  optionId: string,
  value: ConfigurationValue,
): ConfigurationState {
  const option = schema.options[optionId];

  if (!option) {
    throw new Error(`Unknown option "${optionId}".`);
  }

  if (option.inputType === "numeric_single") {
    if (typeof value !== "number") {
      throw new Error(`Option "${optionId}" requires a numeric value.`);
    }

    return {
      ...currentState,
      [optionId]: value,
    };
  }

  if (option.inputType === "select" || option.inputType === "color_swatch") {
    if (typeof value !== "string") {
      throw new Error(`Option "${optionId}" requires a string value.`);
    }

    const allowedValue = option.values.some(
      (candidate) => candidate.id === value,
    );

    if (!allowedValue) {
      throw new Error(
        `Value "${value}" is not allowed for option "${optionId}".`,
      );
    }

    return {
      ...currentState,
      [optionId]: value,
    };
  }

  throw new Error(
    `Option "${optionId}" cannot be updated directly with setConfigurationValue().`,
  );
}

export function getConfigurationValue(
  state: ConfigurationState,
  optionId: string,
): ConfigurationValue | undefined {
  return state[optionId];
}

export function resetConfiguration(
  schema: ProductSchema,
): ConfigurationState {
  return createInitialConfiguration(schema);
}