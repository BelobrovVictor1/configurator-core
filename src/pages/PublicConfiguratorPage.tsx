import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getClientBySlug,
} from "../clients/clients";

import {
  getProductSchema,
  getValidProductIds,
  type ProductId,
} from "../products/productRegistry";

import Configurator from "../components/Configurator";

function PublicConfiguratorPage() {
  const {
    clientSlug,
  } =
    useParams<{
      clientSlug: string;
    }>();

  const selectedClient =
    clientSlug
      ? getClientBySlug(
          clientSlug,
        )
      : undefined;

  const availableProducts =
    useMemo(
      () =>
        selectedClient
          ? getValidProductIds(
              selectedClient
                .productIds,
            )
          : [],
      [selectedClient],
    );

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState<
      ProductId | null
    >(null);

  useEffect(() => {
    setSelectedProductId(
      availableProducts[0] ??
        null,
    );
  }, [
    selectedClient?.id,
    availableProducts,
  ]);

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

  if (
    availableProducts.length ===
    0
  ) {
    return (
      <main className="schema-error">
        <h1>
          Niciun produs disponibil
        </h1>

        <p>
          Acest client nu are
          produse configurate.
        </p>
      </main>
    );
  }

  if (!selectedProductId) {
    return (
      <main className="schema-error">
        <p>
          Se încarcă
          configuratorul...
        </p>
      </main>
    );
  }

  let schema;

  try {
    schema =
      getProductSchema(
        selectedProductId,
      );
  } catch (error) {
    return (
      <main className="schema-error">
        <h1>
  Configurator indisponibil
</h1>

<p>
  Produsul nu poate fi încărcat
  momentan.
</p>

        <pre className="configuration-code">
          {error instanceof Error
            ? error.message
            : "Eroare necunoscută"}
        </pre>
      </main>
    );
  }

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
                Selectează produsul
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
                ) => (
                  <option
                    key={
                      productId
                    }
                    value={
                      productId
                    }
                  >
                    {
                      getProductSchema(
                        productId,
                      ).product
                        .name
                    }
                  </option>
                ),
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
          schema={schema}
        />
      </main>
    </div>
  );
}

export default PublicConfiguratorPage;