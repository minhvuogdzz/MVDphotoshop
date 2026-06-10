import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  query: { sessionId: "test_session_123", type: "visitor" }
});

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
});

socket.on("visitor-updated", (visitors) => {
  console.log("Received visitor-updated:", visitors.length, "visitors");
  console.log(visitors.slice(0, 2));
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log("Timeout waiting for visitor-updated");
  process.exit(1);
}, 5000);
