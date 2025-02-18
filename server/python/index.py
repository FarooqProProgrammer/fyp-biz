from flask import Flask, jsonify
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os
from dateutil.parser import parse as parse_date  # pip install python-dateutil
import traceback

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Connect to MongoDB using DATABASE_URI from the .env file
app.config["MONGO_URI"] = os.getenv("DATABASE_URI")
mongo = PyMongo(app)

# Simple Moving Average (SMA) function
def calculate_sma(data, period=7):
    result = []
    for i in range(period - 1, len(data)):
        sum_values = sum(entry["y"] for entry in data[i - period + 1 : i + 1])
        avg = sum_values / period
        result.append({"ds": data[i]["ds"], "yhat": avg})
    return result

@app.route("/generate-sales", methods=["GET"])
def generate_sales():
    try:
        # Fetch invoices from MongoDB
        invoices = list(
            mongo.db.invoices.find(
                {},
                {"invoiceDate": 1, "invoiceAmount": 1, "_id": 0}
            )
        )
        print(invoices)

        if not invoices:
            return jsonify({"success": False, "message": "No invoices found"}), 404

        # Format sales data using dateutil for flexible date parsing
        sales_data = []
        for invoice in invoices:
            try:
                dt = parse_date(invoice["invoiceDate"])
                sales_data.append({
                    "ds": dt.strftime("%Y-%m-%d"),
                    "y": float(invoice["invoiceAmount"])  # Ensure numeric value
                })
            except Exception as e:
                print("Error parsing invoice:", invoice, e)
                continue

        if not sales_data:
            return jsonify({"success": False, "message": "No valid sales data found"}), 404

        # Apply Simple Moving Average (SMA) for forecasting
        forecast = calculate_sma(sales_data, 7)

        return jsonify({"success": True, "invoices": sales_data, "forecast": forecast})
    except Exception as e:
        print("Error fetching sales data:")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": "Internal Server Error",
            "error": str(e)
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
