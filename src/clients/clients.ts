import type {
  ClientConfig,
} from "./clientConfig";

export const clients:
  ClientConfig[] = [
  {
    id:
      "ferestre-max",

    slug:
      "ferestre-max",

    brand: {
      name:
        "Ferestre Max",

      tagline:
        "Configurează rapid fereastra potrivită pentru proiectul tău.",

      primaryColor:
        "#1f5eff",
    },

    productIds: [
      "window-basic",
    ],
  },

  {
    id:
      "metal-gate",

    slug:
      "metal-gate",

    brand: {
      name:
        "Metal Gate",

      tagline:
        "Configurează poarta potrivită pentru proprietatea ta.",

      primaryColor:
        "#222222",
    },

    productIds: [
      "gate-test",
    ],
  },

  {
    id:
      "gard-expert",

    slug:
      "gard-expert",

    brand: {
      name:
        "Gard Expert",

      tagline:
        "Calculează rapid necesarul de panouri și costul estimativ al gardului.",

      primaryColor:
        "#315b3b",
    },

    productIds: [
      "fence-modular",
    ],
  },
];

export function getClientBySlug(
  slug: string,
): ClientConfig | undefined {
  return clients.find(
    (client) =>
      client.slug ===
      slug,
  );
}