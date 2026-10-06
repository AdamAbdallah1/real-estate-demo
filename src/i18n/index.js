/**
 * Public entry point of the language system.
 *
 * Components import their hooks from here (`import { useI18n } from '../i18n'`);
 * <I18nProvider> lives in `provider.jsx` so this file exports no components and
 * fast refresh keeps working.
 */
export { useI18n, useT } from './context.js'
export { DEFAULT_LOCALE, LOCALES } from './translations.js'
