# Gmail Setup for Email Verification

## Steps to Enable Email Sending:

1. **Enable 2-Factor Authentication on Gmail**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn On

2. **Generate App Password**
   - Google Account → Security → App passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Copy the 16-character password

3. **Update .env file:**
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

4. **Restart backend server**
   ```bash
   npm start
   ```

## Alternative: Use Ethereal Email (Testing)

For testing without real Gmail:
```javascript
// Replace transporter with:
const transporter = nodemailer.createTransporter({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal.pass'
  }
});
```

## Troubleshooting:
- Make sure 2FA is enabled
- Use App Password, not regular password
- Check Gmail security settings
- Verify EMAIL_USER and EMAIL_PASS in .env