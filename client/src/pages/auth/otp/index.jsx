import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import React, { useState } from "react";
import OtpInput from "react-otp-input";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleOtpChange = (value) => {
    setOtp(value);
    console.log("Entered OTP:", value);
  };

  const handleVerifyOtp = async () => {
    console.log("Verifying OTP:", otp);
    // Add API call for OTP verification here
    if (otp === "1234") {
      toast({
        title: "OTP Verified",
        description: "Your account has been successfully verified.",
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP and try again.",
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
              Verification Code
            </h2>
            <p className="text-gray-500">
              We have sent a verification code to your email
            </p>
          </div>

          {/* OTP Input Section */}
          <div className="flex justify-center py-4">
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              numInputs={4}
              renderSeparator={<span className="w-4"                                                                ></span>}
              renderInput={(props) => <input {...props} />}
              inputStyle={{
                width: "3.5rem",
                height: "3.5rem",
                margin: "0 2px",
                padding: "0.5rem",
                border: "2px solid #E5E7EB",
                borderRadius: "0.75rem",
                backgroundColor: "white",
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#374151",
                textAlign: "center",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              className="otp-input-container"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button 
              onClick={handleVerifyOtp} 
              className="w-full py-6 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl"
            >
              Verify Code
            </Button>
            
            <div className="text-center">
              <button 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                onClick={() => toast({
                  title: "New OTP Sent",
                  description: "A new verification code has been sent to your email.",
                })}
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>

          {/* Footer Section */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Having trouble? <button className="text-indigo-600 hover:text-indigo-800 font-medium">Contact Support</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Otp;
