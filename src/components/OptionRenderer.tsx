import {
  useEffect,
  useState,
} from "react";

import type { ProductSchema } from "../schema/productSchema";

import type {
  ConfigurationState,
  ConfigurationValue,
} from "../core/configurationEngine";

type OptionRendererProps = {
  optionId: string;
  schema: ProductSchema;
  configuration: ConfigurationState;
  errors: Record<string, string>;
  onChange: (
    optionId: string,
    value: ConfigurationValue,
  ) => void;
};

type NumericInputProps = {
  id: string;
  label: string;
  value: ConfigurationValue | undefined;
  min?: number;
  max?: number;
  error?: string;
  helpText?: string;
  onChange: (
    value: number,
  ) => void;
};

function NumericInput({
  id,
  label,
  value,
  min,
  max,
  error,
  helpText,
  onChange,
}: NumericInputProps) {
  const [draftValue, setDraftValue] =
    useState(
      typeof value === "number"
        ? String(value)
        : "",
    );

  useEffect(() => {
    if (typeof value === "number") {
      setDraftValue(String(value));
    }
  }, [value]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextValue =
      event.target.value;

    setDraftValue(nextValue);

    if (
      nextValue === "" ||
      nextValue === "-" ||
      nextValue === "." ||
      nextValue === "-."
    ) {
      return;
    }

    const numericValue =
      Number(nextValue);

    if (
      !Number.isFinite(numericValue)
    ) {
      return;
    }

    onChange(numericValue);
  }

  function handleBlur() {
    if (draftValue === "") {
      if (typeof value === "number") {
        setDraftValue(
          String(value),
        );
      }

      return;
    }

    const numericValue =
      Number(draftValue);

    if (
      !Number.isFinite(numericValue)
    ) {
      if (typeof value === "number") {
        setDraftValue(
          String(value),
        );
      }

      return;
    }

    setDraftValue(
      String(numericValue),
    );
  }

  return (
    <div className="option-field">
      <label
        className="option-label"
        htmlFor={`option-${id}`}
      >
        {label}
      </label>

      <input
        id={`option-${id}`}
        className={
          error
            ? "option-input option-input-error"
            : "option-input"
        }
        type="number"
        value={draftValue}
        min={min}
        max={max}
        onChange={handleChange}
        onBlur={handleBlur}
      />

      {helpText && (
        <small className="option-help">
          {helpText}
        </small>
      )}

      {error && (
        <div className="option-error">
          {error}
        </div>
      )}
    </div>
  );
}

function OptionRenderer({
  optionId,
  schema,
  configuration,
  errors,
  onChange,
}: OptionRendererProps) {
  const option =
    schema.options[optionId];

  if (!option) {
    return null;
  }

  if (
    option.inputType ===
    "numeric_single"
  ) {
    const currentValue =
      configuration[optionId];

    const hasRange =
      option.validation?.min !==
        undefined &&
      option.validation?.max !==
        undefined;

    return (
      <NumericInput
        id={optionId}
        label={option.label}
        value={currentValue}
        min={option.validation?.min}
        max={option.validation?.max}
        error={errors[optionId]}
        helpText={
          hasRange
            ? `Interval permis: ${option.validation?.min} – ${option.validation?.max} cm`
            : undefined
        }
        onChange={(value) =>
          onChange(
            optionId,
            value,
          )
        }
      />
    );
  }

  if (
    option.inputType === "select"
  ) {
    const currentValue =
      configuration[optionId];

    return (
      <div className="option-field">
        <label
          className="option-label"
          htmlFor={`option-${optionId}`}
        >
          {option.label}
        </label>

        <select
          id={`option-${optionId}`}
          className={
            errors[optionId]
              ? "option-select option-input-error"
              : "option-select"
          }
          value={
            typeof currentValue ===
            "string"
              ? currentValue
              : ""
          }
          onChange={(event) =>
            onChange(
              optionId,
              event.target.value,
            )
          }
        >
          {option.values.map(
            (value) => (
              <option
                key={value.id}
                value={value.id}
              >
                {value.label}
              </option>
            ),
          )}
        </select>

        {errors[optionId] && (
          <div className="option-error">
            {errors[optionId]}
          </div>
        )}
      </div>
    );
  }

  if (
    option.inputType ===
    "color_swatch"
  ) {
    const currentValue =
      configuration[optionId];

    return (
      <div className="option-field">
        <div className="option-label">
          {option.label}
        </div>

        <div className="swatch-list">
          {option.values.map(
            (value) => {
              const isSelected =
                currentValue ===
                value.id;

              return (
                <button
                  key={value.id}
                  type="button"
                  className={
                    isSelected
                      ? "swatch-button selected"
                      : "swatch-button"
                  }
                  onClick={() =>
                    onChange(
                      optionId,
                      value.id,
                    )
                  }
                >
                  <span
                    className="swatch-circle"
                    style={{
                      backgroundColor:
                        value.color,
                    }}
                  />

                  <span>
                    {value.label}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {errors[optionId] && (
          <div className="option-error">
            {errors[optionId]}
          </div>
        )}
      </div>
    );
  }

  if (
    option.inputType ===
    "numeric_pair"
  ) {
    return (
      <div className="option-field">
        <div className="option-label">
          {option.label}
        </div>

        {option.fields.map(
          (field) => {
            const currentValue =
              configuration[
                field.id
              ];

            const hasRange =
              field.validation
                ?.min !==
                undefined &&
              field.validation
                ?.max !==
                undefined;

            return (
              <NumericInput
                key={field.id}
                id={field.id}
                label={
                  field.label
                }
                value={
                  currentValue
                }
                min={
                  field.validation
                    ?.min
                }
                max={
                  field.validation
                    ?.max
                }
                error={
                  errors[field.id]
                }
                helpText={
                  hasRange
                    ? `Interval permis: ${field.validation?.min} – ${field.validation?.max}`
                    : undefined
                }
                onChange={(
                  value,
                ) =>
                  onChange(
                    field.id,
                    value,
                  )
                }
              />
            );
          },
        )}
      </div>
    );
  }

  return null;
}

export default OptionRenderer;