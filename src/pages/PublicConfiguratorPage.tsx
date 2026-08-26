import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import windowBasic from "../configs/windowBasic";
import gateTest from "../configs/gateTest";

import {
  productSchema,
  type ProductSchema,
} from "../schema/productSchema";

import {
  clients,
  getClientBySlug,
} from "../clients/clients";

import Configurator from "../components/Configurator";

const rawProducts = {
  "window-basic":
    windowBasic,

  "gate-test":
    gateTest,
};

type ProductId =
  keyof typeof rawProducts;

function PublicConfiguratorPage() {
  const {
    clientSlug,
  } =
    useParams<{
      clientSlug?: string;
    }>();

  const selectedClient =
    clientSlug
      ? getClientBySlug(
          clientSlug,
        )
      : clients[0];

  if (!selectedClient) {
    return (
      <main className="schema-error">
        <h1>
          Client inexistent
        </h1>

        <p>
          Configuratorul solicitat
          nu există.
        </p>

        <Link to="/">
          Înapoi
        </Link>
      </main>
    );
  }

  const availableProducts =
    selectedClient.productIds.filter(
      (
        productId,
      ): productId is ProductId =>
        productId in
        rawProducts,
    );

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState<ProductId>(
      availableProducts[0],
    );

  const schemaResult =
    useMemo(
      () =>
        productSchema.safeParse(
          rawProducts[
            selectedProductId
          ],
        ),
      [
        selectedProductId,
      ],
    );

  if (
    !schemaResult.success
  ) {
    return (
      <main className="schema-error">
        <h1>
          Configurator Core
          Engine
        </h1>

        <h2>
          Schema invalidă ❌
        </h2>

        <pre className="configuration-code">
          {JSON.stringify(
            schemaResult.error
              .issues,
            null,
            2,
          )}
        </pre>
      </main>
    );
  }

  const schema:
    ProductSchema =
      schemaResult.data;

  return (
    <div
      className="app-shell"
      style={
        {
          "--brand-primary":
            selectedClient
              .brand
              .primaryColor,
        } as React.CSSProperties
      }
    >
      <main className="configurator-page">
        <header className="client-brand-header">
          <div>
            <div className="client-brand-name">
              {
                selectedClient
                  .brand.name
              }
            </div>

            {selectedClient
              .brand
              .tagline && (
              <p>
                {
                  selectedClient
                    .brand
                    .tagline
                }
              </p>
            )}
          </div>
        </header>

        {availableProducts.length >
          1 && (
          <div className="product-switcher">
            <div>
              <div className="product-switcher-label">
                Configurator
              </div>

              <strong>
                Selectează
                produsul
              </strong>
            </div>

            <select
              className="product-switcher-select"
              value={
                selectedProductId
              }
              onChange={(
                event,
              ) =>
                setSelectedProductId(
                  event.target
                    .value as ProductId,
                )
              }
            >
              {availableProducts.map(
                (
                  productId,
                ) => {
                  const result =
                    productSchema.safeParse(
                      rawProducts[
                        productId
                      ],
                    );

                  return (
                    <option
                      key={
                        productId
                      }
                      value={
                        productId
                      }
                    >
                      {result.success
                        ? result
                            .data
                            .product
                            .name
                        : productId}
                    </option>
                  );
                },
              )}
            </select>
          </div>
        )}

        <Configurator
          key={`${selectedClient.id}-${schema.product.id}`}
          clientId={
            selectedClient.id
          }
          clientName={
            selectedClient
              .brand.name
          }
          schema={
            schema
          }
        />
      </main>
    </div>
  );
}

export default PublicConfiguratorPage;