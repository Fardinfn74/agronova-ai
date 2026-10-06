import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapField = {
  id: string;
  name: string;
  coordinates: [number, number];
  polygon?: [number, number][];
};

export function FieldMap({
  fields,
  selected,
  onSelect,
  onClickCoordinate,
}: {
  fields: MapField[];
  selected: string;
  onSelect?: ((id: string) => void) | undefined;
  onClickCoordinate?: ((coords: [number, number]) => void) | undefined;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const polygons = useRef<L.LayerGroup | null>(null);
  const clickMarker = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!holder.current || map.current) return;
    const instance = L.map(holder.current, { scrollWheelZoom: false }).setView([23.8, 90.2], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(instance);

    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);
    polygons.current = L.layerGroup().addTo(instance);

    if (onClickCoordinate) {
      instance.on("click", (e: L.LeafletMouseEvent) => {
        const lat = Math.round(e.latlng.lat * 10000) / 10000;
        const lng = Math.round(e.latlng.lng * 10000) / 10000;
        onClickCoordinate([lat, lng]);

        if (clickMarker.current) {
          clickMarker.current.setLatLng(e.latlng);
        } else {
          clickMarker.current = L.marker(e.latlng)
            .addTo(instance)
            .bindPopup("Selected Point")
            .openPopup();
        }
      });
    }

    const timer = setTimeout(() => instance.invalidateSize(), 150);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            instance.invalidateSize();
          })
        : null;

    if (resizeObserver && holder.current) {
      resizeObserver.observe(holder.current);
    }

    return () => {
      clearTimeout(timer);
      resizeObserver?.disconnect();
      instance.remove();
      map.current = null;
      markers.current = null;
      polygons.current = null;
    };
  }, [onClickCoordinate]);

  useEffect(() => {
    if (!map.current || !markers.current || !polygons.current) return;
    markers.current.clearLayers();
    polygons.current.clearLayers();

    fields.forEach((field) => {
      const active = field.id === selected;

      // Marker
      L.circleMarker(field.coordinates, {
        radius: active ? 12 : 9,
        color: "#fff",
        weight: 3,
        fillColor: active ? "#29583a" : "#7e9d73",
        fillOpacity: 1,
      })
        .addTo(markers.current!)
        .bindTooltip(field.name, { permanent: active, direction: "top" })
        .on("click", () => onSelect?.(field.id));

      // Draw polygon if available or draw a 100m approximate farm perimeter around coordinate
      if (field.polygon && field.polygon.length > 2) {
        L.polygon(field.polygon, {
          color: active ? "#1d3e2b" : "#4a7c59",
          weight: 2,
          fillColor: active ? "#29583a" : "#7e9d73",
          fillOpacity: 0.25,
        }).addTo(polygons.current!);
      }
    });

    const current = fields.find((f) => f.id === selected);
    if (current && map.current) {
      map.current.panTo(current.coordinates);
    }
  }, [fields, selected, onSelect]);

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map.current) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.current.setView([lat, lon], 12);
        if (onClickCoordinate) {
          onClickCoordinate([Math.round(lat * 10000) / 10000, Math.round(lon * 10000) / 10000]);
        }
      }
    } catch {
      // Fallback silently if Nominatim has rate limit
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={searchLocation}
        className="absolute top-2 left-2 z-[400] flex max-w-[240px] items-center gap-1 rounded-xl bg-background/90 p-1.5 shadow-md backdrop-blur sm:max-w-xs"
      >
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search village/district…"
          className="w-full bg-transparent px-2 py-1 text-xs outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="clay-chip shrink-0 px-2 py-1 text-xs font-semibold"
        >
          {isSearching ? "…" : "Find"}
        </button>
      </form>
      <div
        ref={holder}
        role="application"
        aria-label="Interactive OpenStreetMap field map"
        className="h-[360px] w-full overflow-hidden rounded-2xl border border-border md:h-[440px]"
      />
    </div>
  );
}
