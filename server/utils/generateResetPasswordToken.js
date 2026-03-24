import crypto from 'crypto';

export const generateResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const  resetPasswordExpire = Date.now() + 150 * 60 * 1000; // Token valid for 15 minutes
    return { resetToken, hashedToken, resetPasswordExpire };
}