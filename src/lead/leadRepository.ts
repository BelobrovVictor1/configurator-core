import { supabase } from "../lib/supabase";

import type {
  LeadSnapshot,
} from "./leadEngine";

export type DatabaseLead = {
  id: string;

  product_id: string;
  product_name: string;
  schema_version: string;

  configuration: Record<
    string,
    string | number
  >;

  pricing: {
    subtotal: number;
    total: number;
    currency: string;
    formattedTotal: string;
  };

  preview: {
    renderer: string;
    width: number;
    height: number;
    primaryColor: string;
    label: string;
  };

  customer_name: string;
  customer_phone: string;
  customer_email: string | null;

  status:
    | "new"
    | "contacted"
    | "quoted"
    | "won"
    | "lost";

  created_at: string;
};

export async function saveLeadToDatabase(
  lead: LeadSnapshot,
): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .insert({
      product_id:
        lead.productId,

      product_name:
        lead.productName,

      schema_version:
        lead.schemaVersion,

      configuration:
        lead.configuration,

      pricing:
        lead.pricing,

      preview:
        lead.preview,

      customer_name:
        lead.customer.name,

      customer_phone:
        lead.customer.phone,

      customer_email:
        lead.customer.email ?? null,

      status: "new",
    });

  if (error) {
    throw new Error(
      `Supabase insert failed: ${error.message}`,
    );
  }
}

export async function getLeadsFromDatabase(): Promise<
  DatabaseLead[]
> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw new Error(
      `Supabase select failed: ${error.message}`,
    );
  }

  return (data ?? []) as DatabaseLead[];
}