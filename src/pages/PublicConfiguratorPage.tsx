import {
  useMemo,
  useState,
} from "react";

import windowBasic from "../configs/windowBasic";
import gateTest from "../configs/gateTest";

import {
  productSchema,
  type ProductSchema,
} from "../schema/productSchema";

import Configurator from "../components/Configurator";

type ProductId =
  | "window-basic"
  | "gate-test";

const rawProducts = {
  "window-basic": windowBasic,
  "gate-test": gateTest,
};

function PublicConfiguratorPage() {
  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState<ProductId>(
    "window-basic",
  );

  const schemaResult = useMemo(
    () =>
      productSchema.safeParse(
        rawProducts[
          selectedProductId
        ],
      ),
    [selectedProductId],
  );

  if (!schemaResult.success) {
    return (
      <main className="schema-error">
        <h1>
          Configurator Core Engine
        </h1>

        <h2>
          Schema invalidă ❌
        </h2>

        <pre className="configuration-code">
          {JSON.stringify(
            schemaResult.error.issues,
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
    <div className="app-shell">
      <main className="configurator-page">
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
            <option value="window-basic">
              Fereastră PVC
            </option>

            <option value="gate-test">
              Poartă metalică
            </option>
          </select>
        </div>

        <Configurator
          key={
            schema.product.id
          }
          schema={schema}
        />
      </main>
    </div>
  );
}

export default PublicConfiguratorPage;