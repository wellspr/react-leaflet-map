// https://stackoverflow.com/questions/19186428/refresh-leaflet-map-map-container-is-already-initialized

import "leaflet/dist/leaflet.css";
import "./styles.css";
import React, { FC, useEffect, useRef, useState } from "react";
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
    const { mapRef, markerRef, initRef } = useLeaflet();
    const ref = useRef<HTMLDivElement>(null);
    const centerRef = useRef<Types.Location | undefined>(mapOptions.center);
    const zoomRef = useRef<number | undefined>(mapOptions.zoom);

    useInitialize({
        initRef,
        mapRef,
        markerRef,
        options: { mapOptions, markerOptions, scaleOptions, zoomOptions },
        popupText,
        ref,
        zoomRef
    });

    useEvents({ centerRef, mapRef, markerRef, zoomRef });

    return (
        <div
            className="react-leaflet-container"
            ref={ref}
            style={{ height }}
        />
    );
};

type EventsProps = {
    centerRef: React.MutableRefObject<L.LatLngExpression | undefined>,
    markerRef: React.MutableRefObject<L.Marker<any> | null> | null,
    mapRef: React.MutableRefObject<L.Map | null> | null,
    zoomRef: React.MutableRefObject<number | undefined>
}

type Initialize = {
    initRef: React.MutableRefObject<boolean | null> | null,
    ref: React.RefObject<HTMLDivElement>,
    mapRef: React.MutableRefObject<L.Map | null> | null,
    markerRef: React.MutableRefObject<L.Marker<any> | null> | null,
    zoomRef: React.MutableRefObject<number | undefined>,
    popupText: L.Content | undefined,
    options: {
        mapOptions: L.MapOptions,
        markerOptions: L.MarkerOptions | undefined,
        scaleOptions: L.Control.ScaleOptions | undefined,
        zoomOptions: L.Control.ZoomOptions | undefined,
    }
}

const useInitialize = ({ initRef, ref, mapRef, markerRef, zoomRef, popupText, options }: Initialize) => {
    useEffect(() => {
        if (initRef && !initRef.current) {
            initRef.current = true;
        }

        if (ref.current) {
            if (mapRef && markerRef) {
                mapRef.current = L.map(ref.current, {
                    doubleClickZoom: false,
                    zoomControl: false,
                    ...options.mapOptions,
                });

                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                })
                    .addTo(mapRef.current);

                /* Scale options */
                if (options.scaleOptions) {
                    L.control.scale(options.scaleOptions).addTo(mapRef.current);
                } else {
                    L.control.scale().addTo(mapRef.current);
                }

                /* Zoom options */
                if (options.zoomOptions) {
                    L.control.zoom(options.zoomOptions).addTo(mapRef.current);
                } else {
                    L.control.zoom().addTo(mapRef.current);
                }

                const divIcon = L.divIcon({
                    className: "custom-icon",
                    iconSize: [41, 41],
                    iconAnchor: [12.5, 41],
                    popupAnchor: [0, -35],
                });

                /* Marker configuration */
                if (options.mapOptions.center) {
                    const defaultMarkerOptions: L.MarkerOptions = {
                        draggable: true,
                        icon: divIcon
                    }
                    if (options.markerOptions) {
                        markerRef.current = L.marker(options.mapOptions.center, {
                            ...defaultMarkerOptions,
                            ...options.markerOptions,
                        })
                            .addTo(mapRef.current)

                    } else {
                        markerRef.current = L.marker(options.mapOptions.center, {
                            ...defaultMarkerOptions,
                        })
                            .addTo(mapRef.current)

                    }

                    if (popupText) {
                        markerRef.current?.bindPopup(popupText);
                    }
                }

                if (options.mapOptions.center) {
                    mapRef.current.setView(options.mapOptions.center, zoomRef.current);

                    mapRef.current.flyTo(options.mapOptions.center, zoomRef.current, {
                        animate: true,
                        duration: .4
                    });

                    markerRef?.current?.setLatLng(options.mapOptions.center);
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
            if (initRef && initRef.current) {
                initRef.current = false;
            }
        }

    }, [options.zoomOptions, options.scaleOptions, options.markerOptions, options.mapOptions, initRef?.current]);
};

const useEvents = ({ centerRef, markerRef, mapRef, zoomRef }: EventsProps) => {

    /* Dragend events */
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

    /* Dblclick events */
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

    /* Zoom events */
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
};


const initializeMap = (Component: FC<MapProps>) => (props: MapProps) => {

    const { initRef } = useLeaflet();

    const componentRef = useRef<React.ReactElement>();
    const propsRef = useRef<MapProps | undefined>(undefined);
    const [isEqual, setIsEqual] = useState<boolean>();

    useEffect(() => {
        if (propsRef.current) {
            setIsEqual(JSON.stringify(propsRef.current) === JSON.stringify(props));
        }
    }, [props]);

    useEffect(() => {
        if (!isEqual) {
            propsRef.current = props;
            componentRef.current = <Component {...propsRef.current} />;
        }
    }, [isEqual]);

    if (!initRef?.current) {
        propsRef.current = props;
        componentRef.current = <Component {...propsRef.current} />;
    }

    return componentRef.current;
};


export const mapLocation = L.latLng;
export const divIcon = L.divIcon;
export const icon = L.icon;

export default initializeMap(Map);