import type { SiteSettings } from "@/lib/types";
import { groupOpeningHours, getOpenStatus } from "@/lib/opening-hours";

export function OpeningHoursCard({ siteSettings, showAddress = true }: { siteSettings: SiteSettings; showAddress?: boolean }) {
  const groups = groupOpeningHours(siteSettings.openingHours);
  const status = getOpenStatus(siteSettings.openingHours);

  return (
    <div className="hours-card card">
      <h3>Geschäftszeiten</h3>
      {status.known && (
        <span className={`status-badge ${status.state === "open" ? "status-badge--open" : "status-badge--closed"}`}>
          {status.state === "open" && "Jetzt geöffnet"}
          {status.state === "closed" && "Heute geschlossen"}
          {status.state === "opens-later" && `Öffnet heute um ${status.opensAt} Uhr`}
        </span>
      )}
      <table className="hours-table">
        <tbody>
          {groups.map((g) => (
            <tr key={g.label}>
              <td>{g.label}</td>
              <td>{g.timeText}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {siteSettings.openingHoursNotice && (
        <p className="order-form__hint" style={{ marginTop: 12 }}>{siteSettings.openingHoursNotice}</p>
      )}
      {showAddress && (
        <>
          <hr />
          <p className="hours-card__addr">
            {siteSettings.street}<br />
            {siteSettings.postalCode} {siteSettings.city}<br />
            Tel. {siteSettings.phone}
          </p>
        </>
      )}
    </div>
  );
}
