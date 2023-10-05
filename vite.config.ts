import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from "path";
import * as packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        dts({
            insertTypesEntry: true,
            include: [
                "src/react-leaflet"
            ],
            outDir: "dist/types",
            copyDtsFiles: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/react-leaflet/index.ts"),
            name: "react-leaflet-map",
            fileName: "react-leaflet-map",
        },
        rollupOptions: {
            external: [ ...Object.keys(packageJson.peerDependencies) ],
            output: {
                exports: 'named',
                globals: {
                    react: "React",
                    leaflet: "L",
                },
            },
        },
    },
});
