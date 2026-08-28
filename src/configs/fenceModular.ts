const fenceModular = {
  schemaVersion: "1.0",

  product: {
    id:
      "fence-modular",

    name:
      "Gard din panouri modulare",

    description:
      "Configurează lungimea gardului, panourile, culoarea și elementele de acces.",
  },

  steps: [
    {
      id: "length",

      title:
        "Lungimea gardului",

      description:
        "Introdu lungimea totală a traseului de gard.",

      options: [
        "fenceLength",
      ],
    },

    {
      id: "panel",

      title:
        "Panoul",

      description:
        "Alege tipul și înălțimea panourilor.",

      options: [
        "panelType",
        "fenceHeight",
        "color",
      ],
    },

    {
      id: "access",

      title:
        "Acces",

      description:
        "Adaugă poartă auto și portiță, dacă sunt necesare.",

      options: [
        "vehicleGate",
        "pedestrianGate",
      ],
    },
  ],

  options: {
    fenceLength: {
      id:
        "fenceLength",

      label:
        "Lungime totală gard (m)",

      inputType:
        "numeric_single",

      required: true,

      defaultValue: 25,

      validation: {
        required: true,
        min: 2,
        max: 500,
      },
    },

    panelType: {
      id:
        "panelType",

      label:
        "Tip panou",

      inputType:
        "select",

      required: true,

      values: [
        {
          id:
            "panel-2d",

          label:
            "Panou 2D",

          priceModifier: 1,
        },

        {
          id:
            "panel-3d",

          label:
            "Panou 3D",

          priceModifier:
            1.08,
        },

        {
          id:
            "panel-3d-premium",

          label:
            "Panou 3D Premium",

          priceModifier:
            1.18,
        },
      ],
    },

    fenceHeight: {
      id:
        "fenceHeight",

      label:
        "Înălțime",

      inputType:
        "select",

      required: true,

      values: [
        {
          id:
            "height-123",

          label:
            "1,23 m",

          priceModifier:
            0.88,
        },

        {
          id:
            "height-153",

          label:
            "1,53 m",

          priceModifier: 1,
        },

        {
          id:
            "height-173",

          label:
            "1,73 m",

          priceModifier:
            1.1,
        },

        {
          id:
            "height-203",

          label:
            "2,03 m",

          priceModifier:
            1.22,
        },
      ],
    },

    color: {
      id: "color",

      label:
        "Culoare",

      inputType:
        "color_swatch",

      required: true,

      values: [
        {
          id:
            "green",

          label:
            "Verde",

          color:
            "#315b3b",

          priceModifier: 1,
        },

        {
          id:
            "anthracite",

          label:
            "Antracit",

          color:
            "#383e42",

          priceModifier:
            1.05,
        },

        {
          id:
            "black",

          label:
            "Negru",

          color:
            "#111111",

          priceModifier:
            1.08,
        },
      ],
    },

    vehicleGate: {
      id:
        "vehicleGate",

      label:
        "Poartă auto",

      inputType:
        "select",

      required: true,

      values: [
        {
          id: "none",

          label:
            "Fără poartă",

          priceAddon: 0,

          lengthDeduction: 0,
        },

        {
          id:
            "gate-3m",

          label:
            "Poartă 3 m",

          priceAddon:
            8500,

          lengthDeduction: 3,
        },

        {
          id:
            "gate-4m",

          label:
            "Poartă 4 m",

          priceAddon:
            9500,

          lengthDeduction: 4,
        },

        {
          id:
            "gate-5m",

          label:
            "Poartă 5 m",

          priceAddon:
            11200,

          lengthDeduction: 5,
        },
      ],
    },

    pedestrianGate: {
      id:
        "pedestrianGate",

      label:
        "Portiță",

      inputType:
        "select",

      required: true,

      values: [
        {
          id: "none",

          label:
            "Fără portiță",

          priceAddon: 0,

          lengthDeduction: 0,
        },

        {
          id:
            "wicket-1m",

          label:
            "Portiță 1 m",

          priceAddon:
            3200,

          lengthDeduction: 1,
        },

        {
          id:
            "wicket-12m",

          label:
            "Portiță 1,2 m",

          priceAddon:
            3600,

          lengthDeduction:
            1.2,
        },
      ],
    },
  },

  pricing: {
    currency: "MDL",

    base: {
      type:
        "modular",

      lengthOption:
        "fenceLength",

      unit: "m",

      moduleWidth:
        2.5,

      modulePrice:
        620,

      postPrice:
        280,

      clipsPerModule:
        4,

      clipPrice:
        18,

      deductionOptions: [
        "vehicleGate",
        "pedestrianGate",
      ],
    },

    modifiers: [
      {
        type:
          "option_multiplier",

        option:
          "panelType",
      },

      {
        type:
          "option_multiplier",

        option:
          "fenceHeight",
      },

      {
        type:
          "option_multiplier",

        option:
          "color",
      },

      {
        type:
          "option_addition",

        option:
          "vehicleGate",
      },

      {
        type:
          "option_addition",

        option:
          "pedestrianGate",
      },
    ],
  },

  preview: {
    type:
      "layered",

    renderer:
      "fence-basic",

    colorOption:
      "color",

    canvas: {
      width: 900,
      height: 350,
    },

    layers: [
      {
        id:
          "panel-type-layer",

        sourceOption:
          "panelType",
      },

      {
        id:
          "height-layer",

        sourceOption:
          "fenceHeight",
      },

      {
        id:
          "color-layer",

        sourceOption:
          "color",
      },

      {
        id:
          "gate-layer",

        sourceOption:
          "vehicleGate",
      },
    ],
  },

  leadCapture: {
    enabled: true,

    fields: [
      {
        id: "name",
        label: "Nume",
        type: "text",
        required: true,
      },

      {
        id: "phone",
        label: "Telefon",
        type: "tel",
        required: true,
      },

      {
        id: "email",
        label: "Email",
        type: "email",
        required: false,
      },
    ],
  },

  metadata: {
    vertical:
      "modular-fences",

    pricingStrategy:
      "modular",

    status:
      "development",
  },
} as const;

export default fenceModular;