"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { GeoJSON as LeafletGeoJSON, Layer, PathOptions } from "leaflet";
import type { Feature } from "geojson";
import "leaflet/dist/leaflet.css";
import { forestBoundaries } from "@/lib/data/forest-boundaries.geojson";

const styleByFeature = (feature?: Feature): PathOptions => {
  const isUnlabeled = feature?.properties?.name?.includes("unlabeled");

  return {
    color: isUnlabeled ? "#525252" : "#14532d",
    weight: 3,
    opacity: 1,
    fillColor: isUnlabeled ? "#737373" : "#16a34a",
    fillOpacity: isUnlabeled ? 0.08 : 0.18,
  };
};

function onEachFeature(feature: Feature, layer: Layer) {
  const name = feature.properties?.name ?? "Unnamed Area";
  layer.bindTooltip(name, {
    sticky: true,
    direction: "top",
  });
}

function FitBounds() {
  const geoJsonRef = useRef<LeafletGeoJSON>(null);

  useEffect(() => {
    if (geoJsonRef.current) {
      const map = geoJsonRef.current._map;

      if (map) {
        map.fitBounds(geoJsonRef.current.getBounds(), {
          padding: [30, 30],
          maxZoom: 18,
        });
      }
    }
  }, []);

  return (
    <GeoJSON
      ref={geoJsonRef}
      data={forestBoundaries}
      style={styleByFeature}
      onEachFeature={onEachFeature}
    />
  );
}

export function ForestBoundaryMap() {
  return (
    <div className="h-[540px] w-full overflow-hidden rounded-xl border shadow-sm">
      <MapContainer
        center={[28.81, 80.695]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds />
      </MapContainer>
    </div>
  );
}
