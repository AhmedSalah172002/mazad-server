const path = require("path");

express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });

const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

// Routes
const { router: productRoute } = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const addressRoute = require("./routes/addressRoute");
const mazadRoute = require("./routes/mazadRoute");
const cartRoute = require("./routes/cartRoute");
const orderRoute = require("./routes/orderRoute");
const categoryRoute = require("./routes/categoryRoute");
const reviewRoute = require("./routes/reviewRoute");
const onBoardinRoute = require("./routes/onBoardingRoute");

const { webhookCheckout } = require("./services/orderService");

// Connect with db
dbConnection();

// express app
const app = express();
app.use(express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.options("*", cors());

app.use(compression());

app.post(
   "/webhook-checkout",
   express.raw({ type: "application/json" }),
   webhookCheckout
);

// Middlewares
app.use(express.json());

if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
   console.log(`mode: ${process.env.NODE_ENV}`);
}

const server = http.createServer(app);

const io = new Server(server, {
   cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
   },
});

io.on("connection", (socket) => {
   socket.on("Join_Room", (data) => {
      socket.join(data);
   });

   socket.on("Send_Mazad", (data) => {
      socket.to(data.room).emit("Recieve_Mazad", data.message);
   });
});

// Mount Routes
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/addresses", addressRoute);
app.use("/api/v1/mazad", mazadRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", reviewRoute);
app.use("/api/v1", onBoardinRoute);

app.all("*", (req, res, next) => {
   next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 9000;

const server1 = server.listen(PORT, () => {
   console.log(`App running running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
   console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
   server1.close(() => {
      console.error(`Shutting down....`);
      process.exit(1);
   });
});
