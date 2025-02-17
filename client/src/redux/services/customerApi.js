import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import nookies from "nookies"; // Import nookies

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3001",
  prepareHeaders: (headers) => {
    const cookies = nookies.get(); // Get cookies
    const token = cookies.token; // Assuming the token is stored in the "token" cookie

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery, // ✅ Use the fixed baseQuery with authentication
  tagTypes: ["customer"],
  endpoints: (builder) => ({
    createCustomer: builder.mutation({
      query: (userData) => ({
        url: "/customer",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["customer"],
    }),

    updateCustomer: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/customer/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["customer"],
    }),

    getAllCustomer: builder.query({
      query: () => "/customer",
      providesTags: ["customer"],
    }),

    getSingleCustomer: builder.query({
      query: (id) => `/customer/${id}`,
    }),

    deleteCustomer: builder.mutation({
      query: ({ id }) => ({
        url: `/customer/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["customer"],
    }),
  }),
});

export const {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetAllCustomerQuery,
  useGetSingleCustomerQuery,
  useDeleteCustomerMutation,
} = customerApi;
