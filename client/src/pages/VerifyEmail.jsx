import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import axios from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyUser } from "@/store/authSlice";

function VerifyEmail() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 6) {
      setError("Your one-time password must be exactly 6 characters.");
      return;
    }

    try {
      const response = await axios.post("/api/user/verify-email", {
        code: pin,
      });

      if (response.status === 200) {
        dispatch(verifyUser());
        navigate("/");
        toast.success("Email verified successfully!");
      } else {
        toast.error("Invalid or expired code.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed.");
    }

    setPin("");
    setError("");
  };

  const handleInputChange = (e) => {
    setPin(e);
    if (error) {
      setError("");
    }
  };

  const handleResendEmail = async () => {
    try {
      const response = await axios.get("/api/user/resend-verification-email");
      toast.success(response.data.message || "Verification email resent!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend verification email."
      );
    }
  };

  return (
    <div className="max-h-screen h-screen w-full p-4 flex items-center justify-center">
      <div className="w-full sm:w-[60%] lg:w-[30%] space-y-6 flex flex-col justify-center">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium mb-2">
            One-Time Password
          </label>
          <InputOTP maxLength={6} value={pin} onChange={handleInputChange}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="mt-2 text-sm text-gray-500">
            Please enter the one-time password sent to your phone.
          </p>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <Button type="submit" onClick={handleSubmit}>
          Submit
        </Button>

        <button
          onClick={handleResendEmail}
          className="text-blue-500 hover:underline mt-4"
        >
          Resend Email
        </button>
      </div>
    </div>
  );
}

export default VerifyEmail;
