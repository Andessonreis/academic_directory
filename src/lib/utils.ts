import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolves template variables for a given event.
 * Supported variables: {evento}, {data}, {horario}, {local}, {nome}
 * - {nome} is kept as-is when nomePlaceholder is not provided (email templates use it per-registrant)
 * - Set nomePlaceholder to substitute it in previews
 */
export function resolveEventVars(
  template: string,
  event: {
    title?: string | null
    event_date?: string | null
    event_time?: string | null
    location?: string | null
  },
  nomePlaceholder?: string
): string {
  const dateFormatted = event.event_date
    ? (() => {
        try {
          return new Date(event.event_date + "T12:00:00").toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        } catch {
          return event.event_date
        }
      })()
    : ""

  return template
    .replace(/\{evento\}/g, event.title ?? "")
    .replace(/\{data\}/g, dateFormatted)
    .replace(/\{horario\}/g, event.event_time ?? "")
    .replace(/\{local\}/g, event.location ?? "")
    .replace(/\{nome\}/g, nomePlaceholder ?? "{nome}")
}
