import MapComponent from "./components/MapComponent";
import { Leaflet } from "./react-leaflet/Leaflet";

const App = () => {

    return (
        <Leaflet>
            <MapComponent />
        </Leaflet>
    );
}

export default App
