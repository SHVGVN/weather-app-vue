import { toCityDate } from './forecast'
import type { City, Locale, Units } from '@/types/weather'

export function localeTag(locale: Locale): string {
  return locale === 'uk' ? 'uk-UA' : 'en-GB'
}

export function convertTemp(celsius: number, units: Units): number {
  return units === 'imperial' ? (celsius * 9) / 5 + 32 : celsius
}

export function formatTemp(celsius: number, units: Units): string {
  return `${Math.round(convertTemp(celsius, units))}°`
}

export function convertSpeed(metersPerSecond: number, units: Units): number {
  return units === 'imperial' ? metersPerSecond * 2.23694 : metersPerSecond
}

export function formatCityTime(
  dt: number,
  timezone: number,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(localeTag(locale), { ...options, timeZone: 'UTC' }).format(
    toCityDate(dt, timezone),
  )
}

export function cityLabel(city: City, locale: Locale): string {
  return city.localNames[locale] ?? city.name
}

export function capitalize(value: string): string {
  return value ? value[0]!.toLocaleUpperCase() + value.slice(1) : value
}
