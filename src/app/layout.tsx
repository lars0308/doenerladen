import type { Metadata, Viewport } from "next";

import "./globals.css";
import { fraunces, karla } from "./fonts";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { getSiteSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  const title = `${site.shopName} — Familie Aslan, seit 1999`;
  const description = `${site.shopName} in ${site.street}, ${site.city}. Familie Aslan seit 1999 — Döner & Grillgerichte, Restaurant & Biergarten, zum Mitnehmen oder Vorbestellen.`;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${site.shopName}` },
    description,
    keywords: ["Döner Lindhorst", "Dönerladen Lindhorst", "Grillrestaurant Lindhorst", "Essen Lindhorst", "Döner Schaumburg"],
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: site.shopName,
      locale: "de_DE",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#241d17",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const siteSettings = await getSiteSettings();

  return (
    <html lang="de" className={`${fraunces.variable} ${karla.variable}`}>
      <body>
        <a className="visually-hidden" href="#main">Zum Inhalt springen</a>
        <Header shopName={siteSettings.shopName} />
        <main id="main">{children}</main>
        <Footer siteSettings={siteSettings} />
        <CookieBanner />
        <LocalBusinessJsonLd siteSettings={siteSettings} />
      </body>
    </html>
  );
}
