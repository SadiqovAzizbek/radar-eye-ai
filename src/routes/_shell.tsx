import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { SystemProvider } from "@/hooks/useSystem";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

function ShellLayout() {
  return (
    <SystemProvider>
      <AppShell />
    </SystemProvider>
  );
}
