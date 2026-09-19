import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useForm, Controller,FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '../customComponents/Phone';
import api from '../../lib/services/api';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';


// Define the schema using Zod
const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international number',
  }),
});



interface LoginFormProps {
  // onSubmit: (phoneNumber: string, visitorId: string) => void;
  // responseId: string;
  // challengeId: string;
  // defaultCountry: string;
}



const LoginForm = ({}: // onSubmit,
// responseId,
// challengeId,
// defaultCountry,
LoginFormProps) => {
   
  const router = useRouter();
  const [otpVisible, setOtpVisible] = useState(false); // Manage OTP visibility
  const [buttonText, setButtonText] = useState('Log In'); // Initial button text
  const [otpValue, setOtpValue] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null); // To store verification ID
  const [resendDisabled, setResendDisabled] = useState(false); // Manage resend button state
  const [timer, setTimer] = useState(0); // Timer state
  const [phoneNumber, setPhoneNumber] = useState(''); // Phone number state
  const [limitReached, setLimitReached] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  interface FormData {
    phoneNumber: string;
  }

  // Initialize React Hook Form
  const methods = useForm<FormData>({
    resolver: zodResolver(phoneSchema),
    mode: 'onChange',
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = methods;

  useEffect(() => {
    if (timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else {
      setResendDisabled(false);
    }
  }, [timer]);

  useEffect(() => {
    if (resendAttempts >= 2) {
      setLimitReached(true);
    }
  }, [resendAttempts]);

  const startTimer = () => {
    setTimer(60);
    setResendDisabled(true);
  };

  const handleButtonClick: SubmitHandler<FormData> = async (data) => {
    if (buttonText === 'Log In') {
      try {
        abortControllerRef.current = new AbortController();
        const result = await api.sendOTP(data.phoneNumber);

        if (result) {
          setVerificationId(result);
          setOtpVisible(true);
          setButtonText('Verify OTP');
          startTimer();
          setPhoneNumber(data.phoneNumber);
          toast.success('OTP sent successfully');
        } else {
          toast.error('Failed to get verification ID');
        }
      } catch (error) {
        toast.error('Unable to send OTP at this moment. Please try again.');
      }
    } else {
      try {
        if (!verificationId) {
          toast.error('Verification ID is missing');
          return;
        }
        abortControllerRef.current = new AbortController();
        const { token } = await api.verifyOTP(verificationId, otpValue, phoneNumber);

        if (token) {
          Cookies.set('jwt_token', token, { expires: 12 / 24 });
          router.push('/organisations');
          toast.success('OTP verified successfully');
        } else {
          toast.error('OTP verification failed');
        }
      } catch (error) {
        toast.error('OTP verification failed');
       // console.error(error);
      }
    }
  };

  const handleOtpChange = (newValue: string) => {
    // Extract the value from the event target (input element)
    // const { value } = event.target;
    //console.log(newValue);
    // Update the state with the extracted value
    setOtpValue(newValue);
  };

  const handleResendOtp = async () => {
    if (limitReached) {
      toast.error('Resend limit reached. Please Reset.');
      return;
    }
    try {
      abortControllerRef.current = new AbortController();
      const result = await api.sendOTP(watch('phoneNumber'));

      if (result) {
        setVerificationId(result);
        startTimer(); // Restart timer
        setResendAttempts((prev) => prev + 1);
        toast.info("OTP resent");
        //console.log('OTP resent, Verification ID:', result);
      } else {
        toast.error("Failed to resend OTP")
        //console.error('Failed to resend OTP');
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Please check and try again.")
     // console.error('Error resending OTP:', error);
    }
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel any ongoing network requests
    }
    setOtpVisible(false);
    setButtonText('Log in');
    setOtpValue('');
    setVerificationId(null);
    setResendDisabled(false);
    setTimer(0);
    setPhoneNumber('');
    setResendAttempts(0);
    setLimitReached(false);
    methods.reset({ phoneNumber: '' });
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
        <div className=" font-bold text-1xl">Login</div>
        <form onSubmit={handleSubmit(handleButtonClick)}>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                control={control}
                name="phoneNumber"
                label="" // Set an appropriate label here
                placeholder="Enter Phone Number"
                disabled={resendDisabled || limitReached}
              />
            )}
          />

          {/* <ErrorMessage
            hasError={!!errors.phoneNumber}
            errorMessage={(errors.phoneNumber?.message as string) || ''}
          /> */}
          {otpVisible && (
            <div>
              <div className="space-y-2 mt-6 w-full flex justify-evenly">
                <InputOTP maxLength={4} onChange={handleOtpChange}>
                  <InputOTPGroup>
                    <InputOTPSlot
                      className="bg-[hsl(336,10%,10%)] text-white w-[4.40rem] h-10 text-center text-1xl rounded-s border-none"
                      index={0}
                    />
                    <InputOTPSeparator />
                    <InputOTPSlot
                      className="bg-[hsl(336,10%,10%)] text-white w-[4.40rem] h-10 text-center text-1xl rounded-s border-none"
                      index={1}
                    />
                    <InputOTPSeparator />
                    <InputOTPSlot
                      className="bg-[hsl(336,10%,10%)] text-white w-[4.40rem] h-10 text-center text-1xl rounded-s border-none"
                      index={2}
                    />
                    <InputOTPSeparator />
                    <InputOTPSlot
                      className="bg-[hsl(336,10%,10%)] text-white w-[4.40rem] h-10 text-center text-1xl rounded-s border-none"
                      index={3}
                    />
                  </InputOTPGroup>
                </InputOTP>

              </div>

              {/* <div className="space-y-0 mt-6">
              <Label htmlFor="OTP">Enter OTP</Label>
              <Input onChange={handleOtpChange} id="OTP" placeholder="Enter OTP" />
            </div> */}

              <div className="flex justify-between mt-6 w-full">
                <Button
                  variant="secondary"
                  onClick={handleResendOtp}
                  type="button"
                  className="flex-grow mr-2 text-white"
                  disabled={resendDisabled || limitReached}
                  style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}
                >
                  {resendDisabled ? `Resend OTP (${timer}s)` : 'Resend OTP'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  type="button"
                  className="flex-grow mr-2 text-white"
                  style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)' }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
          <Button
            type="submit"
            disabled={!isValid || (otpVisible && otpValue.length < 4)}
            className="mt-6 w-full rounded text-white"
            style={{ backgroundColor: 'hsl(336, 10%, 10%, 1)', color:'white' }}
          >
            {buttonText}
          </Button>
        </form>
        <ToastContainer />
      </div>
    </FormProvider>
  );
};

export default LoginForm;
