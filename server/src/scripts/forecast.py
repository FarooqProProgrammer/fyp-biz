import sys
import pandas as pd
from prophet import Prophet
import json

try:
    input_data = sys.stdin.read()
    sales_data = json.loads(input_data)

    df = pd.DataFrame(sales_data)

    df.rename(columns={"ds": "ds", "y": "y"}, inplace=True)

  
    model = Prophet()
    model.fit(df)

    # Predict next 30 days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    print(json.dumps(forecast[['ds', 'yhat']].to_dict(orient="records")))

except Exception as e:
    print(json.dumps({"error": str(e)}))
