import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, HotspotCluster, PriorityLevel } from '../../types';

interface CivicMapProps {
  mode: 'display' | 'picker';
  complaints?: Complaint[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  // Picker mode props:
  pickerLat?: number;
  pickerLng?: number;
  onLocationPick?: (lat: number, lng: number) => void;
  // Hotspot overlay
  hotspots?: HotspotCluster[];
  showHotspots?: boolean;
  className?: string;
  zoom?: number;
  center?: [number, number];
}

const PRIORITY_COLORS: Record<PriorityLevel, { bg: string; border: string; label: string }> = {
  Critical: { bg: '#ef4444', border: '#b91c1c', label: 'Critical' },
  High: { bg: '#f97316', border: '#c2410c', label: 'High' },
  Medium: { bg: '#eab308', border: '#a16207', label: 'Medium' },
  Low: { bg: '#10b981', border: '#047857', label: 'Low' },
};

export const CivicMap: React.FC<CivicMapProps> = ({
  mode,
  complaints = [],
  selectedComplaintId,
  onSelectComplaint,
  pickerLat = 37.7749,
  pickerLng = -122.4194,
  onLocationPick,
  hotspots = [],
  showHotspots = false,
  className = 'h-96 w-full',
  zoom = 13,
  center = [37.7750, -122.4150],
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(containerRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    hotspotsLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle map click in picker mode
    if (mode === 'picker') {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (onLocationPick) {
          onLocationPick(Number(lat.toFixed(5)), Number(lng.toFixed(5)));
        }
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Handle Picker Marker
  useEffect(() => {
    if (mode !== 'picker' || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const pickerIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background-color: #0d9488;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

    if (!pickerMarkerRef.current) {
      const marker = L.marker([pickerLat, pickerLng], {
        icon: pickerIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        if (onLocationPick) {
          onLocationPick(
            Number(position.lat.toFixed(5)),
            Number(position.lng.toFixed(5))
          );
        }
      });

      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([pickerLat, pickerLng]);
    }
  }, [mode, pickerLat, pickerLng]);

  // Handle Display Mode Markers
  useEffect(() => {
    if (mode !== 'display' || !mapInstanceRef.current || !markersLayerRef.current)
      return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    complaints.forEach((c) => {
      if (typeof c.latitude !== 'number' || typeof c.longitude !== 'number') return;
      if (isNaN(c.latitude) || isNaN(c.longitude)) return;

      const priorityInfo = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.Medium;
      const isSelected = selectedComplaintId === c.id;
      const isCritical = c.priority === 'Critical';

      const customHtml = `
        <div style="
          position: relative;
          width: ${isSelected ? '32px' : '26px'};
          height: ${isSelected ? '32px' : '26px'};
          background-color: ${priorityInfo.bg};
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        " class="${isCritical ? 'marker-critical-pulse' : ''}">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'civic-marker-pin',
        html: customHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([c.latitude, c.longitude], {
        icon: markerIcon,
      });

      // Rich popup content
      const popupHtml = `
        <div style="padding: 12px; max-width: 260px; font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #64748b; font-family: monospace;">${c.id}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background-color: ${priorityInfo.bg}; color: white;">
              ${c.priority}
            </span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${c.title}
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${c.aiSummary || c.description}
          </p>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 ${c.address.split(',')[0]}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <span style="font-size: 11px; font-weight: 600; color: #0d9488;">${c.status}</span>
            <button id="btn-inspect-${c.id}" style="
              background: #0f172a;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 4px 8px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">Inspect</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const inspectBtn = document.getElementById(`btn-inspect-${c.id}`);
        if (inspectBtn) {
          inspectBtn.onclick = () => {
            if (onSelectComplaint) onSelectComplaint(c);
          };
        }
      });

      marker.on('click', () => {
        if (onSelectComplaint) onSelectComplaint(c);
      });

      markersGroup.addLayer(marker);
    });
  }, [mode, complaints, selectedComplaintId]);

  // Handle Hotspot Circles Overlay
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;
    const hotspotsGroup = hotspotsLayerRef.current;
    hotspotsGroup.clearLayers();

    if (showHotspots && hotspots.length > 0) {
      hotspots.forEach((h) => {
        const circle = L.circle([h.centerLat, h.centerLng], {
          radius: h.radiusMeters,
          color: h.criticalCount > 0 ? '#ef4444' : '#f59e0b',
          fillColor: h.criticalCount > 0 ? '#f87171' : '#fbbf24',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '4, 4',
        });

        circle.bindTooltip(
          `<strong>${h.name}</strong><br/>${h.complaintCount} reports • ${h.dominantCategory}`,
          { direction: 'top', className: 'hotspot-tooltip' }
        );

        hotspotsGroup.addLayer(circle);
      });
    }
  }, [showHotspots, hotspots]);

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-sm border border-slate-200 ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[300px]" />
      {mode === 'picker' && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-md text-slate-700 font-medium">
          📍 Click map or drag teal pin to set exact coordinates
        </div>
      )}
    </div>
  );
};
