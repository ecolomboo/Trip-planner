import { getRequestConfig } from "next-intl/server";
import { routing, isLocale } from "./routing";
import en from "../messages/en.json";
import it from "../messages/it.json";

// Statically imported so the message catalogs stay fully typed (no dynamic
// imports, no `any`) and so a key drift between locales fails typechecking.
const catalogs = { en, it };

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is the matched `[locale]` segment (or an explicit override
  // from `getMessages({locale})`). It resolves from the header the middleware
  // sets. next-intl 4.13+ prefers `next/root-params`, but that module is not
  // yet compiler-replaced under the Turbopack build for this entry, so we stay
  // on the stable path.
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: catalogs[locale],
  };
});
