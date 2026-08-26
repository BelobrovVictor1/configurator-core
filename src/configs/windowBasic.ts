const windowBasic = {
  schemaVersion: "1.0",

  product: {
    id: "window-basic",
    name: "Fereastră PVC",
    description:
      "Configurator demonstrativ pentru ferestre PVC",
  },

  steps: [
    {
      id: "dimensions",
      title: "Dimensiuni",
      description:
        "Introduceți dimensiunile ferestrei.",
      options: ["width", "height"],
    },
    {
      id: "profile",
      title: "Profil",
      description:
        "Alegeți tipul profilului.",
      options: ["profile"],
    },
    {
      id: "color",
      title: "Culoare",
      description:
        "Alegeți culoarea dorită.",
      options: ["color"],
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
        min: 40,
        max: 300,
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

    profile: {
      id: "profile",
      label: "Profil",
      inputType: "select",
      required: true,
      values: [
        {
          id: "standard",
          label: "Standard",
          priceModifier: 1,
        },
        {
          id: "premium",
          label: "Premium",
          priceModifier: 1.15,
        },
        {
          id: "premium-plus",
          label: "Premium Plus",
          priceModifier: 1.3,
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
          id: "white",
          label: "Alb",
          color: "#ffffff",
          priceModifier: 1,
        },
        {
          id: "anthracite",
          label: "Antracit",
          color: "#383e42",
          priceModifier: 1.12,
        },
        {
          id: "golden-oak",
          label: "Stejar auriu",
          color: "#9a6b3b",
          priceModifier: 1.18,
        },
      ],
    },
  },

  pricing: {
    currency: "MDL",

    base: {
      type: "area",
      pricePerUnit: 1800,
      widthOption: "width",
      heightOption: "height",
      unit: "cm",
    },

    modifiers: [
      {
        type: "option_multiplier",
        option: "profile",
      },
      {
        type: "option_multiplier",
        option: "color",
      },
    ],
  },

  preview: {
    type: "layered",
    renderer: "window-basic",
    colorOption: "color",

    canvas: {
      width: 800,
      height: 800,
    },

    layers: [
      {
        id: "profile-layer",
        sourceOption: "profile",
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
    vertical: "windows",
    status: "development",
  },
} as const;

export default windowBasic;