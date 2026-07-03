import { routing } from "./routing";

// Allow only the locales defined in routing
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
  }
}
