import { getRequestConfig } from "next-intl/server";

const locales = ["en", "am"];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming `locale` is valid
  if (!locale || !locales.includes(locale)) {
    locale = "en";
  }

  const msgs = (await import(`../../messages/${locale}.json`)).default;
  // Both en.json and am.json currently have a root key (either 'en' or 'am').
  // We extract the first value to unwrap it reliably.
  const unwrappedMessages = Object.values(msgs)[0] || msgs;

  return {
    locale,
    messages: unwrappedMessages as Record<string, string>,
  };
});
