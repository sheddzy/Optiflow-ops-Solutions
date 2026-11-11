import { neonAuth } from "@/lib/auth/neon";

/**
 * The installed @neon/auth 0.8.x runtime exposes Neon Auth's email-OTP
 * plugin methods, but its generated TypeScript surface types emailOtp as
 * unknown and omits signIn.emailOtp. Keep the compatibility cast isolated
 * here rather than weakening types across the application.
 */
type NeonAuthEmailOtpApi = {
  emailOtp: {
    sendVerificationOtp(input: {
      email: string;
      type: "sign-in";
    }): Promise<{ error?: unknown }>;
  };
  signIn: {
    emailOtp(input: {
      email: string;
      otp: string;
    }): Promise<{ error?: unknown }>;
  };
};

const emailOtpAuth = neonAuth as unknown as NeonAuthEmailOtpApi;

export async function sendRecruitmentSignInCode(email: string): Promise<boolean> {
  const { error } = await emailOtpAuth.emailOtp.sendVerificationOtp({
    email,
    type: "sign-in",
  });
  return !error;
}

export async function verifyRecruitmentSignInCode(
  email: string,
  otp: string,
): Promise<boolean> {
  const { error } = await emailOtpAuth.signIn.emailOtp({ email, otp });
  return !error;
}
