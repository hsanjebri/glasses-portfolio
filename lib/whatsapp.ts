import { site } from '@/content/site'

/** A wa.me deep link to the shop's WhatsApp with a prefilled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}
