import { useEffect, useState } from "react";
import MapComponent from "./components/MapComponent";
import { Leaflet } from "./react-leaflet/Leaflet";

const App = () => {

    const [count, setCount] = useState(0);
    const [focusCount, setFocusCount] = useState(0)

    useEffect(() => {
        const onFocus = () => {
            setFocusCount(focusCount + 1);
        }

        window.addEventListener("focus", onFocus);

        return () => {
            window.removeEventListener("focus", onFocus);
        }
    }, [focusCount]);

    useEffect(() => {
        console.log("FOCUS: ", focusCount);
    }, [focusCount]);

    useEffect(() => {
        console.log("COUNT: ", count);
    }, [count]);

    return (
        <div>
            <button onClick={() => setCount(count + 1)}>Add</button>
            <div>Count: { count }</div>
            <div>Focus Count: { focusCount }</div>
            <Leaflet>
                <MapComponent center={{ lat: -21.8969, lng: -63.2898 }} zoom={10} />
            </Leaflet>
        </div>
    );
}

export default App
