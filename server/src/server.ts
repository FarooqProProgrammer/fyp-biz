import app from "./app";
import figlet from "figlet";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await figlet("fyp project", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  });
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
