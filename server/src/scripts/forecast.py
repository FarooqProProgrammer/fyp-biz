from flask import Flask, jsonify,request
import pandas as pd
from prophet import Prophet
from flask_pymongo import PyMongo



app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://farooq123:farooq123@cluster0.ijdh8yd.mongodb.net/fyp-project?retryWrites=true&w=majority&appName=Cluster0"
mongo = PyMongo(app)





# Sample data
dates = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05']
sales = [100, 150, 130, 160, 170]

# Create DataFrame
data = pd.DataFrame({
    'ds': pd.to_datetime(dates),
    'y': sales
})

# Initialize and fit the Prophet model
model = Prophet()
model.fit(data)

@app.route('/forecast', methods=['GET'])
def forecast():

    future = model.make_future_dataframe(periods=7)  

    
    forecast = model.predict(future)

    
    forecast = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]

    
    forecast_list = forecast.tail(7).to_dict('records')  # Get the last 7 records

    return jsonify(forecast_list)
@app.route('/predict', methods=['GET'])
def predict():
    # Retrieve invoices including clientId and userId fields
    records = mongo.db.invoices.find({}, {
        '_id': 0,
        'invoiceDate': 1,
        'invoiceNumber': 1,
        'clientId': 1,
        'userId': 1
    })
    data_list = list(records)
    
    if not data_list:
        return jsonify({"error": "No sales data found"}), 404

    # Populate client and user details
    for record in data_list:
        client = mongo.db.customers.find_one({"_id": record.get("clientId")}, {"_id": 0})
        record["client"] = client 

        user = mongo.db.users.find_one({"_id": record.get("userId")}, {"_id": 0})
        record["user"] = user  

    # Prepare DataFrame for Prophet
    df = pd.DataFrame(data_list)
    df['invoiceDate'] = pd.to_datetime(df['invoiceDate'])
    df.rename(columns={'invoiceDate': 'ds', 'invoiceNumber': 'y'}, inplace=True)

    # Ensure that the 'y' column is numeric; convert and drop any non-numeric rows.
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    df = df.dropna(subset=['y'])
    
    # Check if we have enough data points
    if df.shape[0] < 3:
        return jsonify({"error": "Not enough valid numeric sales data found for forecasting"}), 400

    # Fit the Prophet model with simplified seasonality
    try:
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
        )
        model.fit(df)
    except Exception as e:
        return jsonify({
            "error": "Model training failed",
            "details": str(e)
        }), 500

    # Generate forecast within a try/except block.
    try:
        future = model.make_future_dataframe(periods=7)
        forecast = model.predict(future)
        forecast_result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(7)
        forecast_result['day'] = forecast_result['ds'].dt.strftime('%A')  # Add day names
        forecast_json = forecast_result.to_dict('records')
    except Exception as e:
        return jsonify({
            "error": "Forecasting failed",
            "details": str(e)
        }), 500

    return jsonify({
        "forecast": forecast_json,
        "populated_invoices": data_list
    }), 200


if __name__ == '__main__':
   app.run(debug=False)

