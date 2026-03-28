import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    onLocationSelect(position);
  }, [position, onLocationSelect]);

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-neon-purple mt-2 z-0 relative">
      <MapContainer center={[position.lat, position.lng]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} className="z-0">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
