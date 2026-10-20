import { ImageResponse } from "next/og";
import site from "@/content/site.json";

export const alt = `${site.name} | Revenue Architects`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated share image (no photography was supplied): brand colors + wordmark + description.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          color: "#fff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {["#2CB383", "#DE2056", "#FAB12F", "#3ABEF9"].map((c) => (
            <div key={c} style={{ width: 90, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: -3 }}>
            Beetrix<span style={{ color: "#DE2056" }}>360</span>
          </div>
          <div style={{ fontSize: 36, color: "#a3a3a3", marginTop: 16, maxWidth: 900 }}>{site.description}</div>
        </div>
      </div>
    ),
    size,
  );
}
