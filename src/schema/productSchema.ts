import { z } from "zod";

const optionValueSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),

  priceModifier: z
    .number()
    .positive()
    .optional(),

  priceAddon: z
    .number()
    .min(0)
    .optional(),

  lengthDeduction: z
    .number()
    .min(0)
    .optional(),
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

const selectOptionSchema =
  baseOptionSchema.extend({
    inputType: z.literal("select"),

    values: z
      .array(optionValueSchema)
      .min(1),
  });

const numericOptionSchema =
  baseOptionSchema.extend({
    inputType: z.literal(
      "numeric_single",
    ),

    defaultValue:
      z.number().optional(),

    validation:
      validationSchema.optional(),
  });

const numericPairOptionSchema =
  baseOptionSchema.extend({
    inputType: z.literal(
      "numeric_pair",
    ),

    fields: z
      .array(
        z.object({
          id: z.string().min(1),

          label:
            z.string().min(1),

          defaultValue:
            z.number().optional(),

          validation:
            validationSchema.optional(),
        }),
      )
      .min(2),
  });

const colorSwatchOptionSchema =
  baseOptionSchema.extend({
    inputType: z.literal(
      "color_swatch",
    ),

    values: z
      .array(
        optionValueSchema.extend({
          color: z.string().min(1),
        }),
      )
      .min(1),
  });

export const productOptionSchema =
  z.discriminatedUnion(
    "inputType",
    [
      selectOptionSchema,
      numericOptionSchema,
      numericPairOptionSchema,
      colorSwatchOptionSchema,
    ],
  );

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),

  description:
    z.string().optional(),

  options: z
    .array(z.string().min(1))
    .min(1),
});

const areaPricingBaseSchema =
  z.object({
    type: z.literal("area"),

    pricePerUnit:
      z.number().positive(),

    widthOption:
      z.string().min(1),

    heightOption:
      z.string().min(1),

    unit: z.enum([
      "mm",
      "cm",
      "m",
    ]),
  });

const modularPricingBaseSchema =
  z.object({
    type: z.literal("modular"),

    lengthOption:
      z.string().min(1),

    unit: z.enum([
      "mm",
      "cm",
      "m",
    ]),

    moduleWidth:
      z.number().positive(),

    modulePrice:
      z.number().min(0),

    postPrice:
      z.number().min(0),

    clipsPerModule:
      z.number()
        .int()
        .min(0),

    clipPrice:
      z.number().min(0),

    deductionOptions:
      z.array(
        z.string().min(1),
      ),
  });

const modularSegmentsPricingBaseSchema =
  z.object({
    type: z.literal(
      "modular_segments",
    ),

    segmentOptions:
      z.array(
        z.string().min(1),
      )
      .min(1),

    unit: z.enum([
      "mm",
      "cm",
      "m",
    ]),

    moduleWidth:
      z.number().positive(),

    modulePrice:
      z.number().min(0),

    postPrice:
      z.number().min(0),

    clipsPerModule:
      z.number()
        .int()
        .min(0),

    clipPrice:
      z.number().min(0),

    cornerPostExtra:
      z.number()
        .int()
        .min(0)
        .default(0),

    deductionOptions:
      z.array(
        z.string().min(1),
      ),
  });

const pricingBaseSchema =
  z.discriminatedUnion(
    "type",
    [
      areaPricingBaseSchema,
      modularPricingBaseSchema,
      modularSegmentsPricingBaseSchema,
    ],
  );

const pricingMultiplierSchema =
  z.object({
    type: z.literal(
      "option_multiplier",
    ),

    option:
      z.string().min(1),
  });

const pricingAdditionSchema =
  z.object({
    type: z.literal(
      "option_addition",
    ),

    option:
      z.string().min(1),
  });

const pricingModifierSchema =
  z.discriminatedUnion(
    "type",
    [
      pricingMultiplierSchema,
      pricingAdditionSchema,
    ],
  );

const pricingSchema = z.object({
  currency:
    z.string().min(1),

  base:
    pricingBaseSchema,

  modifiers:
    z.array(
      pricingModifierSchema,
    ),
});

const previewLayerSchema =
  z.object({
    id: z.string().min(1),

    sourceOption:
      z.string().min(1),
  });

const previewSchema = z.object({
  type: z.literal("layered"),

  renderer: z.enum([
    "window-basic",
    "gate-basic",
    "fence-basic",
  ]),

  colorOption:
    z.string().min(1).optional(),

  canvas: z.object({
    width:
      z.number().positive(),

    height:
      z.number().positive(),
  }),

  layers: z.array(
    previewLayerSchema,
  ),
});

const leadFieldSchema =
  z.object({
    id: z.string().min(1),
    label: z.string().min(1),

    type: z.enum([
      "text",
      "email",
      "tel",
    ]),

    required:
      z.boolean().optional(),
  });

const leadCaptureSchema =
  z.object({
    enabled: z.boolean(),

    fields: z.array(
      leadFieldSchema,
    ),
  });

