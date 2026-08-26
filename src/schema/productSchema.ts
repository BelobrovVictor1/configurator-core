import { z } from "zod";

const optionValueSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  priceModifier: z.number().positive().optional(),
});

const validationSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

const baseOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean().optional(),
});

const selectOptionSchema = baseOptionSchema.extend({
  inputType: z.literal("select"),
  values: z.array(optionValueSchema).min(1),
});

const numericOptionSchema = baseOptionSchema.extend({
  inputType: z.literal("numeric_single"),
  defaultValue: z.number().optional(),
  validation: validationSchema.optional(),
});

const numericPairOptionSchema = baseOptionSchema.extend({
  inputType: z.literal("numeric_pair"),
  fields: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        defaultValue: z.number().optional(),
        validation: validationSchema.optional(),
      }),
    )
    .min(2),
});

const colorSwatchOptionSchema = baseOptionSchema.extend({
  inputType: z.literal("color_swatch"),
  values: z
    .array(
      optionValueSchema.extend({
        color: z.string().min(1),
      }),
    )
    .min(1),
});

export const productOptionSchema = z.discriminatedUnion("inputType", [
  selectOptionSchema,
  numericOptionSchema,
  numericPairOptionSchema,
  colorSwatchOptionSchema,
]);

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(z.string().min(1)).min(1),
});

const pricingBaseSchema = z.object({
  type: z.literal("area"),
  pricePerUnit: z.number().positive(),
  widthOption: z.string().min(1),
  heightOption: z.string().min(1),
  unit: z.enum(["mm", "cm", "m"]),
});

const pricingModifierSchema = z.object({
  type: z.literal("option_multiplier"),
  option: z.string().min(1),
});

const pricingSchema = z.object({
  currency: z.string().min(1),
  base: pricingBaseSchema,
  modifiers: z.array(pricingModifierSchema),
});

const previewLayerSchema = z.object({
  id: z.string().min(1),
  sourceOption: z.string().min(1),
});

const previewSchema = z.object({
  type: z.literal("layered"),

  renderer: z.enum([
    "window-basic",
    "gate-basic",
  ]),

  colorOption: z.string().min(1).optional(),

  canvas: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),

  layers: z.array(previewLayerSchema),
});

const leadFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "email", "tel"]),
  required: z.boolean().optional(),
});

const leadCaptureSchema = z.object({
  enabled: z.boolean(),
  fields: z.array(leadFieldSchema),
});

export const productSchema = z
  .object({
    schemaVersion: z.literal("1.0"),

    product: z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
    }),

    steps: z.array(stepSchema).min(1),

    options: z.record(
      z.string(),
      productOptionSchema,
    ),

    pricing: pricingSchema,

    preview: previewSchema.optional(),

    leadCapture: leadCaptureSchema.optional(),

    metadata: z
      .record(z.string(), z.unknown())
      .optional(),
  })
  .superRefine((schema, ctx) => {
    const optionIds = new Set(
      Object.keys(schema.options),
    );

    for (const step of schema.steps) {
      for (const optionId of step.options) {
        if (!optionIds.has(optionId)) {
          ctx.addIssue({
            code: "custom",
            message: `Step "${step.id}" refers to unknown option "${optionId}".`,
            path: ["steps"],
          });
        }
      }
    }

    const widthOption =
      schema.pricing.base.widthOption;

    const heightOption =
      schema.pricing.base.heightOption;

    if (!optionIds.has(widthOption)) {
      ctx.addIssue({
        code: "custom",
        message: `Pricing refers to unknown width option "${widthOption}".`,
        path: [
          "pricing",
          "base",
          "widthOption",
        ],
      });
    }

    if (!optionIds.has(heightOption)) {
      ctx.addIssue({
        code: "custom",
        message: `Pricing refers to unknown height option "${heightOption}".`,
        path: [
          "pricing",
          "base",
          "heightOption",
        ],
      });
    }

    for (
      const modifier of schema.pricing
        .modifiers
    ) {
      if (!optionIds.has(modifier.option)) {
        ctx.addIssue({
          code: "custom",
          message: `Pricing modifier refers to unknown option "${modifier.option}".`,
          path: [
            "pricing",
            "modifiers",
          ],
        });
      }
    }

    if (schema.preview) {
      for (
        const layer of schema.preview.layers
      ) {
        if (
          !optionIds.has(
            layer.sourceOption,
          )
        ) {
          ctx.addIssue({
            code: "custom",
            message: `Preview layer "${layer.id}" refers to unknown option "${layer.sourceOption}".`,
            path: [
              "preview",
              "layers",
            ],
          });
        }
      }

      if (
        schema.preview.colorOption &&
        !optionIds.has(
          schema.preview.colorOption,
        )
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Preview colorOption refers to unknown option "${schema.preview.colorOption}".`,
          path: [
            "preview",
            "colorOption",
          ],
        });
      }
    }

    for (
      const [optionId, option] of
      Object.entries(schema.options)
    ) {
      if (
        option.inputType ===
          "numeric_single" &&
        option.validation?.min !==
          undefined &&
        option.validation?.max !==
          undefined &&
        option.validation.min >
          option.validation.max
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Option "${optionId}" has min greater than max.`,
          path: [
            "options",
            optionId,
            "validation",
          ],
        });
      }

      if (
        option.inputType ===
        "numeric_pair"
      ) {
        for (
          const field of option.fields
        ) {
          if (
            field.validation?.min !==
              undefined &&
            field.validation?.max !==
              undefined &&
            field.validation.min >
              field.validation.max
          ) {
            ctx.addIssue({
              code: "custom",
              message: `Field "${field.id}" in option "${optionId}" has min greater than max.`,
              path: [
                "options",
                optionId,
                "fields",
              ],
            });
          }
        }
      }
    }
  });

export type ProductSchema = z.infer<
  typeof productSchema
>;

export function validateProductSchema(
  data: unknown,
) {
  return productSchema.safeParse(data);
}