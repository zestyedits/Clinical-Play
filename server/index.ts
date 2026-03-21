import { createApplication } from "./createApp";
import { log } from "./logger";

createApplication().then(({ httpServer }) => {
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "127.0.0.1",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
});
