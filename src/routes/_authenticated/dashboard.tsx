import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from "@/components/workspace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Farm Dashboard | AgroNova" },
      { name: "description", content: "Your AgroNova fields, profile and live NASA observations." },
      { property: "og:title", content: "My Farm Dashboard | AgroNova" },
      { property: "og:description", content: "Your fields with live NASA POWER weather data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <Workspace mode="live" />,
});
