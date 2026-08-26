const gateTest = {
  schemaVersion: "1.0",

  product: {
    id: "gate-test",
    name: "Poartă metalică",
    description:
      "Configurator demonstrativ pentru porți metalice.",
  },

  steps: [
    {
      id: "dimensions",
      title: "Dimensiuni",
      description:
        "Introduceți dimensiunile porții.",
      options: ["width", "height"],
    },
    {
      id: "material",
      title: "Material",
      description:
        "Alegeți materialul principal.",
      options: ["material"],
    },
    {
      id: "finish",
      title: "Finisaj",
      description:
        "Alegeți culoarea porții.",
      options: ["color"],
    },
    {
      id: "installation",
      title: "Montaj",
      description:
        "Alegeți tipul serviciului.",
      options: ["installation"],
    },
  ],

  options: {
    width: {
      id: "width",
      label: "Lățime",
      inputType: "numeric_single",
      required: true,
      defaultValue: 350,
      validation: {
        required: true,
        min: 100,
        max: 700,
      },
    },

    height: {
      id: "height",
      label: "Înălțime",
      inputType: "numeric_single",
      required: true,
      defaultValue: 200,
      validation: {
        required: true,
        min: 100,
        max: 350,
      },
    },

    material: {
      id: "material",
      label: "Material",
      inputType: "select",
      required: true,
      values: [
        {
          id: "steel-standard",
          label: "Oțel Standard",
          priceModifier: 1,
        },
        {
          id: "steel-premium",
          label: "Oțel Premium",
          priceModifier: 1.2,
        },
        {
          id: "aluminium",
          label: "Aluminiu",
          priceModifier: 1.35,
        },
      ],
    },

    color: {
      id: "color",
      label: "Culoare",
      inputType: "color_swatch",
      required: true,
      values: [
        {
          id: "anthracite",
          label: "Antracit",
          color: "#383e42",
          priceModifier: 1,
        },
        {
          id: "black",
          label: "Negru",
          color: "#111111",
          priceModifier: 1.05,
        },
        {
          id: "brown",
          label: "Maro",
          color: "#654321",
          priceModifier: 1.08,
        },
      ],
    },

    installation: {
      id: "installation",
      label: "Serviciu",
      inputType: "select",
      required: true,
      values: [
        {
          id: "product-only",
          label: "Doar produs",
          priceModifier: 1,
        },
        {
          id: "standard-installation",
          label:
            "Produs + montaj standard",
          priceModifier: 1.12,
        },
        {
          id: "premium-installation",
          label:
            "Produs + montaj complex",
          priceModifier: 1.22,
        },
      ],
    },
  },

  pricing: {
    currency: "MDL",

    base: {
      type: "area",
      pricePerUnit: 2450,
      widthOption: "width",
      heightOption: "height",
      unit: "cm",
    },

    modifiers: [
      {
        type: "option_multiplier",
        option: "material",
      },
      {
        type: "option_multiplier",
        option: "color",
      },
      {
        type: "option_multiplier",
        option: "installation",
      },
    ],
  },

  preview: {
    type: "layered",
    renderer: "gate-basic",
    colorOption: "color",

    canvas: {
      width: 800,
      height: 500,
    },

    layers: [
      {
        id: "material-layer",
        sourceOption: "material",
      },
      {
        id: "color-layer",
        sourceOption: "color",
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
    vertical: "gates",
    status: "architecture-test",
  },
} as const;

export default gateTest;