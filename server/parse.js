const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdf = require("pdf-parse");
const app = express();
const PORT = 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());

app.post("/upload", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const pdfBuffer = req.file.buffer;

  pdf(pdfBuffer)
    .then((data) => {
      const extractedData = extractData(data.text);
      console.log("Extracted Data:", extractedData);
      res.json(extractedData);
    })
    .catch((err) => {
      console.error("PDF parse error:", err);
      res.status(500).json({ error: err.message });
    });
});

function extractData(text) {
  const orderId = text.match(/Order ID:\s*(\w+)/)?.[1] || "";
  const vin = text.match(/VIN:\s*([\w\d]+)/)?.[1] || "";
  const vehicle = text.match(/Vehicle:\s*(.+)/)?.[1] || "";
  const pickupInfo = text.match(/Pickup Information:\s*(.+)/)?.[1] || "";
  const deliveryInfo = text.match(/Delivery Information:\s*(.+)/)?.[1] || "";

  return {
    orderId,
    vin,
    vehicle,
    pickupInfo,
    deliveryInfo,
  };
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
