import { ImageResponse } from "next/og";
import { TOKENS } from "@/lib/tokens";

export const alt = "Substrate. Product designer for complex software.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static OG card generated at build time. Not the canvas, just a clean card.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: TOKENS.void,
          color: TOKENS.vellum,
          padding: 80,
        }}
      >
        <div
          style={{
            color: TOKENS.accent,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Substrate
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 940,
          }}
        >
          Product designer for complex software.
        </div>
      </div>
    ),
    { ...size },
  );
}
