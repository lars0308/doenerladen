import type { MenuItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function Dish({ dish }: { dish: MenuItem }) {
  const badges = [
    dish.isVegetarian && "vegetarisch",
    dish.isVegan && "vegan",
    dish.isSpicy && "scharf",
  ].filter(Boolean) as string[];

  return (
    <div className={`dish${dish.isBestseller ? " dish--signature" : ""}`}>
      <span className="dish__num">{dish.number || "·"}</span>
      <div className="dish__body">
        <h3>
          {dish.name}
          {dish.allergenNumbers && dish.allergenNumbers.length > 0 && (
            <sup>{dish.allergenNumbers.join(",")}</sup>
          )}
          {dish.isBestseller && <span className="chip badge-new">Beliebt</span>}
          {badges.map((b) => (
            <span className="chip" key={b}>{b}</span>
          ))}
        </h3>
        {dish.description && <p>{dish.description}</p>}
      </div>
      <span className="dish__price">{formatPrice(dish.price)}</span>
    </div>
  );
}
