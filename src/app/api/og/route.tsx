import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getSbTierLabel } from "@/lib/scoring";
import type { Grade } from "@/lib/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const topic = searchParams.get("topic") ?? "未知辩题";
  const stance = searchParams.get("stance") === "for" ? "正方" : "反方";
  const logic = (searchParams.get("logic") ?? "C") as Grade;
  const evidence = (searchParams.get("evidence") ?? "C") as Grade;
  const emotion = (searchParams.get("emotion") ?? "C") as Grade;
  const sbIndex = parseInt(searchParams.get("sbIndex") ?? "50", 10);
  const roast = searchParams.get("roast") ?? "";
  const tierLabel = getSbTierLabel(sbIndex);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          padding: "80px 60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 400, color: "#18181B" }}>
            S.B. Smart Brain
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#E5E5E5",
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        {/* Topic */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 16, color: "#71717A" }}>今日辩题</div>
          <div
            style={{
              fontSize: 32,
              color: "#18181B",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            「{topic}」
          </div>
          <div style={{ fontSize: 16, color: "#71717A", marginTop: 8 }}>
            我的立场：{stance}
          </div>
        </div>

        {/* Scores */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 48,
          }}
        >
          {[
            { label: "逻辑", value: logic },
            { label: "论据", value: evidence },
            { label: "情绪", value: emotion },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#F4F4F5",
                borderRadius: 12,
                padding: "24px 48px",
              }}
            >
              <div style={{ fontSize: 14, color: "#71717A" }}>
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 500,
                  color: "#18181B",
                  marginTop: 8,
                  fontFamily: "monospace",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* SB Index */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: 48,
            padding: "32px 40px",
            border: "1px solid #E5E5E5",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500, color: "#18181B" }}>
              SB 指数
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                color: "#18181B",
                fontFamily: "monospace",
              }}
            >
              {sbIndex}
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: 8,
              backgroundColor: "#F4F4F5",
              borderRadius: 999,
              marginTop: 16,
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                width: `${100 - sbIndex}%`,
                height: "100%",
                backgroundColor: "#C5F36F",
                borderRadius: 999,
              }}
            />
          </div>
          <div style={{ fontSize: 16, color: "#71717A", marginTop: 12 }}>
            {tierLabel}
          </div>
        </div>

        {/* Roast */}
        <div
          style={{
            marginTop: 36,
            fontSize: 22,
            color: "#18181B",
            fontStyle: "italic",
            textAlign: "center",
          }}
        >
          S.B. 说：「{roast}」
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#E5E5E5",
            marginTop: 40,
            marginBottom: 24,
          }}
        />

        {/* CTA */}
        <div style={{ fontSize: 18, color: "#C5F36F", fontWeight: 500 }}>
          来和 S.B. 杠一杠 →
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
    }
  );
}
