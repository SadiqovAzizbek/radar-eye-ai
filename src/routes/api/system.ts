import { createFileRoute } from "@tanstack/react-router";
import { dataService } from "@/lib/dataService";

export const Route = createFileRoute("/api/system")({
  server: {
    handlers: {
      GET: async () => {
        if (!dataService.isRunning()) dataService.start();
        return Response.json(await dataService.getSystem());
      },
    },
  },
});
