import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import axios from "@/api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyUser } from "@/store/authSlice";

export default function VerificationPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPhoneVerification, setIsPhoneVerification] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      setError("Your one-time password must be exactly 6 characters.");
      return;
    }

    try {
      const endpoint = isPhoneVerification
        ? "/api/user/verify-phone"
        : "/api/user/verify-email";
      const response = await axios.post(endpoint, {
        code: pin,
      });

      if (response.status === 200) {
        dispatch(verifyUser());
        navigate("/");
        toast.success(
          `${isPhoneVerification ? "Phone" : "Email"} verified successfully!`
        );
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

  const handleResend = async () => {
    let toastId1;
    try {
      toastId1 = toast.loading(
        `Resending verification ${isPhoneVerification ? "SMS" : "email"}...`
      );
      const endpoint = isPhoneVerification
        ? "/api/user/resend-verification-sms"
        : "/api/user/resend-verification-email";
      const response = await axios.get(endpoint);

      toast.dismiss(toastId);
      toast.success(
        response.data.message ||
          `Verification ${isPhoneVerification ? "SMS" : "email"} resent!`
      );
    } catch (error) {
      toastId1 && toast.dismiss(toastId1);
      const toastId = toast.error(
        error.response.status === 401 ? (
          <div>
            Please Signup first to resend verification{" "}
            {isPhoneVerification ? "SMS" : "email"}.
            <Link
              onClick={() => toast.dismiss(toastId)}
              to="/auth/signup"
              className="ml-1 text-blue-500 underline"
            >
              Signup
            </Link>
          </div>
        ) : (
          `Failed to resend verification ${
            isPhoneVerification ? "SMS" : "email"
          }.`
        )
      );
    }
  };

  return (
    <div className="max-h-screen h-screen w-full p-4 flex items-center justify-center">
      <div className="w-full sm:w-[60%] lg:w-[30%] space-y-6 flex flex-col justify-center">
        <div className="flex items-center space-x-2">
          <Switch
            id="verification-type"
            checked={isPhoneVerification}
            onCheckedChange={setIsPhoneVerification}
          />
          <Label htmlFor="verification-type">
            {isPhoneVerification ? "Phone Verification" : "Email Verification"}
          </Label>
        </div>

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
            Please enter the one-time password sent to your{" "}
            {isPhoneVerification ? "phone" : "email"}.
          </p>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <Button type="submit" onClick={handleSubmit}>
          Submit
        </Button>

        <button
          onClick={handleResend}
          className="text-blue-500 hover:underline mt-4"
        >
          Resend {isPhoneVerification ? "SMS" : "Email"}
        </button>
      </div>
    </div>
  );
}
