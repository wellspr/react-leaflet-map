import { useEffect, useRef, useState } from "react";
import Map, { mapLocation, useLeaflet, Types, icon } from "../react-leaflet";
import { divIcon } from "leaflet";

const MapComponent = () => {

    const { mapRef, markerRef } = useLeaflet();

    const lat = -22.8969;
    const lng = -43.2898;

    let location = mapLocation(lat, lng);

    const [coords, setCoords] = useState<{ lat: number, lng: number }>({ lat, lng });

    const coordsRef = useRef<{ lat: number, lng: number }>({ lat, lng });

    const [mapOptions, setMapOptions] = useState<Types.MapOptions>({
        center: location,
        zoom: 15,
        scrollWheelZoom: "center",
    });

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

    const cssIcon = divIcon({
        className: "map-pin",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -20],
    })

    const markerOptions: Types.MarkerOptions = {
        opacity: .55,
        icon: customIcon,
    };

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
            <form className="coords-form" onSubmit={e => e.preventDefault()}>
                <input
                    type="number"
                    step={.000000001}
                    className="coords-input-lat"
                    value={coords.lat}
                    onChange={e => setCoords({ ...coords, lat: Number(e.target.value) })}
                />
                <input
                    type="number"
                    step={.000000001}
                    className="coords-input-lng"
                    value={coords.lng}
                    onChange={e => setCoords({ ...coords, lng: Number(e.target.value) })}
                />
                <button
                    className="button button__locate"
                    onClick={() => {
                        setMapOptions({
                            ...mapOptions,
                            center: mapLocation(Number(coords.lat), Number(coords.lng))
                        });
                    }}
                >
                    Locate
                </button>
            </form>
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