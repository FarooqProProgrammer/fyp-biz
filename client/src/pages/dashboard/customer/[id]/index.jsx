import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/Layout/Provider/DashboardLayout";

import { toast } from "@/hooks/use-toast";
import {
  useGetSingleCustomerQuery,
  useUpdateCustomerMutation,
} from "@/redux/services/customerApi";
import apiClient from "@/lib/axios";

const AddCustomer = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const router = useRouter();

  useEffect(() => {
    console.log(router.query);
  }, [router]);

  const { data, isLoading: customerLoading } = useGetSingleCustomerQuery(
    router.query.id,
    { skip: !router.query.id }
  );

  useEffect(() => {
    console.log(data);

    setValue("name", data?.data?.name);
    setValue("email", data?.data?.email);
    setValue("phone", data?.data?.phone);
    setValue("address", data?.data?.address);
  }, [data]);

  const [createCustomer, { isLoading }] = useUpdateCustomerMutation();

  const onSubmit = async (data) => {
    console.log("Customer Data:", data);

    const response = await apiClient.put(`/customer/${router.query.id}`, data);
    console.log(response);
  

    reset();
    toast({
      title: "Customer Added ",
      description: "Customer Added Success",
    });
    router.push("/dashboard/customer");
  };

  return (
    <DashboardLayout>
      {customerLoading ? (
        <p>...Loading</p>
      ) : (
        <div className="min-h-screen  p-6">
          <div className="w-full  rounded-2xl p-8 space-y-6">
            <h2 className="text-3xl font-bold text-start text-gray-800">
              Add New Customer
            </h2>
            <p className="text-start text-gray-600">
              Fill in the details below to add a new customer.
            </p>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Name Field */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  placeholder="Enter customer name"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  placeholder="Enter address (optional)"
                  {...register("address")}
                />
              </div>

              {/* Submit Button (Full-width) */}
              <div className="col-span-1 md:col-span-2">
                <Button disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AddCustomer;
