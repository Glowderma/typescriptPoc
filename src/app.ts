import express, { Express } from "express";
import indexRouter from "./routes/index";
import { auth, authLocal, verifyAdminRoutes } from "./middlewares/auth";
import { api } from "./utils/env";
import apiRouter from "./routes/allApi.routes";
import rateLimit from "express-rate-limit";
import cors from "cors";

const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many login attempts from this IP, please try again later.",
  });
  app.use(limiter);

  app.use("/", indexRouter);

  if (api.nodeEnv !== "local" && api.nodeEnv !== "test") {
    app.use(auth);
    app.use(verifyAdminRoutes);
  } else {
    app.use(authLocal);
  }

  app.use("/api", apiRouter);

  app.all("*", (req, res) => {
    res.status(404).json({
      statusId: "0",
      message: `${req.method} to ${req.url} does not exist`,
      resbody: null,
    });
  });

  return app;
};

export default createApp;
