"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function LiveMap({ start, dest, safetyPoints = [], routeCoords = [] }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const routeRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, { zoomControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !start || !dest) return;
    const map = mapRef.current;

    // Clear old markers/route
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (routeRef.current) {
      routeRef.current.remove();
      routeRef.current = null;
    }

    const startMarker = L.marker([start.lat, start.lng], { title: start.label || "Start" }).addTo(map);
    const destMarker = L.marker([dest.lat, dest.lng], { title: dest.label || "Destination" }).addTo(map);
    markersRef.current.push(startMarker, destMarker);

    if (safetyPoints.length) {
      safetyPoints.forEach((pt) => {
        const m = L.circleMarker([pt.lat, pt.lng], {
          color: "#16a34a",
          radius: 7,
          fillOpacity: 0.9,
        })
          .bindPopup(`${pt.name} • ${pt.contact}`)
          .addTo(map);
        markersRef.current.push(m);
      });
    }

    const coords =
      routeCoords && routeCoords.length
        ? routeCoords.map((p) => [p[1], p[0]])
        : [
            [start.lat, start.lng],
            [dest.lat, dest.lng],
          ];

    routeRef.current = L.polyline(coords, { color: "#16a34a", weight: 5, opacity: 0.9 }).addTo(map);

    const group = L.featureGroup([...markersRef.current, routeRef.current]);
    map.fitBounds(group.getBounds(), { padding: [24, 24] });
  }, [start, dest, safetyPoints, routeCoords]);

  return <div ref={containerRef} className="live-map" aria-label="Live map" />;
}

