// https://stackoverflow.com/questions/19186428/refresh-leaflet-map-map-container-is-already-initialized

import "leaflet/dist/leaflet.css";
import "./styles.css";
import { FC, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLeaflet } from "./Leaflet";
import { Types } from "./types";

interface MapProps {
    height: number;
    popupText?: Types.PopupContent;
    mapOptions: Types.MapOptions;
    zoomOptions?: Types.ZoomOptions;
    scaleOptions?: Types.ScaleOptions;
    markerOptions?: Types.MarkerOptions;
}

/* Map */
const Map: FC<MapProps> = ({
    height,
    popupText,
    mapOptions,
    zoomOptions,
    scaleOptions,
    markerOptions,
}) => {

    const ref = useRef<HTMLDivElement>(null);

    const { mapRef, markerRef } = useLeaflet();

    const centerRef = useRef<Types.Location | undefined>(mapOptions.center);
    const zoomRef = useRef<number | undefined>(mapOptions.zoom);

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (ref.current) {
            if (mapRef && markerRef) {
                mapRef.current = L.map(ref.current, {
                    doubleClickZoom: false,
                    zoomControl: false,
                    ...mapOptions,
                });

                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                })
                    .addTo(mapRef.current);

                /* Scale options */
                if (scaleOptions) {
                    L.control.scale(scaleOptions).addTo(mapRef.current);
                } else {
                    L.control.scale().addTo(mapRef.current);
                }

                /* Zoom options */
                if (zoomOptions) {
                    L.control.zoom(zoomOptions).addTo(mapRef.current);
                }
                else {
                    L.control.zoom().addTo(mapRef.current);
                }

                const divIcon = L.divIcon({
                    className: "custom-icon",
                    iconSize: [41, 41],
                    iconAnchor: [12.5, 41],
                    popupAnchor: [0, -35],
                });

                /* Marker configuration */
                if (mapOptions.center) {
                    const defaultMarkerOptions: L.MarkerOptions = {
                        draggable: true,
                        icon: divIcon
                    }
                    if (markerOptions) {
                        markerRef.current = L.marker(mapOptions.center, {
                            ...defaultMarkerOptions,
                            ...markerOptions,
                        })
                            .addTo(mapRef.current)
                            
                    } else {
                        markerRef.current = L.marker(mapOptions.center, {
                            ...defaultMarkerOptions,
                        })
                            .addTo(mapRef.current)
                            
                    }

                    if (popupText) {
                        markerRef.current?.bindPopup(popupText);
                    }
                }

                if (mapOptions.center) {
                    mapRef.current.setView(mapOptions.center, zoomRef.current);

                    mapRef.current.flyTo(mapOptions.center, zoomRef.current, {
                        animate: true,
                        duration: .4
                    });

                    markerRef?.current?.setLatLng(mapOptions.center);
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
    }, [initialized, zoomOptions, scaleOptions, markerOptions, mapOptions]);


    useEffect(() => {
        const onMarkerDragend = () => {

            centerRef.current = markerRef?.current?.getLatLng();

            if (centerRef.current) {
                mapRef?.current?.flyTo(centerRef.current, zoomRef.current, {
                    animate: true,
                    duration: .4,
                });
            }
        };

        markerRef?.current?.on("dragend", onMarkerDragend);

        return () => {
            markerRef?.current?.off("dragend", onMarkerDragend);
        }
    }, [mapRef?.current, centerRef.current, markerRef?.current]);


    useEffect(() => {
        const onDblClick = (e: L.LeafletMouseEvent) => {
            const newCenter = e.latlng;
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
export const divIcon = L.divIcon;
export const icon = L.icon;