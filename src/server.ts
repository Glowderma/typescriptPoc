import app from './app';
import { api } from "./utils/env";
import logger from "./utils/logger";
console.log("apiiiiii",api)
app.listen(api.port, (err?: Error) => {
    if (err) {
        logger.error(err);
    } else {
        logger.info(`Successfully launched in ${api.nodeEnv} environment on port ${api.port}`);
    }
});
