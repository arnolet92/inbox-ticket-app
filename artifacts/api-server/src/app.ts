import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { autoSeedIfEmpty } from "./lib/autoSeed";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

autoSeedIfEmpty().catch((err) => {
  console.warn("Auto-seed skipped or failed:", err?.message ?? err);
});

export default app;
