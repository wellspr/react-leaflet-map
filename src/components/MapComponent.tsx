import { FC, useEffect, useRef } from "react";
import Map, { mapLocation, useLeaflet, Types, icon } from "../react-leaflet";

const MapComponent: FC<{ center: { lat: number, lng: number }, zoom: number }> = ({ center, zoom }) => {

    const { mapRef, markerRef } = useLeaflet();

    const coordsRef = useRef<{ lat: number, lng: number }>(center);

    const mapOptions: Types.MapOptions = {
        center: mapLocation(center.lat, center.lng),
        zoom: zoom,
        scrollWheelZoom: "center",
    };

    const zoomOptions: Types.ZoomOptions = {
        position: "topright",
    };

    const scaleOptions: Types.ScaleOptions = {
        position: "topright"
    };

    const iconSize = { width: 40, height: 60 };
    const shadowSize = { width: 20, height: 20 };

    const customIcon = icon({
        iconUrl: "map-pin.svg",
        iconSize: [iconSize.width, iconSize.height],
        iconAnchor: [iconSize.width / 2, iconSize.height],
        shadowUrl: "oval-vertical-filled.svg",
        shadowSize: [shadowSize.width, shadowSize.width],
        shadowAnchor: [shadowSize.width / 2, shadowSize.width / 2],
        popupAnchor: [0, -2 * iconSize.height / 3],
    });

/*     const cssIcon = divIcon({
        className: "map-pin",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -20],
    }); */

    const markerOptions: Types.MarkerOptions = {
        opacity: .55,
        icon: customIcon,
    };

    useEffect(() => {
        mapRef?.current?.setZoom(zoom);
    }, [zoom]);

    useEffect(() => {
        mapRef?.current?.flyTo(mapLocation(center.lat, center.lng));
        markerRef?.current?.setLatLng(mapLocation(center.lat, center.lng));
    }, [center]);

    const onUpdateLocation = () => {
        const center = markerRef?.current?.getLatLng();
        if (center) {
            coordsRef.current = { lat: center.lat, lng: center.lng };
        }
        console.log(center, coordsRef.current);
    };

    /* Dragend events handler / Update coords */
    useEffect(() => {
        const updateCords = () => {
            onUpdateLocation();
        };

        if (markerRef && markerRef.current) {
            markerRef.current.on("dragend", updateCords);
        }

        return () => {
            if (markerRef && markerRef.current) {
                markerRef.current.off("dragend", updateCords);
            }   
        }
    }, [markerRef && markerRef.current]);

    /* Handle Clicks on Map */
    useEffect(() => {
        const handleClickOnMap = (e: Types.MouseEvent) => {
            console.log("click", e.latlng);
        };

        if (mapRef && mapRef.current) {
            mapRef.current.on("click", handleClickOnMap);
        }

        return () => {
            if (mapRef && mapRef.current) {
                mapRef.current.off("click", handleClickOnMap);
            }
        }
    }, [mapRef && mapRef.current]);

    /* Custom marker popup */
    useEffect(() => {
        if (markerRef && markerRef.current) {

            /* Initialize bindPopup */
            markerRef?.current?.bindPopup("");

            const onMarkerClickHandler = (e: Types.MouseEvent) => {
                const coords = e.latlng;
                const content: Types.PopupContent =
                    `<div>
                        <div>Latitude: ${coords.lat}</div>
                        <div>Longitude: ${coords.lng}</div>
                    </div>`;

                markerRef.current?.bindPopup(content);
            };

            markerRef.current.on("click", onMarkerClickHandler);

            return () => {
                if (markerRef && markerRef.current) {
                    markerRef.current.off("click", onMarkerClickHandler);
                }
            }
        }
    }, [markerRef && markerRef.current]);

    return (
        <div className="map-component">
            <button onClick={onUpdateLocation}>Update Location</button>
            
            <Map
                height={250}
                mapOptions={mapOptions}
                scaleOptions={scaleOptions}
                zoomOptions={zoomOptions}
                markerOptions={markerOptions}
            />
        </div>
    );
};

export default MapComponent;