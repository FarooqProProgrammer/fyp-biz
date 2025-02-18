import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/redux/services/apiSlice";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await forgotPassword({ email }).unwrap();
      console.log(res);

      

      toast({
        title: "OTP Sent!",
        description: "Check your email for the OTP to reset your password.",
      });

      router.push(`/auth/otp?email=${email}`);
    } catch (error) {
      console.log(error);
      toast({
        title: "Request Failed",
        description: "Invalid email or server error. Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 space-y-6">
          {/* Header Section */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Forgot Password?
            </h2>
            <p className="text-gray-500">Enter your email to receive an OTP</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="john@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full py-6 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>

            <p className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Remembered your password?{" "}
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
