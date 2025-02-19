import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";  // Or use another method to get the token
import nookies from "nookies";



export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001",
    prepareHeaders: async (headers) => {
      const cookies = nookies.get();
      const token = cookies.token; 
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
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
    forgotPassword: builder.mutation({
      query: (userData) => ({
        url: "/forgot-password",
        method: "POST",
        body: userData,
      }),
    }),



    verifyOtp: builder.mutation({
      query: (userData) => ({
        url: "/otp-verify",
        method: "POST",
        body: userData,
      }),
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
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
  useLogoutUserMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
} = apiSlice;
