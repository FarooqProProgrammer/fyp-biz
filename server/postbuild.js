import fs from "fs-extra";

fs.copy("uploads", "dist/uploads")
  .then(() => console.log("Uploads folder copied successfully!"))
  .catch((err) => console.error("Error copying uploads folder:", err));
