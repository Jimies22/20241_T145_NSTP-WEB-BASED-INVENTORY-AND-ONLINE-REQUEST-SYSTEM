// const express = require("express");
// const bwipjs = require("bwip-js");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Barcode generator endpoint
// app.get("/generate-barcode", (req, res) => {
//   const { text, format = "code128" } = req.query; // Default to Code128 format if not specified

//   if (!text) {
//     return res.status(400).send("Please provide text for the barcode");
//   }

//   // Generate barcode
//   bwipjs.toBuffer(
//     {
//       bcid: format, // Barcode format
//       text: text, // Text to encode
//       scale: 3, // 3x scaling factor
//       height: 10, // Height of barcode in mm
//       includetext: true, // Show human-readable text
//       textxalign: "center", // Center align the text
//     },
//     (err, png) => {
//       if (err) {
//         res.status(500).send("Error generating barcode: " + err.message);
//       } else {
//         res.writeHead(200, {
//           "Content-Type": "image/png",
//           "Content-Length": png.length,
//         });
//         res.end(png);
//       }
//     }
//   );
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
