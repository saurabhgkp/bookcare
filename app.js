const express = require("express")
const app = express()
const cors = require("cors");
var logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();




const PORT = process.env.PORT;
const CONNECTION_URL = process.env.CONNECTION_URL;


app.use(express.json());
app.use(cors("*"));
app.use(logger("dev"));



app.use(express.json())

const indexRouter = require("./routes/index");
const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const bookRouter = require("./routes/books");

app.use("/v1/", indexRouter);
app.use("/v1/users", userRouter);
app.use("/v1/admin", adminRouter);
app.use("/v1/book", bookRouter);

mongoose
    .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() =>
        app.listen(PORT, () =>
            console.log(`Server Running on Port: http://localhost:${PORT}`)
        )
    )
    .catch((error) => console.log(`${error} did not connect`));



