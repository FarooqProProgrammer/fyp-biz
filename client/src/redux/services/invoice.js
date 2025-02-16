import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const invoiceSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001" }),
  tagTypes: ["invoice"],
  endpoints: (builder) => ({
    createInvoice: builder.mutation({
      query: ({ userData, token }) => ({
        url: "/invoice",
        method: "POST",
        body: userData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["invoice"], // Correct usage
    }),
    getAllCustomer: builder.query({
      query: () => "/invoice",
      providesTags: ["invoice"],
    }),
  }),
});

export const { useCreateInvoiceMutation, useGetAllCustomerQuery } = invoiceSlice;