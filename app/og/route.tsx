import { LogoFull } from "@/components/common/logo";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { Pattern } from "./pattern";

// Route segment config
export const runtime = "edge";

const interRegular = fetch(
  "https://cdn.jsdelivr.net/npm/inter-font@3.19.0/ttf/Inter-Regular.ttf",
).then((res) => res.arrayBuffer());

const interSemiBold = fetch(
  "https://cdn.jsdelivr.net/npm/inter-font@3.19.0/ttf/Inter-SemiBold.ttf",
).then((res) => res.arrayBuffer());

const figTree = fetch(
  `https://github.com/erikdkennedy/figtree/raw/master/fonts/ttf/Figtree-ExtraBold.ttf`,
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const title = params.get("title");
  const description = params.get("description");
  const tag = params.get("tag");

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0D0C00",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
        }}
      >
        <LogoFull
          style={{
            position: "absolute",
            top: 72,
            left: 72,
            color: "#C8C8C8",
          }}
          size={40}
        />

        <Pattern
          style={{
            position: "absolute",
            right: 40,
            top: -50,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 72,
            left: 72,
            display: "flex",
            gap: 20,
            flexDirection: "column",
          }}
        >
          {tag && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                fontFamily: "Inter",
                color: "#FD0",
                maxWidth: 560,
              }}
            >
              {tag}
            </div>
          )}
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              fontFamily: "Figtree",
              color: "#fff",
              maxWidth: 560,
            }}
          >
            {(title || "").length > 40
              ? `${title?.substring(0, 40)}...`
              : title || "Stubby CMS"}
          </div>
          <div
            style={{
              fontSize: 24,
              maxWidth: 560,
              lineHeight: `32px`,
              opacity: 0.6,
              color: "#fff",
            }}
          >
            {`${description?.substring(0, 120)}...` ||
              "Simplest headless CMS for your content."}
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: await interRegular,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: await interSemiBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "Figtree",
          data: await figTree,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
