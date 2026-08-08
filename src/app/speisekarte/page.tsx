import type { Metadata } from "next";

import { getMenu, getMenuSettings } from "@/lib/content";
import { CategoryNav } from "@/components/CategoryNav";
import { Dish } from "@/components/Dish";

export const metadata: Metadata = {
  title: "Speisekarte",
  description: "Die komplette Speisekarte des Lindhorster Grill & Dönerhaus: Vorspeisen, Dönerspeisen, Grillspezialitäten, Pizzen, Rollo, Pasta, Getränke.",
};

export default async function SpeisekartePage() {
  const [{ categories, items }, menuSettings] = await Promise.all([getMenu(), getMenuSettings()]);

  const itemsByCategory = new Map<string, typeof items>();
  for (const item of items) {
    const slug = item.category?.slug;
    if (!slug) continue;
    if (!itemsByCategory.has(slug)) itemsByCategory.set(slug, []);
    itemsByCategory.get(slug)!.push(item);
  }

  const categoriesWithItems = categories.filter((c) => (itemsByCategory.get(c.slug) ?? []).length > 0);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">Stand {menuSettings.standDatum}</p>
          <h1>Die Speisekarte</h1>
          <p className="lede">Alle Preise inkl. gesetzlicher MwSt. Zum Mitnehmen einfach anrufen — wir machen alles frisch für dich abholbereit.</p>
        </div>
      </section>

      <CategoryNav categories={categoriesWithItems.map((c) => ({ slug: c.slug, title: c.title, meta: c.meta }))} />

      <div className="container menu-wrap">
        {categoriesWithItems.map((category) => (
          <section className="menu-cat" id={category.slug} key={category._id}>
            <h2>
              {category.title}
              {category.meta && <span className="menu-cat__meta">{category.meta}</span>}
            </h2>
            {category.note && <p className="menu-cat__note">{category.note}</p>}
            <div className="dish-list">
              {(itemsByCategory.get(category.slug) ?? []).map((dish) => (
                <Dish dish={dish} key={dish._id} />
              ))}
            </div>
          </section>
        ))}

        {menuSettings.allergenLegend.length > 0 && (
          <section className="allergene">
            <h2>Verwendete Zusatzstoffe & Allergene</h2>
            <ol className="allergene__list">
              {menuSettings.allergenLegend.map((entry) => (
                <li key={entry.number} value={entry.number}>{entry.text}</li>
              ))}
            </ol>
            {menuSettings.footerNote && <p className="allergene__foot">{menuSettings.footerNote} Stand {menuSettings.standDatum}.</p>}
          </section>
        )}
      </div>
    </>
  );
}
