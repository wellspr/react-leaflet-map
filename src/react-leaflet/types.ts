import L from "leaflet";

export namespace Types {
    export type Leaflet = typeof L;
    export type PopupContent = L.Content;
    export type MapOptions = L.MapOptions;
    export type ZoomOptions = L.Control.ZoomOptions;
    export type Location = L.LatLngExpression;
    export type Map = L.Map;
    export type Marker = L.Marker;
    export type MouseEvent = L.LeafletMouseEvent;
}