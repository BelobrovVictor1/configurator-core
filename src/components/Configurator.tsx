import {
  useMemo,
  useState,
} from "react";

import type {
  ProductSchema,
} from "../schema/productSchema";

import {
  createInitialConfiguration,
  setConfigurationValue,
  type ConfigurationState,
  type ConfigurationValue,
} from "../core/configurationEngine";

import {
  validateConfiguration,
} from "../core/configurationValidator";

import {
  calculatePrice,
} from "../pricing/pricingEngine";

import {
  buildPreview,
} from "../preview/previewEngine";

import OptionRenderer from "./OptionRenderer";
import SummaryPanel from "./SummaryPanel";
import ProductPreview from "./ProductPreview";
import LeadForm from "./LeadForm";

type ConfiguratorProps = {
  clientId: string;
  clientName: string;
  schema: ProductSchema;
};

function Configurator({
  clientId,
  clientName,
  schema,
}: ConfiguratorProps) {
  const [
    configuration,
    setConfiguration,
  ] =
    useState<ConfigurationState>(
      () =>
        createInitialConfiguration(
          schema,
        ),
    );

  const validation =
    useMemo(
      () =>
        validateConfiguration(
          schema,
          configuration,
        ),
      [
        schema,
        configuration,
      ],
    );

  const errorMap =
    useMemo(() => {
      const result: Record<
        string,
        string
      > = {};

      for (
        const error of
        validation.errors
      ) {
        if (
          !result[
            error.optionId
          ]
        ) {
          result[
            error.optionId
          ] = error.message;
        }
      }

      return result;
    }, [
      validation.errors,
    ]);

  const pricing =
    useMemo(() => {
      if (
        !validation.valid
      ) {
        return null;
      }

      return calculatePrice(
        schema,
        configuration,
      );
    }, [
      schema,
      configuration,
      validation.valid,
    ]);

  const preview =
    useMemo(
      () =>
        buildPreview(
          schema,
          configuration,
        ),
      [
        schema,
        configuration,
      ],
    );

  function handleOptionChange(
    optionId: string,
    value:
      ConfigurationValue,
  ) {
    setConfiguration(
      (currentState) =>
        setConfigurationValue(
          schema,
          currentState,
          optionId,
          value,
        ),
    );
  }

  return (
    <>
      <header className="configurator-header">
        <h1>
          {schema.product.name}
        </h1>

        {schema.product
          .description && (
          <p>
            {
              schema.product
                .description
            }
          </p>
        )}
      </header>

      <ProductPreview
        preview={preview}
        isValid={
          validation.valid
        }
      />

      <div className="configurator-layout">
        <section className="configurator-main">
          {schema.steps.map(
            (
              step,
              stepIndex,
            ) => (
              <article
                className="configurator-step"
                key={step.id}
              >
                <div className="configurator-step-header">
                  <h2>
                    {stepIndex +
                      1}
                    .{" "}
                    {step.title}
                  </h2>

                  {step.description && (
                    <p>
                      {
                        step.description
                      }
                    </p>
                  )}
                </div>

                {step.options.map(
                  (optionId) => (
                    <OptionRenderer
                      key={
                        optionId
                      }
                      optionId={
                        optionId
                      }
                      schema={
                        schema
                      }
                      configuration={
                        configuration
                      }
                      errors={
                        errorMap
                      }
                      onChange={
                        handleOptionChange
                      }
                    />
                  ),
                )}
              </article>
            ),
          )}

          <LeadForm
            clientId={
              clientId
            }
            clientName={
              clientName
            }
            schema={schema}
            configuration={
              configuration
            }
            pricing={
              pricing
            }
            preview={
              preview
            }
            configurationIsValid={
              validation.valid
            }
          />
        </section>

        <SummaryPanel
          configuration={
            configuration
          }
          pricing={
            pricing
          }
          isValid={
            validation.valid
          }
        />
      </div>
    </>
  );
}

export default Configurator;