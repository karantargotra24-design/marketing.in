/**
 * ONE place for brand identity. Change these values and the whole portfolio follows.
 * Palette taken from the reference video (near-black, ember orange-red, warm white).
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
    ink: "#0A0A0A",
    surface: "#141312",
    primary: "#FF4D1F",
    secondary: "#C7361A",
    text: "#F3F1EC",
    muted: "#8F8A84",
  },
} as const;

export const whatsappLink = (msg = "Hi Karan, I'd like to discuss a project.") =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`;
