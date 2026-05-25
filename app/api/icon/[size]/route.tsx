import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface Props {
  params: Promise<{ size: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const { size: sizeStr } = await params;
  const size = parseInt(sizeStr, 10) || 192;

  const fontSize = Math.round(size * 0.45);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: size * 0.22,
        }}
      >
        <span
          style={{
            fontFamily: "serif",
            fontSize,
            fontWeight: 700,
            color: "#c9a96e",
            letterSpacing: "-2px",
          }}
        >
          E
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
