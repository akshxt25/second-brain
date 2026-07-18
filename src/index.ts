import express from "express"
import  dotenv from "dotenv";
dotenv.config();
import connectDB from "./db.js";
import cors from "cors"
import dns from "node:dns";
import router from "./routes/userRoute.js";


dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

connectDB();

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
