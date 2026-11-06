/**
 * ONE place for brand identity. Change these values and the whole portfolio follows.
 * Colours are mirrored as CSS variables in src/app/globals.css (`.portfolio` block):
 * keep both in sync if you edit them.
 */
export const BRAND = {
  name: "ScapeMedia",
  person: "Karan Targotra",
  role: "Performance Marketer & Social Media Strategist",
  city: "Jammu, J&K",
  email: "hello@scapemedia.in",
  phone: "+91 90000 00000",
  /** Digits only, with country code. Used for wa.me links. */
  whatsapp: "919000000000",
  instagram: "https://instagram.com/scapemedia",
  linkedin: "https://linkedin.com/in/karantargotra",
  colors: {
    ink: "#07090B",
    surface: "#0E1215",
    primary: "#2EE59D",
    secondary: "#0FB5A6",
    text: "#EEF2F0",
    muted: "#8A958F",
  },
} as const;

export const whatsappLink = (msg = "Hi Karan, I'd like to discuss a project.") =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`;
