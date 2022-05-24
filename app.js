const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const mongooseConfig = require("./config/mongoose_config");
const fileupload = require('express-fileupload');

dotenv.config();


const app = express();
const cors = require('cors');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(fileupload());
app.use(cookieParser());
app.use(session({ secret: "cats",
                  resave: true,
                saveUninitialized:true
         }));

const adminRoute = require("./routes/admin");
const postsRoute = require("./routes/posts");
app.use("/api/admin", adminRoute);
app.use("/api/posts", postsRoute);


app.use(express.json());

mongoose.connect(process.env.MONGO_URI,
 mongooseConfig, () => console.log("mongoDB connected..."))

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server running on port ${port}...`));