"use client";

import { useEffect, useRef, useState } from "react";

type CountryOption = { code: string; name: string; emoji?: string };
type StateOption = { code: string; name: string };
type CityOption = { id: number; name: string };

type LocationValue = {
  country: string;
  state: string;
  city: string;
};

type CheckoutLocationFieldsProps = {
  value: LocationValue;
  onChange: (patch: Partial<LocationValue>) => void;
};

const fieldClass =
  "w-full h-[43px] px-0 py-3 bg-transparent border-0 border-b border-zibara-cream/40 text-zibara-cream text-[11px] font-mono placeholder:text-zibara-cream/40 focus:outline-none focus:border-zibara-cream/70 transition-colors disabled:cursor-not-allowed disabled:opacity-45";
const selectClass = `${fieldClass} pr-9 cursor-pointer appearance-none`;
const labelClass =
  "block text-[8px] uppercase tracking-[0.4em] font-mono text-zibara-cream/60 mb-2";
const optionClass = "bg-zibara-deep text-zibara-cream";

function SelectChevron() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[18px] right-1 h-1.5 w-1.5 rotate-45 border-b border-r border-zibara-cream/50"
    />
  );
}

async function getOptions<T>(
  params: URLSearchParams,
  signal: AbortSignal,
): Promise<T[]> {
  const query = params.toString();
  const response = await fetch(`/api/locations${query ? `?${query}` : ""}`, {
    signal,
  });
  const result = await response.json();

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.error || "Unable to load location options.");
  }

  return result.data as T[];
}

