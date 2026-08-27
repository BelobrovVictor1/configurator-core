import windowBasic from "../configs/windowBasic";
import gateTest from "../configs/gateTest";

import {
  productSchema,
  type ProductSchema,
} from "../schema/productSchema";

export const rawProducts = {
  "window-basic": windowBasic,
  "gate-test": gateTest,
} as const;

export type ProductId =
  keyof typeof rawProducts;

export function isProductId(
  value: string,
): value is ProductId {
  return value in rawProducts;
}

export function getProductSchema(
  productId: ProductId,
): ProductSchema {
  const result =
    productSchema.safeParse(
      rawProducts[productId],
    );

  if (!result.success) {
    throw new Error(
      `Product "${productId}" has an invalid schema.`,
    );
  }

  return result.data;
}

export function getValidProductIds(
  productIds: string[],
): ProductId[] {
  return productIds.filter(
    isProductId,
  );
}