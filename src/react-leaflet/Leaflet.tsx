import L from "leaflet";
import { FC, ReactNode, createContext, useContext, useRef, useState } from "react";

interface ContextInterface { 
    mapRef: React.MutableRefObject<L.Map | null> | null;
    markerRef: React.MutableRefObject<L.Marker<any> | null> | null;
    rendered: boolean;
    setRendered: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultValue: ContextInterface = { 
    mapRef: null, 
    markerRef: null, 
    rendered: false, 
    setRendered: () => {} 
};

export const Context = createContext<ContextInterface>(defaultValue);

export const Leaflet: FC<{ children: ReactNode }> = ({ children }) => {

    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [rendered, setRendered] = useState(false);

    return (
        <Context.Provider value={{ mapRef, markerRef, rendered, setRendered }}>
            {children}
        </Context.Provider>
    );
};

export const useLeaflet = () => useContext<ContextInterface>(Context);