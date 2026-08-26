import {
  useState,
  type FormEvent,
} from "react";

import type { ProductSchema } from "../schema/productSchema";
import type { ConfigurationState } from "../core/configurationEngine";
import type { PricingResult } from "../pricing/pricingEngine";
import type { PreviewResult } from "../preview/previewEngine";

import {
  createLeadSnapshot,
  type LeadSnapshot,
} from "../lead/leadEngine";

import {
  saveLeadToDatabase,
} from "../lead/leadRepository";

type LeadFormProps = {
  clientId: string;
  clientName: string;

  schema: ProductSchema;
  configuration: ConfigurationState;
  pricing: PricingResult | null;
  preview: PreviewResult;
  configurationIsValid: boolean;

  onLeadCreated?: (
    lead: LeadSnapshot,
  ) => void;
};

type FormErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

function LeadForm({
  clientId,
  clientName,
  schema,
  configuration,
  pricing,
  preview,
  configurationIsValid,
  onLeadCreated,
}: LeadFormProps) {
  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  function validateForm(): FormErrors {
    const nextErrors:
      FormErrors = {};

    if (
      name.trim().length < 2
    ) {
      nextErrors.name =
        "Introdu un nume valid.";
    }

    const normalizedPhone =
      phone.replace(
        /\s+/g,
        "",
      );

    if (
      normalizedPhone.length <
      7
    ) {
      nextErrors.phone =
        "Introdu un număr de telefon valid.";
    }

    if (
      email.trim() !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim(),
      )
    ) {
      nextErrors.email =
        "Introdu o adresă de email validă.";
    }

    return nextErrors;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSuccessMessage("");
    setSubmitError("");

    if (
      !configurationIsValid ||
      !pricing
    ) {
      setSubmitError(
        "Configurația trebuie să fie validă înainte de trimitere.",
      );

      return;
    }

    const nextErrors =
      validateForm();

    setErrors(
      nextErrors,
    );

    if (
      Object.keys(
        nextErrors,
      ).length > 0
    ) {
      return;
    }

    const lead =
      createLeadSnapshot(
        {
          id: clientId,
          name: clientName,
        },
        schema,
        configuration,
        pricing,
        preview,
        {
          name,
          phone,
          email,
        },
      );

    try {
      setIsSubmitting(
        true,
      );

      await saveLeadToDatabase(
        lead,
      );

      onLeadCreated?.(
        lead,
      );

      setSuccessMessage(
        "Solicitarea a fost salvată în baza de date.",
      );

      setName("");
      setPhone("");
      setEmail("");
      setErrors({});
    } catch (error) {
      console.error(
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Solicitarea nu a putut fi salvată.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  return (
    <section className="lead-card">
      <div className="lead-card-header">
        <h2>
          Solicită oferta
        </h2>

        <p>
          Lasă datele de contact,
          iar configurația și
          prețul estimativ vor fi
          salvate împreună cu
          solicitarea.
        </p>
      </div>

      <form
        className="lead-form"
        onSubmit={
          handleSubmit
        }
      >
        <div className="lead-field">
          <label
            className="lead-label"
            htmlFor="lead-name"
          >
            Nume
          </label>

          <input
            id="lead-name"
            className={
              errors.name
                ? "lead-input lead-input-error"
                : "lead-input"
            }
            type="text"
            value={name}
            onChange={(
              event,
            ) =>
              setName(
                event.target
                  .value,
              )
            }
            placeholder="Ex. Ion Popescu"
          />

          {errors.name && (
            <div className="lead-error">
              {errors.name}
            </div>
          )}
        </div>

        <div className="lead-field">
          <label
            className="lead-label"
            htmlFor="lead-phone"
          >
            Telefon
          </label>

          <input
            id="lead-phone"
            className={
              errors.phone
                ? "lead-input lead-input-error"
                : "lead-input"
            }
            type="tel"
            value={phone}
            onChange={(
              event,
            ) =>
              setPhone(
                event.target
                  .value,
              )
            }
            placeholder="+373 ..."
          />

          {errors.phone && (
            <div className="lead-error">
              {errors.phone}
            </div>
          )}
        </div>

        <div className="lead-field">
          <label
            className="lead-label"
            htmlFor="lead-email"
          >
            Email
          </label>

          <input
            id="lead-email"
            className={
              errors.email
                ? "lead-input lead-input-error"
                : "lead-input"
            }
            type="email"
            value={email}
            onChange={(
              event,
            ) =>
              setEmail(
                event.target
                  .value,
              )
            }
            placeholder="email@exemplu.md"
          />

          {errors.email && (
            <div className="lead-error">
              {errors.email}
            </div>
          )}
        </div>

        <button
          className="lead-submit"
          type="submit"
          disabled={
            !configurationIsValid ||
            !pricing ||
            isSubmitting
          }
        >
          {isSubmitting
            ? "Se salvează..."
            : "Trimite solicitarea"}
        </button>

        {!configurationIsValid && (
          <p className="lead-disabled-note">
            Corectează
            configurația înainte
            de trimitere.
          </p>
        )}

        {successMessage && (
          <div className="lead-success">
            {
              successMessage
            }
          </div>
        )}

        {submitError && (
          <div className="lead-submit-error">
            {submitError}
          </div>
        )}
      </form>
    </section>
  );
}

export default LeadForm;