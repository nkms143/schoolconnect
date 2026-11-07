export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  const verifyLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  console.log(`\n================ EMAIL VERIFICATION SIMULATOR ================`);
  console.log(`To: ${email}`);
  console.log(`Subject: Verify Your SchoolConnect Account`);
  console.log(`Click or open this link to verify:`);
  console.log(verifyLink);
  console.log(`Token: ${token}`);
  console.log(`==============================================================\n`);
  return true;
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log(`\n================ PASSWORD RESET EMAIL SIMULATOR ================`);
  console.log(`To: ${email}`);
  console.log(`Subject: Reset Your SchoolConnect Password`);
  console.log(`Click or open this link to set a new password:`);
  console.log(resetLink);
  console.log(`Token: ${token}`);
  console.log(`================================================================\n`);
  return true;
};
