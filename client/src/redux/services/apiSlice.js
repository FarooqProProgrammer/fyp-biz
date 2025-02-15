import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001" }),
  tagTypes: ["customer"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),

    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/login",
        method: "POST",
        body: userData,
      }),
    }),

    createCustomer: builder.mutation({
      query: (userData) => ({
        url: "/customer",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["customer"],
    }),
    updateCustomer: builder.mutation({
      query: ({id,userData}) => ({
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
  useRegisterUserMutation,
  useDeleteCustomerMutation,
  useLoginUserMutation,
  useGetSingleCustomerQuery,
  useCreateCustomerMutation,
  useGetAllCustomerQuery,
  useUpdateCustomerMutation
} = apiSlice;
