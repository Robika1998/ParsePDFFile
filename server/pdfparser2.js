const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const pdf = require("pdf-parse");

const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));

const normalizeText = (text) => {
  return text.replace(/\s+/g, " ").trim();
};

const extractOrderId = (text) => {
  const match = text.match(/Order ID:\s*([A-Z0-9]+)/i);
  return match ? match[1].trim() : "Unknown Order ID";
};

const extractVin = (text) => {
  const match = text.match(/VIN:\s*([A-Z0-9]+)/i);
  return match ? match[1].trim() : "Unknown VIN";
};

const extractVehicleInfo = (text) => {
  const match = text.match(
    /(\d{4})\s+([A-Za-z\s]+)\s+([A-Za-z]+)\s+([A-Za-z]+)\s+([A-Z0-9]+)/
  );
  return match
    ? `${match[1]} ${match[2].trim()} ${match[3].trim()} ${match[4].trim()}`
    : "Unknown Vehicle";
};

const extractPickupAndDeliveryInfo = (text) => {
  const pickupMatch = text.match(
    /Pickup Information:([\s\S]*?)Delivery Information:/i
  );
  const deliveryMatch = text.match(
    /Delivery Information:([\s\S]*?)(DISPATCH INSTRUCTIONS|$)/i
  );

  const pickup = pickupMatch
    ? `Pickup Information: ${normalizeText(pickupMatch[1])}`
    : "Pickup Information: Not Found";

  const delivery = deliveryMatch
    ? `Delivery Information: ${normalizeText(deliveryMatch[1])}`
    : "Delivery Information: Not Found";

  return { pickup, delivery };
};

app.get("/", (req, res) => {
  res.send(`
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" accept=".pdf" required />
      <button type="submit">Upload PDF</button>
    </form>
  `);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    const extractedText = normalizeText(data.text);

    const orderId = extractOrderId(extractedText);
    const vin = extractVin(extractedText);
    const vehicleInfo = extractVehicleInfo(extractedText);
    const { pickup, delivery } = extractPickupAndDeliveryInfo(extractedText);

    console.log(extractedText);

    res.send(`
      <h1>Extracted Information</h1>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>VIN:</strong> ${vin}</p>
      <p><strong>Vehicle:</strong> ${vehicleInfo}</p>
      <p><strong>${pickup}</strong></p>
      <p><strong>${delivery}</strong></p>
      <a href="/">Upload another PDF</a>
    `);
  } catch (error) {
    console.error("Error processing PDF file:", error);
    res.status(500).send("Error processing PDF file.");
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
