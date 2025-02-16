import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./services/apiSlice"; // Create this next
import { customerApi } from "./services/customerApi";
import { invoiceSlice } from "./services/invoice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [invoiceSlice.reducerPath]: invoiceSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      customerApi.middleware,
      invoiceSlice.middleware
    ),
});

setupListeners(store.dispatch);
