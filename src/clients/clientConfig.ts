export type ClientBrand = {
  name: string;
  tagline?: string;
  primaryColor: string;
};

export type ClientConfig = {
  id: string;
  slug: string;
  brand: ClientBrand;
  productIds: string[];
};