export const productSchema =
  z
    .object({
      schemaVersion:
        z.literal("1.0"),

      product: z.object({
        id:
          z.string().min(1),

        name:
          z.string().min(1),

        description:
          z.string().optional(),
      }),

      steps: z
        .array(stepSchema)
        .min(1),

      options: z.record(
        z.string(),
        productOptionSchema,
      ),

      pricing:
        pricingSchema,

      preview:
        previewSchema.optional(),

      leadCapture:
        leadCaptureSchema.optional(),

      metadata: z
        .record(
          z.string(),
          z.unknown(),
        )
        .optional(),
    })
    .superRefine(
      (schema, ctx) => {
        const optionIds =
          new Set(
            Object.keys(
              schema.options,
            ),
          );

        for (
          const step of
          schema.steps
        ) {
          for (
            const optionId of
            step.options
          ) {
            if (
              !optionIds.has(
                optionId,
              )
            ) {
              ctx.addIssue({
                code: "custom",

                message:
                  `Step "${step.id}" refers to unknown option "${optionId}".`,

                path: [
                  "steps",
                ],
              });
            }
          }
        }

        if (
          schema.pricing.base
            .type === "area"
        ) {
          const {
            widthOption,
            heightOption,
          } =
            schema.pricing.base;

          if (
            !optionIds.has(
              widthOption,
            )
          ) {
            ctx.addIssue({
              code: "custom",

              message:
                `Pricing refers to unknown width option "${widthOption}".`,

              path: [
                "pricing",
                "base",
                "widthOption",
              ],
            });
          }

          if (
            !optionIds.has(
              heightOption,
            )
          ) {
            ctx.addIssue({
              code: "custom",

              message:
                `Pricing refers to unknown height option "${heightOption}".`,

              path: [
                "pricing",
                "base",
                "heightOption",
              ],
            });
          }
        }

        if (
          schema.pricing.base
            .type === "modular"
        ) {
          const {
            lengthOption,
            deductionOptions,
          } =
            schema.pricing.base;

          if (
            !optionIds.has(
              lengthOption,
            )
          ) {
            ctx.addIssue({
              code: "custom",

              message:
                `Modular pricing refers to unknown length option "${lengthOption}".`,

              path: [
                "pricing",
                "base",
                "lengthOption",
              ],
            });
          }

          for (
            const optionId of
            deductionOptions
          ) {
            if (
              !optionIds.has(
                optionId,
              )
            ) {
              ctx.addIssue({
                code: "custom",

                message:
                  `Modular pricing deduction refers to unknown option "${optionId}".`,

                path: [
                  "pricing",
                  "base",
                  "deductionOptions",
                ],
              });
            }
          }
        }

        if (
          schema.pricing.base
            .type ===
          "modular_segments"
        ) {
          const {
            segmentOptions,
            deductionOptions,
          } =
            schema.pricing.base;

          for (
            const segmentOption of
            segmentOptions
          ) {
            if (
              !optionIds.has(
                segmentOption,
              )
            ) {
              ctx.addIssue({
                code: "custom",

                message:
                  `Segment pricing refers to unknown option "${segmentOption}".`,

                path: [
                  "pricing",
                  "base",
                  "segmentOptions",
                ],
              });
            }
          }

          for (
            const optionId of
            deductionOptions
          ) {
            if (
              !optionIds.has(
                optionId,
              )
            ) {
              ctx.addIssue({
                code: "custom",

                message:
                  `Segment pricing deduction refers to unknown option "${optionId}".`,

                path: [
                  "pricing",
                  "base",
                  "deductionOptions",
                ],
              });
            }
          }
        }

        for (
          const modifier of
          schema.pricing
            .modifiers
        ) {
          if (
            !optionIds.has(
              modifier.option,
            )
          ) {
            ctx.addIssue({
              code: "custom",

              message:
                `Pricing modifier refers to unknown option "${modifier.option}".`,

              path: [
                "pricing",
                "modifiers",
              ],
            });
          }
        }

        if (
          schema.preview
        ) {
          for (
            const layer of
            schema.preview.layers
          ) {
            if (
              !optionIds.has(
                layer.sourceOption,
              )
            ) {
              ctx.addIssue({
                code: "custom",

                message:
                  `Preview layer "${layer.id}" refers to unknown option "${layer.sourceOption}".`,

                path: [
                  "preview",
                  "layers",
                ],
              });
            }
          }

          if (
            schema.preview
              .colorOption &&
            !optionIds.has(
              schema.preview
                .colorOption,
            )
          ) {
            ctx.addIssue({
              code: "custom",

              message:
                `Preview colorOption refers to unknown option "${schema.preview.colorOption}".`,

              path: [
                "preview",
                "colorOption",
              ],
            });
          }
        }

        for (
          const [
            optionId,
            option,
          ] of Object.entries(
            schema.options,
          )
        ) {
          if (
            option.inputType ===
              "numeric_single" &&
            option.validation
              ?.min !==
              undefined &&
            option.validation
              ?.max !==
              undefined &&
            option.validation
              .min >
              option.validation
                .max
          ) {
            ctx.addIssue({
              code: "custom",

              message:
                `Option "${optionId}" has min greater than max.`,

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
              const field of
              option.fields
            ) {
              if (
                field.validation
                  ?.min !==
                  undefined &&
                field.validation
                  ?.max !==
                  undefined &&
                field.validation
                  .min >
                  field.validation
                    .max
              ) {
                ctx.addIssue({
                  code: "custom",

                  message:
                    `Field "${field.id}" in option "${optionId}" has min greater than max.`,

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
      },
    );

export type ProductSchema =
  z.infer<
    typeof productSchema
  >;

export function validateProductSchema(
  data: unknown,
) {
  return productSchema.safeParse(
    data,
  );
}