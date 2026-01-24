import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "IFUMSA",
        short_name: "IFUMSA",
        description: "IFUMSA Mobile App - Learn, Grow and Succeed Together",
        start_url: "/",
        display: "standalone",
        background_color: "#1F382E",
        theme_color: "#1F382E",
        orientation: "portrait",
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
        ],
    };
}
