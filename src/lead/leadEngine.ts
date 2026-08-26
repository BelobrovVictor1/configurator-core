import type { ProductSchema } from "../schema/productSchema";
import type { ConfigurationState } from "../core/configurationEngine";
import type { PricingResult } from "../pricing/pricingEngine";
import type { PreviewResult } from "../preview/previewEngine";

export type LeadCustomer = {
  name: string;
  phone: string;
  email?: string;
};

export type LeadSnapshot = {
  leadId: string;
  productId: string;
  productName: string;
  schemaVersion: string;

  configuration: ConfigurationState;

  pricing: {
    subtotal: number;
    total: number;
    currency: string;
    formattedTotal: string;
  };

  preview: {
    renderer: PreviewResult["renderer"];
    width: number;
    height: number;
    primaryColor: string;
    label: string;
  };

  customer: LeadCustomer;

  createdAt: string;
};

function generateLeadId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `lead-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function createLeadSnapshot(
  schema: ProductSchema,
  configuration: ConfigurationState,
  pricing: PricingResult,
  preview: PreviewResult,
  customer: LeadCustomer,
): LeadSnapshot {
  return {
    leadId: generateLeadId(),

    productId: schema.product.id,
    productName: schema.product.name,
    schemaVersion: schema.schemaVersion,

    configuration: {
      ...configuration,
    },

    pricing: {
      subtotal: pricing.subtotal,
      total: pricing.total,
      currency: pricing.currency,
      formattedTotal: pricing.formattedTotal,
    },

    preview: {
      renderer: preview.renderer,
      width: preview.width,
      height: preview.height,
      primaryColor: preview.primaryColor,
      label: preview.label,
    },

    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email?.trim() || undefined,
    },

    createdAt: new Date().toISOString(),
  };
}

export function saveLeadLocally(
  lead: LeadSnapshot,
): void {
  const storageKey = "configurator-leads";

  const existingRaw =
    localStorage.getItem(storageKey);

  let existingLeads: LeadSnapshot[] = [];

  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw);

      if (Array.isArray(parsed)) {
        existingLeads = parsed;
      }
    } catch {
      existingLeads = [];
    }
  }

  existingLeads.unshift(lead);

  localStorage.setItem(
    storageKey,
    JSON.stringify(existingLeads),
  );
}

export function getSavedLeads(): LeadSnapshot[] {
  const storageKey = "configurator-leads";

  const existingRaw =
    localStorage.getItem(storageKey);

  if (!existingRaw) {
    return [];
  }

  try {
    const parsed = JSON.parse(existingRaw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}