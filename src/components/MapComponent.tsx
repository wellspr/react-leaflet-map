import { useEffect, useRef, useState } from "react";
import Map, { mapLocation, useLeaflet, Types } from "../react-leaflet";

const MapComponent = () => {
    //51.505, -0.09

    const { mapRef, rendered } = useLeaflet();

    const lat = -22.8969;
    const lng = -43.2898;

    let location = mapLocation(lat, lng);
    const coordsRef = useRef<Types.Location>(location);

    const [coords, setCoords] = useState<{ lat: number, lng: number }>({ lat, lng });

    const [options, setOptions] = useState<Types.MapOptions>({
        center: location,
        zoom: 10,
    });

    const onCLickLocation = () => {
        console.log("coords: ", coordsRef.current);
    };

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
    }, [mapRef?.current, rendered]);

    return (
        <div className="map-component">
            <button onClick={onCLickLocation}>Current Location</button>
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
                        setOptions({
                            ...options,
                            center: mapLocation(Number(coords.lat), Number(coords.lng))
                        });
                    }}
                >
                    Locate
                </button>
            </form>
            <Map
                height={400}
                mapOptions={options}
                getMapCenter={(center) => {
                    coordsRef.current = center;
                }}
                zoomOptions={{
                    position: "topright"
                }}
            />
        </div>
    );
};

export default MapComponent;