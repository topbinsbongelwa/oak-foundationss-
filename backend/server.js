require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient");
const {
  registerAttendee,
  getAttendeeById,
  getAttendeeByUniqueId,
  checkInAttendee,
  getCheckedInCount,
} = require("./attendees");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URLS = ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: FRONTEND_URLS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Oak Foundation API is running",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Oak Foundation Backend",
  });
});

app.post("/api/attendees/register", async (req, res) => {
  try {
    const result = await registerAttendee(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/attendees/:id", async (req, res) => {
  try {
    const result = await getAttendeeById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/attendees/qr/:qrCode", async (req, res) => {
  try {
    const result = await getAttendeeByUniqueId(req.params.qrCode);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/checkin", async (req, res) => {
  try {
    const { qr_code } = req.body;
    if (!qr_code) {
      return res.status(400).json({ success: false, error: "qr_code is required" });
    }
    const result = await checkInAttendee(qr_code);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/headcount", async (req, res) => {
  try {
    const count = await getCheckedInCount();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

(async () => {
  try {
    const { error } = await supabase.from("attendees").select("id").limit(1);
    if (error) {
      console.error("[ERROR] Supabase connection check failed:", error.message);
    } else {
      console.log("Supabase connected successfully");
    }
  } catch (error) {
    console.error("[ERROR] Supabase connection failed:", error.message || error);
  }

  app.listen(PORT, () => {
    console.log("Oak Foundation Backend");
    console.log(`Server running on: http://localhost:${PORT}`);
  });
})();
