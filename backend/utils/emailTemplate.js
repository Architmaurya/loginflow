export const buildEmailTemplate = (title, message, otp = null) => {
  return `
  <div style="width:100%; background:#f5f7fb; padding:40px; font-family:Arial, sans-serif;">
    <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
      
      <h2 style="text-align:center; color:#4B7BEC;">${title}</h2>

      <p style="font-size:16px; color:#333; line-height:1.6;">${message}</p>

      ${
        otp
          ? `
        <div style="text-align:center; margin:25px 0;">
          <div style="font-size:38px; font-weight:bold; background:#4B7BEC; color:white; padding:15px 25px; display:inline-block; border-radius:10px;">
            ${otp}
          </div>
          <p style="color:#666; margin-top:10px;">Valid for <strong>1 minute</strong>.</p>
        </div>
        `
          : ""
      }

      <div style="border-top:1px solid #eee; margin-top:30px; padding-top:15px;">
        <p style="font-size:13px; text-align:center; color:#999;">
          Powered by <strong>YourApp</strong>.
        </p>
      </div>

    </div>
  </div>`;
};
