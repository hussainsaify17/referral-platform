"use client";

import dynamic from "next/dynamic";

const InteractiveBackground = dynamic(
  () => import("./InteractiveBackground").then((mod) => mod.InteractiveBackground),
  { ssr: false }
);

export function DynamicBackground() {
  return <InteractiveBackground />;
}
