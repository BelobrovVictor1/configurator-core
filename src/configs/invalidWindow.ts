const invalidWindow = {
  schemaVersion: "1.0",

  product: {
    id: "invalid-window",
    name: "Fereastră invalidă",
    description: "Configurație creată intenționat pentru testarea validatorului.",
  },

  steps: [
    {
      id: "dimensions",
      title: "Dimensiuni",
      options: ["width", "height", "ghost-option"],
    },
  ],

  options: {
    width: {
      id: "width",
      label: "Lățime",
      inputType: "numeric_single",
      required: true,
      defaultValue: 120,
      validation: {
        required: true,
        min: 300,
        max: 40,
      },
    },

    height: {
      id: "height",
      label: "Înălțime",
      inputType: "numeric_single",
      required: true,
      defaultValue: 140,
      validation: {
        required: true,
        min: 40,
        max: 300,
      },
    },
  },

  pricing: {
    currency: "MDL",

    base: {
      type: "area",
      pricePerUnit: 1800,
      widthOption: "width",
      heightOption: "missing-height",
      unit: "cm",
    },

    modifiers: [
      {
        type: "option_multiplier",
        option: "missing-profile",
      },
    ],
  },

  preview: {
    type: "layered",

    canvas: {
      width: 800,
      height: 800,
    },

    layers: [
      {
        id: "fake-layer",
        sourceOption: "missing-color",
      },
    ],
  },
} as const;

export default invalidWindow;