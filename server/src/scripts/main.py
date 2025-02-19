from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from statsmodels.tsa.arima.model import ARIMA
import smtplib
from email.message import EmailMessage
import asyncio

app = FastAPI()

# Enable CORS for all routes (allow all origins; adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000/"],
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Configure MongoDB client using Motor
MONGO_URI = (
    "mongodb+srv://farooq123:farooq123@cluster0.ijdh8yd.mongodb.net/fyp-project?"
    "retryWrites=true&w=majority&appName=Cluster0"
)
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client["fyp-project"]

@app.get("/predict")
async def predict(email: str = Query(None)):
    # Retrieve invoice documents from MongoDB
    cursor = db.invoices.find({}, {
        "_id": 0,
        "invoiceDate": 1,
        "invoiceNumber": 1,
        "clientId": 1,
        "userId": 1,
        "Service": 1,
    })
    data_list = await cursor.to_list(length=None)
    if not data_list:
        raise HTTPException(status_code=404, detail="No sales data found")
    
    # Populate client, user, and service details (awaiting each query)
    for record in data_list:
        client = await db.customers.find_one({"_id": record.get("clientId")}, {"_id": 0})
        record["client"] = client
        user = await db.users.find_one({"_id": record.get("userId")}, {"_id": 0})
        record["user"] = user
        service = await db.services.find_one({"_id": record.get("Service")}, {"_id": 0, "serviceName": 1})
        record["service"] = service if service else None
        record["serviceName"] = service.get("serviceName") if service else "Unknown Service"
    
    # Create a DataFrame for forecasting
    df = pd.DataFrame(data_list)
    try:
        df['invoiceDate'] = pd.to_datetime(df['invoiceDate'])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Date conversion error: {str(e)}")
    df.rename(columns={'invoiceDate': 'ds', 'invoiceNumber': 'y'}, inplace=True)
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    df = df.dropna(subset=['y'])
    if df.shape[0] < 3:
        raise HTTPException(status_code=400, detail="Not enough valid numeric sales data found for forecasting")
    
    df.set_index('ds', inplace=True)
    
    # Group by serviceName and forecast for each service
    service_forecasts = {}
    for service_name, group in df.groupby('serviceName'):
        data_count = group.shape[0]
        if data_count < 3:
            service_forecasts[service_name] = {
                "error": "Not enough data for forecasting",
                "data_count": data_count,
            }
            continue
        
        group = group.sort_index()
        try:
            # ARIMA model fitting is synchronous
            model_arima = ARIMA(group['y'], order=(1, 1, 1))
            model_fit = model_arima.fit()
        except Exception as e:
            service_forecasts[service_name] = {
                "error": "ARIMA model training failed",
                "data_count": data_count,
                "details": str(e)
            }
            continue
        
        try:
            forecast_values = model_fit.forecast(steps=7)
            forecast_dates = pd.date_range(start=group.index[-1] + pd.Timedelta(days=1), periods=7, freq='D')
            forecast_df = pd.DataFrame({'ds': forecast_dates, 'yhat': forecast_values})
            forecast_df['yhat_lower'] = forecast_df['yhat'] - 10  # Dummy lower bound
            forecast_df['yhat_upper'] = forecast_df['yhat'] + 10  # Dummy upper bound
            forecast_df['day'] = forecast_df['ds'].dt.strftime('%A')
            service_forecasts[service_name] = {
                "data_count": data_count,
                "forecast": forecast_df.to_dict('records')
            }
        except Exception as e:
            service_forecasts[service_name] = {
                "error": "ARIMA forecasting failed",
                "data_count": data_count,
                "details": str(e)
            }
    
    response_data = {
        "service_forecasts": service_forecasts,
        "populated_invoices": data_list,
    }
    
    # If an email is provided as a query parameter, send the results via email.
    email_status = None
    if email:
        try:
            subject = "Forecast and Invoice Data Report"
            content = f"Forecast and Invoice Data:\n\n{response_data}"
            
            msg = EmailMessage()
            msg.set_content(content)
            msg['Subject'] = subject
            msg['From'] = "no-reply@example.com"
            msg['To'] = email
            
            # Synchronously send email using local SMTP server (MailDev)
            with smtplib.SMTP('localhost', 1025) as smtp:
                smtp.send_message(msg)
            email_status = f"Email sent successfully to {email}"
        except Exception as e:
            email_status = f"Email sending failed: {str(e)}"
    
    response_data["email_status"] = email_status
    return JSONResponse(content=response_data)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
