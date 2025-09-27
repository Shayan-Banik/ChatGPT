require("dotenv").config();
const app = require("./src/app");
const connectToDatabase = require("./src/database/db");
const initSocketServer = require("./src/sockets/socket.server");
const httpServer = require("http").createServer(app);

connectToDatabase();
initSocketServer(httpServer);

httpServer.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});