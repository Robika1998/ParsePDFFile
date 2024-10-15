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
//     const vinMatch = text.match(/VIN:\s*([\w\d]+)/);
//     const vehicleMatch = text.match(/(\d{4})\s+(\w+)\s+(\w+\s*\w*)/);
//     const pickupInfoMatch = text.match(
//       /Pick up location\s*(.*?)(?=\s*Drop off location|\s*$)/s
//     );
//     const deliveryInfoMatch = text.match(
//       /Drop off location\s*(.*?)(?=\s*Transport Contact|\s*$)/s
//     );

//     setOrderId(orderIdMatch ? orderIdMatch[1] : "Not found");
//     setVin(vinMatch ? vinMatch[1] : "Not found");
//     setVehicle(
//       vehicleMatch
//         ? `${vehicleMatch[1]} ${vehicleMatch[2]} ${vehicleMatch[3]}`
//         : "Not found"
//     );
//     setPickupInfo(pickupInfoMatch ? pickupInfoMatch[1].trim() : "Not found");
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
//           <textarea type="text" value={pickupInfo} readOnly />
//         </div>
//         <div>
//           <label>Delivery Information:</label>
//           <textarea type="text" value={deliveryInfo} readOnly />
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
  const [file, setFile] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [pickupInfo, setPickupInfo] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);

        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((item) => item.str).join(" ") + " ";
        }

        console.log(textContent);
        extractData(textContent);
      };
      fileReader.readAsArrayBuffer(selectedFile);
    }
  };

  const extractData = (text) => {
    const orderIdMatch = text.match(/Auction ID #\s*(\d+)/);
    const vinMatch = text.match(/VIN:\s*([\w\d]+)/);
    const vehicleMatch = text.match(/Vehicle:\s*(\d{4}\s+\w+\s+\w+\s*\w*)/);

    const pickupInfoMatch = text.match(
      /Pick up location\s*([\s\S]*?)(?=\s*Drop off location|\s*$)/
    );

    const deliveryInfoMatch = text.match(
      /Drop off location\s*([\s\S]*?)(?=\s*Transport Contact|\s*$)/
    );

    setOrderId(orderIdMatch ? orderIdMatch[1] : "Not found");
    setVin(vinMatch ? vinMatch[1] : "Not found");
    setVehicle(vehicleMatch ? vehicleMatch[1].trim() : "Not found");
    setPickupInfo(pickupInfoMatch ? pickupInfoMatch[1].trim() : "Not found");
    setDeliveryInfo(
      deliveryInfoMatch ? deliveryInfoMatch[1].trim() : "Not found"
    );
    setError("");
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>
      <form>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <h2>Extracted Information</h2>
        <div>
          <label>Order ID:</label>
          <input type="text" value={orderId} readOnly />
        </div>
        <div>
          <label>VIN:</label>
          <input type="text" value={vin} readOnly />
        </div>
        <div>
          <label>Vehicle:</label>
          <input type="text" value={vehicle} readOnly />
        </div>
        <div>
          <label>Pickup Information:</label>
          <textarea
            value={pickupInfo}
            readOnly
            style={{ width: "100%", height: "100px" }}
          />
        </div>
        <div>
          <label>Delivery Information:</label>
          <textarea
            value={deliveryInfo}
            readOnly
            style={{ width: "100%", height: "100px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
