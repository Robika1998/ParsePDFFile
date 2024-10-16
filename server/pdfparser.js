const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const pdf = require("pdf-parse");

const app = express();
const port = 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));

const extractVin = (text) =>
  text.match(/VIN:\s*([A-HJ-NPR-Z0-9]{17})/i)?.[1] || "N/A";

const extractVehicleInfo = (text) => {
  const match = text.match(/Make:\s*(\w+)\s*Model:\s*([\w\s]+)/i);
  return match ? `${match[1]} ${match[2]}` : "N/A";
};

const extractPickupAndDeliveryInfo = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  const pickupHeaderIndex = lines.findIndex((line) =>
    /Pick up location/i.test(line)
  );
  const dropoffHeaderIndex = lines.findIndex((line) =>
    /Drop off location/i.test(line)
  );

  let pickupInfo = "N/A";
  let deliveryInfo = "N/A";

  if (pickupHeaderIndex !== -1 && dropoffHeaderIndex !== -1) {
    const pickupEndIndex = lines.findIndex(
      (line, index) =>
        index > pickupHeaderIndex && /1022 East Troy Avenue/i.test(line)
    );

    const pickupLines = lines.slice(pickupHeaderIndex + 1, pickupEndIndex);
    pickupInfo = pickupLines.join("<br>");

    const deliveryLines = lines.slice(pickupEndIndex);
    const endMarkerIndex = deliveryLines.findIndex((line) =>
      /Dodge Ram 2500 \(2010\)/i.test(line)
    );
    const finalDeliveryLines =
      endMarkerIndex !== -1
        ? deliveryLines.slice(0, endMarkerIndex)
        : deliveryLines;
    deliveryInfo = finalDeliveryLines.join("<br>");
  }

  return { pickup: pickupInfo, delivery: deliveryInfo };
};

const extractOrderId = (text) =>
  text.match(/Auction ID #\s*(\d+)/i)?.[1] || "N/A";

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
    const extractedText = data.text;

    const vin = extractVin(extractedText);
    const vehicleInfo = extractVehicleInfo(extractedText);
    const { pickup, delivery } = extractPickupAndDeliveryInfo(extractedText);
    const orderId = extractOrderId(extractedText);

    res.send(`
      <h1>Extracted Information</h1>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>VIN:</strong> ${vin}</p>
      <p><strong>Vehicle:</strong> ${vehicleInfo}</p>
      <p><strong>Pickup Information:</strong> ${pickup}</p>
      <p><strong>Delivery Information:</strong> ${delivery}</p>
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
