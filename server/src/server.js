import app from "./app";
import figlet from "figlet";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  figlet("fyp project", (err, data) => {
    if (err) {
      console.error("Something went wrong...", err);
      return;
    }
    console.log(data);
  });

  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
