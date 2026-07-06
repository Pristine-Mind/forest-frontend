"use client";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature } from "geojson";
import "leaflet/dist/leaflet.css";
import { forestBoundaries } from "@/lib/data/forest-boundaries.geojson";

const styleByFeature = (feature?: Feature): PathOptions => {
  const isUnlabeled = feature?.properties?.name?.includes("unlabeled");
  return {
    color: isUnlabeled ? "#a3a3a3" : "#15803d",
    weight: 2,
    fillColor: isUnlabeled ? "#a3a3a3" : "#22c55e",
    fillOpacity: isUnlabeled ? 0.1 : 0.25,
  };
};

function onEachFeature(feature: Feature, layer: Layer) {
  const name = feature.properties?.name ?? "Unnamed area";
  layer.bindTooltip(name, { sticky: true });
}

export function ForestBoundaryMap() {
  // Centered roughly on the boundary data above
  const center: [number, number] = [28.81, 80.695];

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg border">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON data={forestBoundaries} style={styleByFeature} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
}
