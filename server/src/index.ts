import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`EcoSphere API listening on port ${env.PORT}`);
});
