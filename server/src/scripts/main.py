import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import smtplib
from email.message import EmailMessage
from pymongo import MongoClient

# MongoDB Configuration
DATABASE_URI = "mongodb+srv://farooq123:farooq123@cluster0.ijdh8yd.mongodb.net/fyp-project?retryWrites=true&w=majority&appName=Cluster0"
mongo_client = MongoClient(DATABASE_URI)
db = mongo_client["fyp-project"]

# Fetch invoices from MongoDB
def get_invoice_data():
    try:
        invoices = list(db.invoices.find({}, {"_id": 0}))  # Fetch data without ObjectId
        return invoices
    except Exception as e:
        print(f"Database Error: {str(e)}")
        return []

# Forecasting function using ARIMA
def forecast_invoices():
    invoices = get_invoice_data()

    if not invoices:
        print("No invoice data available for forecasting.")
        return None

    df = pd.DataFrame(invoices)
    df["invoiceDate"] = pd.to_datetime(df["invoiceDate"], errors="coerce")
    df.rename(columns={"invoiceDate": "ds", "invoiceNumber": "y"}, inplace=True)
    df.set_index("ds", inplace=True)

    if df.shape[0] < 3:
        print("Not enough data for forecasting.")
        return None

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

    return {"service_forecasts": service_forecasts, "populated_invoices": invoices}

# Function to send forecast results via email
def send_email_report(email, data):
    if not email:
        print("No email provided.")
        return

    try:
        subject = "Forecast and Invoice Data Report"
        content = f"Forecast and Invoice Data:\n\n{data}"
        msg = EmailMessage()
        msg.set_content(content)
        msg["Subject"] = subject
        msg["From"] = "no-reply@example.com"
        msg["To"] = email

        SMTP_SERVER = "localhost"
        SMTP_PORT = 1025  # Update if using a real mail server

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.send_message(msg)

        print(f"Email sent successfully to {email}")
    except Exception as e:
        print(f"Email sending failed: {str(e)}")

# Run the forecasting process
if __name__ == "__main__":
    email = input("Enter email to send forecast results (leave blank to skip): ").strip()
    forecast_result = forecast_invoices()

    if forecast_result:
        print("Forecast Results:", forecast_result)
        send_email_report(email, forecast_result)
    else:
        print("Forecasting process failed.")
