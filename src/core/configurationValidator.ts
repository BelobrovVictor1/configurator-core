import type { ProductSchema } from "../schema/productSchema";
import type { ConfigurationState } from "./configurationEngine";

export type ConfigurationValidationError = {
  optionId: string;
  message: string;
};

export type ConfigurationValidationResult = {
  valid: boolean;
  errors: ConfigurationValidationError[];
};

export function validateConfiguration(
  schema: ProductSchema,
  state: ConfigurationState,
): ConfigurationValidationResult {
  const errors: ConfigurationValidationError[] = [];

  for (const [optionId, option] of Object.entries(schema.options)) {
    const value = state[optionId];

    if (
      option.inputType === "numeric_single"
    ) {
      if (
        option.required &&
        value === undefined
      ) {
        errors.push({
          optionId,
          message: `${option.label} este obligatoriu.`,
        });

        continue;
      }

      if (
        value !== undefined &&
        typeof value !== "number"
      ) {
        errors.push({
          optionId,
          message: `${option.label} trebuie să fie o valoare numerică.`,
        });

        continue;
      }

      if (
        typeof value === "number" &&
        option.validation?.min !== undefined &&
        value < option.validation.min
      ) {
        errors.push({
          optionId,
          message: `${option.label} trebuie să fie cel puțin ${option.validation.min}.`,
        });
      }

      if (
        typeof value === "number" &&
        option.validation?.max !== undefined &&
        value > option.validation.max
      ) {
        errors.push({
          optionId,
          message: `${option.label} nu poate depăși ${option.validation.max}.`,
        });
      }

      continue;
    }

    if (
      option.inputType === "select" ||
      option.inputType === "color_swatch"
    ) {
      if (
        option.required &&
        value === undefined
      ) {
        errors.push({
          optionId,
          message: `${option.label} este obligatoriu.`,
        });

        continue;
      }

      if (
        value !== undefined &&
        typeof value !== "string"
      ) {
        errors.push({
          optionId,
          message: `${option.label} are o valoare invalidă.`,
        });

        continue;
      }

      if (typeof value === "string") {
        const allowed = option.values.some(
          (candidate) =>
            candidate.id === value,
        );

        if (!allowed) {
          errors.push({
            optionId,
            message: `${option.label} conține o opțiune necunoscută.`,
          });
        }
      }

      continue;
    }

    if (
      option.inputType === "numeric_pair"
    ) {
      for (const field of option.fields) {
        const fieldValue =
          state[field.id];

        if (
          field.validation?.required &&
          fieldValue === undefined
        ) {
          errors.push({
            optionId: field.id,
            message: `${field.label} este obligatoriu.`,
          });

          continue;
        }

        if (
          fieldValue !== undefined &&
          typeof fieldValue !== "number"
        ) {
          errors.push({
            optionId: field.id,
            message: `${field.label} trebuie să fie o valoare numerică.`,
          });

          continue;
        }

        if (
          typeof fieldValue === "number" &&
          field.validation?.min !== undefined &&
          fieldValue < field.validation.min
        ) {
          errors.push({
            optionId: field.id,
            message: `${field.label} trebuie să fie cel puțin ${field.validation.min}.`,
          });
        }

        if (
          typeof fieldValue === "number" &&
          field.validation?.max !== undefined &&
          fieldValue > field.validation.max
        ) {
          errors.push({
            optionId: field.id,
            message: `${field.label} nu poate depăși ${field.validation.max}.`,
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}