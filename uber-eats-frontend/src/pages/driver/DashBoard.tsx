import React, { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";

interface DriverCoords {
  lat: number;
  long: number;
}

interface DriverOnMapProps {
  lat: number;
  lng: number;
  $hover?: any;
}

const Driver: React.FC<DriverOnMapProps> = () => {
  return (
    <div className="h-10 w-10 bg-white rounded-full flex justify-center items-center text-xl bg-transparent">
      🚚
    </div>
  );
};

const DashBoard = () => {
  const [driverCoords, setDriverCoords] = useState<DriverCoords>({
    long: 0,
    lat: 0,
  });
  const [map, setMap] = useState<google.maps.Map>(null);
  const [maps, setMaps] = useState<any>(null);
  const onSuccess: PositionCallback = ({ coords: { latitude, longitude } }) => {
    setDriverCoords({ lat: latitude, long: longitude });
  };
  const onError: PositionErrorCallback = (error) => {
    console.log(error);
  };
  useEffect(() => {
    navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
    });
  }, []);
  useEffect(() => {
    if (map && maps) {
      map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.long));
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: new google.maps.LatLng(driverCoords.lat, driverCoords.long),
        },
        (results, status) => {
          console.log(status, results);
        }
      );
    }
  }, [driverCoords.lat, driverCoords.long, map, maps]);
  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    setMap(map);
    setMaps(maps);
    setTimeout(() => {
      map.panTo(new maps.LatLng(driverCoords.lat, driverCoords.long));
    }, 2000);
  };
  return (
    <div>
      <div
        className="overflow-hidden"
        style={{
          width: window.innerWidth,
          height: "90vh",
        }}
      >
        <GoogleMapReact
          defaultCenter={{ lat: 55.751244, lng: 37.618423 }}
          defaultZoom={15}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={onApiLoaded}
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_KEY }}
        >
          <Driver lat={driverCoords.lat} lng={driverCoords.long} />
        </GoogleMapReact>
      </div>
    </div>
  );
};

export default DashBoard;
