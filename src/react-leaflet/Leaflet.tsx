import L from "leaflet";
import { FC, ReactNode, createContext, useContext, useRef } from "react";

interface ContextInterface { 
    mapRef: React.MutableRefObject<L.Map | null> | null;
    markerRef: React.MutableRefObject<L.Marker<any> | null> | null;
}

const defaultValue: ContextInterface = { 
    mapRef: null, 
    markerRef: null, 
};

export const Context = createContext<ContextInterface>(defaultValue);

export const Leaflet: FC<{ children: ReactNode }> = ({ children }) => {

    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    return (
        <Context.Provider value={{ mapRef, markerRef }}>
            {children}
        </Context.Provider>
    );
};

export const useLeaflet = () => useContext<ContextInterface>(Context);