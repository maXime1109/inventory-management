import bwipjs from "bwip-js"
import fs from "fs"

// Generate a barcode asynchronously
bwipjs.toBuffer(
  {
    bcid: "code128", // Barcode type
    text: "123456", // Text to encode
    scale: 3, // Scale factor
    height: 10, // Bar height, in millimeters
    includetext: true, // Show human-readable text
    textxalign: "center", // Text horizontal alignment
  },
  function (err, png) {
    if (err) {
      console.log(err)
    } else {
      // Save the barcode as a PNG file
      fs.writeFileSync("barcode.png", png)
      console.log("Barcode saved as barcode.png")
    }
  }
)
