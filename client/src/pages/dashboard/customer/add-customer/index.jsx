import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/Layout/Provider/DashboardLayout";

import { toast } from "@/hooks/use-toast";
import { useCreateCustomerMutation } from "@/redux/services/customerApi";
import { useGetAllServiceQuery } from "@/redux/services/apiSlice";

const AddCustomer = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const router = useRouter();

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const { data } = useGetAllServiceQuery();

  const onSubmit = async (data) => {
    console.log("Customer Data:", data);

    const response = await createCustomer(data);

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
      <div className="min-h-screen p-6">
        <div className="w-full rounded-2xl p-8 space-y-6">
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

            {/* Service Selection */}
            <div>
              <Label htmlFor="service">Select Service</Label>
              <select
                id="service"
                className="w-full p-2 border rounded"
                {...register("service", { required: "Service is required" })}
              >
                <option value="">Select a service</option>
                {data?.service?.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.serviceName}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.service.message}
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
              <Button type="submit">Add Customer</Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddCustomer;
