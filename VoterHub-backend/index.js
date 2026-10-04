import express  from "express" ;
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
//routes
import SessionRouter  from "./routes/session.js";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
        credentials: true,
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"],
        optionsSuccessStatus: 200
}));

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("SUPABASE_URL or SUPABASE_SERVICE_KEY is not defined in the environment variables.");
    process.exit(1);
}

//use routes
app.use("/api", SessionRouter);


export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

if (supabase) console.log("Supabase client created successfully.");
app.listen(PORT, () => console.log(`running on port ${PORT}`));
