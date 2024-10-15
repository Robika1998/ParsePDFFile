// import React, { useState } from "react";
// import * as pdfjsLib from "pdfjs-dist/webpack";
// import "./App.css";

// function App() {
//   const [file, setFile] = useState(null);
//   const [orderId, setOrderId] = useState("");
//   const [vin, setVin] = useState("");
//   const [vehicle, setVehicle] = useState("");
//   const [pickupInfo, setPickupInfo] = useState("");
//   const [deliveryInfo, setDeliveryInfo] = useState("");
//   const [error, setError] = useState("");

//   const handleFileChange = async (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);

//     if (selectedFile) {
//       const fileReader = new FileReader();
//       fileReader.onload = async (event) => {
//         const typedarray = new Uint8Array(event.target.result);

//         const pdf = await pdfjsLib.getDocument(typedarray).promise;
//         let textContent = "";

//         for (let i = 1; i <= pdf.numPages; i++) {
//           const page = await pdf.getPage(i);
//           const text = await page.getTextContent();
//           textContent += text.items.map((item) => item.str).join(" ") + " ";
//         }

//         console.log(textContent);
//         extractData(textContent);
//       };
//       fileReader.readAsArrayBuffer(selectedFile);
//     }
//   };

//   const extractData = (text) => {
//     const orderIdMatch = text.match(/Auction ID #\s*(\d+)/);
//     setOrderId(orderIdMatch ? orderIdMatch[1] : "Not found");

//     const vinMatch = text.match(/VIN:\s*([0-9A-Z]+)/);
//     setVin(vinMatch ? vinMatch[1] : "Not found");

//     const vehicleMatch = text.match(
//       /Year:\s*(\d{4})\s*Make:\s*(\w+)\s*Model:\s*([\w\s]+)\s*Trim:\s*([\w-]*)/
//     );
//     setVehicle(
//       vehicleMatch
//         ? `${vehicleMatch[1]} ${vehicleMatch[2]} ${vehicleMatch[3]} ${
//             vehicleMatch[4] || ""
//           }`.trim()
//         : "Not found"
//     );

//     const pickupInfoMatch = text.match(
//       /Pick up location\s*([\s\S]*?)(?=\s*Drop off location|\s*$)/
//     );
//     console.log("Pickup Info Match:", pickupInfoMatch);
//     setPickupInfo(pickupInfoMatch ? pickupInfoMatch[1].trim() : "Not found");

//     const deliveryInfoMatch = text.match(
//       /Drop off location\s*([\s\S]*?)(?=\s*Transport Contact|\s*$)/
//     );
//     console.log("Delivery Info Match:", deliveryInfoMatch);
//     setDeliveryInfo(
//       deliveryInfoMatch ? deliveryInfoMatch[1].trim() : "Not found"
//     );

//     setError("");
//   };

//   return (
//     <div>
//       <h1>PDF Text Extractor</h1>
//       <form>
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={handleFileChange}
//         />
//       </form>
//       {error && <div style={{ color: "red" }}>{error}</div>}
//       <div>
//         <h2>Extracted Information</h2>
//         <div>
//           <label>Order ID:</label>
//           <input type="text" value={orderId} readOnly />
//         </div>
//         <div>
//           <label>VIN:</label>
//           <input type="text" value={vin} readOnly />
//         </div>
//         <div>
//           <label>Vehicle:</label>
//           <input type="text" value={vehicle} readOnly />
//         </div>
//         <div>
//           <label>Pickup Information:</label>
//           <textarea
//             value={pickupInfo}
//             readOnly
//             style={{ width: "100%", height: "100px" }}
//           />
//         </div>
//         <div>
//           <label>Delivery Information:</label>
//           <textarea
//             value={deliveryInfo}
//             readOnly
//             style={{ width: "100%", height: "100px" }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const data = [];

    for (const selectedFile of selectedFiles) {
      const fileReader = new FileReader();
      const fileData = await new Promise((resolve) => {
        fileReader.onload = async (event) => {
          const typedarray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let textContent = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map((item) => item.str).join(" ") + " ";
          }

          resolve(extractData(textContent));
          console.log(textContent);
        };
        fileReader.readAsArrayBuffer(selectedFile);
      });

      data.push(fileData);
    }

    setExtractedData(data);
  };

  const extractData = (text) => {
    const orderIdMatch = text.match(/Auction ID #\s*(\d+)/);
    const vinMatch = text.match(/VIN:\s*([0-9A-Z]+)/);
    const vehicleMatch = text.match(
      /Year:\s*(\d{4})\s*Make:\s*([A-Za-z]+)\s*Model:\s*([\w\s]+)\s*Trim:\s*([\w-]*)/
    );
    const pickupInfoMatch = text.match(
      /Pick up location\s*([\s\S]*?)(?=\s*Drop off location|\s*$)/
    );
    const deliveryInfoMatch = text.match(
      /Drop off location\s*([\s\S]*?)(?=\s*Transport Contact|\s*$)/
    );

    return {
      orderId: orderIdMatch ? orderIdMatch[1] : "Not found",
      vin: vinMatch ? vinMatch[1] : "Not found",
      vehicle: vehicleMatch
        ? `${vehicleMatch[1]} ${vehicleMatch[2]} ${vehicleMatch[3]} ${
            vehicleMatch[4] || ""
          }`.trim()
        : "Not found",
      pickupInfo: pickupInfoMatch ? pickupInfoMatch[1].trim() : "Not found",
      deliveryInfo: deliveryInfoMatch
        ? deliveryInfoMatch[1].trim()
        : "Not found",
    };
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>
      <form>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
        />
      </form>
      <div>
        <h2>Uploaded Files</h2>
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Extracted Information</h2>
        {extractedData.map((data, index) => (
          <div key={index}>
            <h3>File {index + 1}</h3>
            <div>
              <label>Order ID:</label>
              <input type="text" value={data.orderId} readOnly />
            </div>
            <div>
              <label>VIN:</label>
              <input type="text" value={data.vin} readOnly />
            </div>
            <div>
              <label>Vehicle:</label>
              <input type="text" value={data.vehicle} readOnly />
            </div>
            <div>
              <label>Pickup Information:</label>
              <textarea
                value={data.pickupInfo}
                readOnly
                style={{ width: "100%", height: "100px" }}
              />
            </div>
            <div>
              <label>Delivery Information:</label>
              <textarea
                value={data.deliveryInfo}
                readOnly
                style={{ width: "100%", height: "100px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
