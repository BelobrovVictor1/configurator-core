import type {
  ClientConfig,
} from "./clientConfig";

export const clients: ClientConfig[] = [
  {
    id: "ferestre-max",
    slug: "ferestre-max",

    brand: {
      name: "Ferestre Max",
      tagline:
        "Configurează rapid fereastra potrivită pentru proiectul tău.",
      primaryColor: "#1f5eff",
    },

    productIds: [
      "window-basic",
    ],
  },

  {
    id: "metal-gate",
    slug: "metal-gate",

    brand: {
      name: "Metal Gate",
      tagline:
        "Configurează poarta potrivită pentru proprietatea ta.",
      primaryColor: "#222222",
    },

    productIds: [
      "gate-test",
    ],
  },
];

export function getClientBySlug(
  slug: string,
): ClientConfig | undefined {
  return clients.find(
    (client) =>
      client.slug === slug,
  );
}