import { createRequire } from "node:module";
import { NextRequest, NextResponse } from "next/server";
import type {
  ICity,
  ICountry,
  IState,
} from "@countrystatecity/countries";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const locations = require(
  "@countrystatecity/countries",
) as typeof import("@countrystatecity/countries");

const cacheHeaders = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

const isValidCountryCode = (value: string) => /^[A-Z]{2}$/.test(value);
const isValidStateCode = (value: string) => /^[A-Z0-9-]{1,10}$/.test(value);

export async function GET(request: NextRequest) {
  try {
    const country =
      request.nextUrl.searchParams.get("country")?.trim().toUpperCase() || "";
    const state =
      request.nextUrl.searchParams.get("state")?.trim().toUpperCase() || "";

    if (!country) {
      const countries = await locations.getCountries();
      const data = countries
        .map((item: ICountry) => ({
          code: item.iso2,
          name: item.name,
          emoji: item.emoji,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({ success: true, data }, { headers: cacheHeaders });
    }

    if (
      !isValidCountryCode(country) ||
      (state && !isValidStateCode(state))
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid location code." },
        { status: 400 },
      );
    }

    if (!state) {
      const states = await locations.getStatesOfCountry(country);
      const data = states
        .map((item: IState) => ({ code: item.iso2, name: item.name }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return NextResponse.json({ success: true, data }, { headers: cacheHeaders });
    }

    const cities = await locations.getCitiesOfState(country, state);
    const uniqueCities = new Map<string, { id: number; name: string }>();

    cities.forEach((item: ICity) => {
      const name = item.name.trim();
      const key = name.toLocaleLowerCase();
      if (key && !uniqueCities.has(key)) {
        uniqueCities.set(key, { id: item.id, name });
      }
    });

    const data = [...uniqueCities.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return NextResponse.json({ success: true, data }, { headers: cacheHeaders });
  } catch (error) {
    console.error("Location lookup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Location options are temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
