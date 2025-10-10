///<reference path="./types/express/index.d.ts" />

import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const PORT = env.PORT || 8080

connectDB().then(()=>{
    app.listen(PORT,()=>{
         console.log(`🚀 Server running on http://localhost:${PORT}`);
         
    })
})