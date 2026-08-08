import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b6432b",
          borderRadius: "50%",
          color: "#fffdf7",
          fontSize: 30,
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          transform: "rotate(-6deg)",
        }}
      >
        LD
      </div>
    ),
    { ...size }
  );
}
