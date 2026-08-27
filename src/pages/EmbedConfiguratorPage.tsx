import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
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

function EmbedConfiguratorPage() {
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

  useEffect(() => {
    function getPageHeight() {
      return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
      );
    }

    function sendHeight() {
      const height =
        getPageHeight();

      window.parent.postMessage(
        {
          type:
            "configurator:resize",

          clientSlug:
            clientSlug ?? "",

          height,
        },
        "*",
      );
    }

    sendHeight();

    const resizeObserver =
      new ResizeObserver(
        () => {
          window.requestAnimationFrame(
            sendHeight,
          );
        },
      );

    resizeObserver.observe(
      document.body,
    );

    resizeObserver.observe(
      document.documentElement,
    );

    function handleMessage(
      event: MessageEvent,
    ) {
      if (
        event.data?.type ===
        "configurator:request-resize"
      ) {
        sendHeight();
      }
    }

    window.addEventListener(
      "message",
      handleMessage,
    );

    window.addEventListener(
      "load",
      sendHeight,
    );

    window.addEventListener(
      "resize",
      sendHeight,
    );

    return () => {
      resizeObserver.disconnect();

      window.removeEventListener(
        "message",
        handleMessage,
      );

      window.removeEventListener(
        "load",
        sendHeight,
      );

      window.removeEventListener(
        "resize",
        sendHeight,
      );
    };
  }, [clientSlug]);

  if (!selectedClient) {
    return (
      <main className="embed-error">
        Configurator indisponibil.
      </main>
    );
  }

  if (
    availableProducts.length ===
    0
  ) {
    return (
      <main className="embed-error">
        Niciun produs disponibil.
      </main>
    );
  }

  if (!selectedProductId) {
    return (
      <main className="embed-error">
        Se încarcă...
      </main>
    );
  }

  let schema;

  try {
    schema =
      getProductSchema(
        selectedProductId,
      );
  } catch {
    return (
      <main className="embed-error">
        Configurator indisponibil.
      </main>
    );
  }

  return (
    <div
      className="app-shell embed-shell"
      style={
        {
          "--brand-primary":
            selectedClient
              .brand
              .primaryColor,
        } as React.CSSProperties
      }
    >
      <main className="embed-page">
        <header className="embed-brand-header">
          <div className="embed-brand-name">
            {
              selectedClient
                .brand.name
            }
          </div>

          {availableProducts.length >
            1 && (
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
          )}
        </header>

        <Configurator
          key={`${selectedClient.id}-${schema.product.id}-embed`}
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

export default EmbedConfiguratorPage;