export default function CheckoutLocationFields({
  value,
  onChange,
}: CheckoutLocationFieldsProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [loading, setLoading] = useState<
    "countries" | "states" | "cities" | ""
  >("countries");
  const [manualMode, setManualMode] = useState<
    "all" | "state" | "city" | ""
  >("");
  const [notice, setNotice] = useState("");
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;

    getOptions<CountryOption>(new URLSearchParams(), controller.signal)
      .then((items) => {
        if (!items.length) throw new Error("No countries were returned.");
        setCountries(items);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setManualMode("all");
        setNotice(
          "Location suggestions are unavailable. Enter your delivery address manually.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading("");
      });

    return () => controller.abort();
  }, []);

  const loadStates = async (code: string) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading("states");
    setNotice("");

    try {
      const items = await getOptions<StateOption>(
        new URLSearchParams({ country: code }),
        controller.signal,
      );
      setStates(items);

      if (!items.length) {
        setManualMode("state");
        setNotice(
          "No state or province list is available for this country. Enter it manually.",
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStates([]);
      setManualMode("state");
      setNotice(
        "State suggestions are unavailable. Enter your state and city manually.",
      );
    } finally {
      if (!controller.signal.aborted) setLoading("");
    }
  };

  const loadCities = async (country: string, state: string) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading("cities");
    setNotice("");

    try {
      const items = await getOptions<CityOption>(
        new URLSearchParams({ country, state }),
        controller.signal,
      );
      setCities(items);

      if (!items.length) {
        setManualMode("city");
        setNotice(
          "No city list is available for this state. Enter your city manually.",
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setCities([]);
      setManualMode("city");
      setNotice("City suggestions are unavailable. Enter your city manually.");
    } finally {
      if (!controller.signal.aborted) setLoading("");
    }
  };

  const handleCountryChange = (code: string) => {
    const selected = countries.find((country) => country.code === code);
    setCountryCode(code);
    setStateCode("");
    setStates([]);
    setCities([]);
    setManualMode("");
    setNotice("");
    onChange({ country: selected?.name || "", state: "", city: "" });

    if (selected) void loadStates(selected.code);
  };

  const handleStateChange = (code: string) => {
    if (code === "__manual") {
      setStateCode("");
      setCities([]);
      setManualMode("state");
      setNotice("Enter your state or province and city manually.");
      onChange({ state: "", city: "" });
      return;
    }

    const selected = states.find((state) => state.code === code);
    setStateCode(code);
    setCities([]);
    setManualMode("");
    setNotice("");
    onChange({ state: selected?.name || "", city: "" });

    if (selected) void loadCities(countryCode, selected.code);
  };

  const status = (
    <div className="flex min-h-4 flex-col gap-1 text-[8px] font-mono uppercase tracking-[0.2em] text-zibara-cream/45 sm:flex-row sm:items-center sm:justify-between">
      <span role="status" aria-live="polite">
        {notice}
      </span>
      <a
        href="https://countrystatecity.in/"
        target="_blank"
        rel="noreferrer"
        className="shrink-0 underline decoration-zibara-cream/20 underline-offset-4 transition-colors hover:text-zibara-cream/70"
      >
        Location data attribution
      </a>
    </div>
  );

  if (manualMode === "all") {
    return (
      <div className="space-y-6">
        <div>
          <label className={labelClass} htmlFor="checkout-country">
            Country *
          </label>
          <input
            id="checkout-country"
            name="country"
            autoComplete="country-name"
            required
            value={value.country}
            onChange={(event) => onChange({ country: event.target.value })}
            className={fieldClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="checkout-state">
              State / Province *
            </label>
            <input
              id="checkout-state"
              name="state"
              autoComplete="address-level1"
              required
              value={value.state}
              onChange={(event) => onChange({ state: event.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="checkout-city">
              City *
            </label>
            <input
              id="checkout-city"
              name="city"
              autoComplete="address-level2"
              required
              value={value.city}
              onChange={(event) => onChange({ city: event.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
        {status}
      </div>
    );
  }

  const isManualState = manualMode === "state";
  const isManualCity = isManualState || manualMode === "city";

  return (
    <div className="space-y-6">
      <div className="relative">
        <label className={labelClass} htmlFor="checkout-country">
          Country *
        </label>
        <select
          id="checkout-country"
          name="country"
          autoComplete="country"
          required
          value={countryCode}
          disabled={loading === "countries"}
          onChange={(event) => handleCountryChange(event.target.value)}
          className={selectClass}
          style={{ backgroundImage: "none" }}
        >
          <option value="" className={optionClass}>
            {loading === "countries" ? "Loading countries…" : "Select country"}
          </option>
          {countries.map((country) => (
            <option
              key={country.code}
              value={country.code}
              className={optionClass}
            >
              {country.emoji ? `${country.emoji} ` : ""}
              {country.name}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="relative">
          <label className={labelClass} htmlFor="checkout-state">
            State / Province *
          </label>
          {isManualState ? (
            <input
              id="checkout-state"
              name="state"
              autoComplete="address-level1"
              required
              value={value.state}
              onChange={(event) => onChange({ state: event.target.value })}
              className={fieldClass}
            />
          ) : (
            <select
              id="checkout-state"
              name="state"
              autoComplete="address-level1"
              required
              value={stateCode}
              disabled={!countryCode || loading === "states"}
              onChange={(event) => handleStateChange(event.target.value)}
              className={selectClass}
              style={{ backgroundImage: "none" }}
            >
              <option value="" className={optionClass}>
                {loading === "states" ? "Loading states…" : "Select state / province"}
              </option>
              {states.map((state) => (
                <option
                  key={state.code}
                  value={state.code}
                  className={optionClass}
                >
                  {state.name}
                </option>
              ))}
              {!!states.length && (
                <option value="__manual" className={optionClass}>
                  My state / province is not listed
                </option>
              )}
            </select>
          )}
          {!isManualState && <SelectChevron />}
        </div>

        <div className="relative">
          <label className={labelClass} htmlFor="checkout-city">
            City *
          </label>
          {isManualCity ? (
            <input
              id="checkout-city"
              name="city"
              autoComplete="address-level2"
              required
              value={value.city}
              onChange={(event) => onChange({ city: event.target.value })}
              className={fieldClass}
            />
          ) : (
            <select
              id="checkout-city"
              name="city"
              autoComplete="address-level2"
              required
              value={value.city}
              disabled={!stateCode || loading === "cities"}
              onChange={(event) => {
                if (event.target.value === "__manual") {
                  setManualMode("city");
                  setNotice("Enter your city manually.");
                  onChange({ city: "" });
                  return;
                }
                onChange({ city: event.target.value });
              }}
              className={selectClass}
              style={{ backgroundImage: "none" }}
            >
              <option value="" className={optionClass}>
                {loading === "cities" ? "Loading cities…" : "Select city"}
              </option>
              {cities.map((city) => (
                <option
                  key={`${city.id}-${city.name}`}
                  value={city.name}
                  className={optionClass}
                >
                  {city.name}
                </option>
              ))}
              {!!cities.length && (
                <option value="__manual" className={optionClass}>
                  My city is not listed
                </option>
              )}
            </select>
          )}
          {!isManualCity && <SelectChevron />}
        </div>
      </div>

      {status}
    </div>
  );
}
