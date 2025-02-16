import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001" }),
  tagTypes: ["service"],
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

    createService: builder.mutation({
      query: (userData) => ({
        url: "/service",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["service"],
    }),

    getAllService: builder.query({
      query: () => `/service`,
      providesTags: ["service"],
    }),

    updateService: builder.mutation({
      query: ({ data: userData, id }) => ({
        url: `/service/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["service"],
    }),

    deleteService: builder.mutation({
      query: ({ id }) => ({
        url: `/service/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["service"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useCreateServiceMutation,
  useGetAllServiceQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = apiSlice;
