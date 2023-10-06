// https://stackoverflow.com/questions/19186428/refresh-leaflet-map-map-container-is-already-initialized

import "leaflet/dist/leaflet.css";
import "./styles.css";
import { FC, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLeaflet } from "./Leaflet";
import { Types } from "./types";

interface MapProps {
    height: number;
    defaultPopupText?: Types.PopupContent;
    mapOptions: Types.MapOptions;
    getMapCenter?: (center: Types.Location) => void;
    zoomOptions?: Types.ZoomOptions;
}

/* Map */
const Map: FC<MapProps> = ({
    height,
    defaultPopupText = "",
    mapOptions,
    getMapCenter,
    zoomOptions
}) => {

    const ref = useRef<HTMLDivElement>(null);

    const { mapRef, markerRef, setRendered } = useLeaflet();

    const centerRef = useRef<Types.Location | undefined>(mapOptions.center);
    const zoomRef = useRef<number | undefined>(mapOptions.zoom);

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (ref.current) {
            if (mapRef && markerRef) {
                mapRef.current = L.map(ref.current, {
                    doubleClickZoom: false,
                    zoomSnap: 1,
                    zoomControl: false
                });

                setRendered(true);

                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                })
                    .addTo(mapRef.current);

                L.control.scale().addTo(mapRef.current);

                /* 
                                const defaultIcon = L.icon({
                                    iconUrl: "images/marker-icon.png",
                                    shadowUrl: "images/marker-shadow.png",
                                    iconSize: [25, 41],
                                    shadowSize: [41, 41],
                                    iconAnchor: [12.5, 41],
                                    //shadowAnchor: [10, 41]
                                    popupAnchor: [0, -35]
                                });
                 */

                const divIcon = L.divIcon({
                    className: "custom-icon",
                    iconSize: [41, 41],
                    iconAnchor: [12.5, 41],
                    popupAnchor: [0, -35],
                });

                if (mapOptions.center) {
                    markerRef.current = L.marker(mapOptions.center, {
                        draggable: true,
                        icon: divIcon,
                    })
                        .addTo(mapRef.current)
                        .bindPopup(defaultPopupText);
                }

                if (zoomOptions) {
                    if (zoomOptions) {
                        L.control.zoom(zoomOptions).addTo(mapRef.current);
                    } 
                } else {
                    L.control.zoom().addTo(mapRef.current);
                }

                if (!initialized) {
                    setInitialized(true);
                }
            }
        }

        return () => {
            if (ref.current) {
                if (mapRef && mapRef.current) {
                    mapRef.current.off();
                    mapRef.current.remove();
                }
            };
        }
    }, [initialized]);

    useEffect(() => {
        const onMarkerDragend = () => {
            (centerRef.current = markerRef?.current?.getLatLng());
            getMapCenter && (centerRef.current && getMapCenter(centerRef.current));
        };

        markerRef?.current?.on("dragend", onMarkerDragend);

        return () => {
            markerRef?.current?.off("dragend", onMarkerDragend);
        }
    }, [mapRef?.current, centerRef.current, markerRef?.current]);

    useEffect(() => {
        if (mapRef?.current) {
            if (centerRef.current) {
                mapRef.current.setView(centerRef.current, zoomRef.current);
                getMapCenter && getMapCenter(centerRef.current);
            }
        }
    }, [mapRef?.current, centerRef.current, zoomRef.current]);

    useEffect(() => {
        if (mapRef?.current && mapOptions.center) {
            mapRef.current.flyTo(mapOptions.center, zoomRef.current, {
                animate: true,
                duration: .4
            });

            markerRef?.current?.setLatLng(mapOptions.center);
        }
    }, [mapOptions.center]);

    useEffect(() => {
        const onMarkerCLickHandler = (e: L.LeafletMouseEvent) => {
            const coords = e.latlng;
            markerRef?.current?.setPopupContent(`Coordinates: [${coords.lat}, ${coords.lng}]`);
        };

        markerRef?.current?.on("click", onMarkerCLickHandler);

        return () => {
            markerRef?.current?.off("click", onMarkerCLickHandler);
        }
    }, [markerRef?.current]);

    useEffect(() => {
        const onDblClick = (e: L.LeafletMouseEvent) => {
            const newCenter = e.latlng;
            getMapCenter && getMapCenter(newCenter);
            const currentZoom = mapRef?.current?.getZoom();
            centerRef.current = newCenter;

            markerRef?.current?.setLatLng(newCenter);

            mapRef?.current?.flyTo(newCenter, currentZoom, {
                animate: true,
                duration: .4,
            });
        };

        mapRef?.current?.on("dblclick", onDblClick);

        return () => {
            mapRef?.current?.off("dblclick", onDblClick);
        }
    }, [markerRef?.current, mapRef?.current, centerRef.current]);

    useEffect(() => {
        const handleZoom = () => {
            const currentZoom = mapRef?.current?.getZoom();
            zoomRef.current = currentZoom;
        };

        mapRef?.current?.on("zoom", handleZoom);

        return () => {
            mapRef?.current?.off("zoom", handleZoom);
        }
    }, [mapRef?.current, zoomRef.current]);

    return (
        <div
            className="react-leaflet-container"
            ref={ref}
            style={{ height }}
        />
    );
};

export default Map;

export const mapLocation = L.latLng;
