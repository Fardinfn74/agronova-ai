import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/workspace";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "AgroNova Demo — Rotation Lab & NASA Evidence" },
      {
        name: "description",
        content:
          "Try AgroNova's interactive demo: pick a Bangladesh field, explore NASA evidence, compare crop rotations, and run What-If scenarios with Nova.",
      },
      { property: "og:title", content: "AgroNova Demo — Rotation Lab & NASA Evidence" },
      {
        property: "og:description",
        content: "Interactive crop-rotation scenarios built on dated NASA Earth data samples.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Workspace mode="demo" />,
});
