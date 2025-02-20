from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import smtplib
from email.message import EmailMessage
from pymongo import MongoClient



app = Flask(__name__)

DATABASE_URI="mongodb+srv://farooq123:farooq123@cluster0.ijdh8yd.mongodb.net/fyp-project?retryWrites=true&w=majority&appName=Cluster0"
mongo_client = MongoClient(DATABASE_URI)
db = mongo_client["fyp-project"]

CORS(app, origins=["http://localhost:3000/"])


@app.route("/invoice-data", methods=["GET"])
def invoice():

    try:
        invoices = db.invoices.find()
        print(invoices)
        return jsonify(invoices)
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@app.route("/predict", methods=["GET"])
def predict():
    email = request.args.get("email")

    try:
        
        invoices = [
            {"invoiceDate": "2024-01-01", "invoiceNumber": 100, "serviceName": "Service A"},
            {"invoiceDate": "2024-01-02", "invoiceNumber": 120, "serviceName": "Service A"},
            {"invoiceDate": "2024-01-03", "invoiceNumber": 130, "serviceName": "Service A"},
            {"invoiceDate": "2024-01-04", "invoiceNumber": 110, "serviceName": "Service A"},
            {"invoiceDate": "2024-01-05", "invoiceNumber": 115, "serviceName": "Service A"},
            {"invoiceDate": "2024-01-06", "invoiceNumber": 140, "serviceName": "Service A"},
        ]

        df = pd.DataFrame(invoices)
        df["invoiceDate"] = pd.to_datetime(df["invoiceDate"], errors="coerce")
        df.rename(columns={"invoiceDate": "ds", "invoiceNumber": "y"}, inplace=True)
        df.set_index("ds", inplace=True)

        if df.shape[0] < 3:
            return jsonify({"error": "Not enough data for forecasting"}), 400

        df = df.sort_index()
        service_forecasts = {}

        try:
            model_arima = ARIMA(df["y"], order=(1, 1, 1))
            model_fit = model_arima.fit()
            forecast_values = model_fit.forecast(steps=7)
            forecast_dates = pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=7, freq="D")
            forecast_df = pd.DataFrame({"ds": forecast_dates, "yhat": forecast_values})
            forecast_df["yhat_lower"] = forecast_df["yhat"] - 10
            forecast_df["yhat_upper"] = forecast_df["yhat"] + 10
            forecast_df["day"] = forecast_df["ds"].dt.strftime("%A")
            service_forecasts["Service A"] = forecast_df.to_dict("records")

        except Exception as e:
            service_forecasts["Service A"] = {"error": f"ARIMA model error: {str(e)}"}

        response_data = {"service_forecasts": service_forecasts, "populated_invoices": invoices}

        # Send email if provided
        if email:
            try:
                subject = "Forecast and Invoice Data Report"
                content = f"Forecast and Invoice Data:\n\n{response_data}"
                msg = EmailMessage()
                msg.set_content(content)
                msg["Subject"] = subject
                msg["From"] = "no-reply@example.com"
                msg["To"] = email

                SMTP_SERVER = "localhost"
                SMTP_PORT = 1025  # Update if using a real mail server

                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
                    smtp.send_message(msg)

                response_data["email_status"] = f"Email sent successfully to {email}"
            except Exception as e:
                response_data["email_status"] = f"Email sending failed: {str(e)}"

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
