## Documentation For The Endpoints


:::info
This endpoints are still subject to change and they can be modified at anytime by the backend team during the development process

:::


:::warning
Never Make Changes to the Backend Code if you are Not on the Backend Track

:::

### To Start The Server Locally on your PC

* Navigate to the Backend Folder and create a new file named .env and paste the secrets given to every team member there.


:::warning
Remember to always delete this file before commiting your changes to Github

:::

* Open a new terminal, navigate to the backend folder in your terminal and run the command below to compile the code and start up your server

```javascript
npm run double
```

## Endpoints

### Base Route - http://localhost:5000

| Name | Route | Description | Expected data | Success Message | Error Message |
|----|----|----|----|----|----|
| User Sign Up | /api/auth/signup | Endpoint for users to sign up and create new account \n  \n It check if email address is valid, if user provided a STRONG password. \n It also checks if userName is still available | email - string \n password - A strong password \n userName - string \n firstName - string \n lastName - string | Status - 201 \n Message - “User Created Successfully” | status - 500 \n Message - “Registration failed, Please try again“ \n  |
| Verify User Email Address | /api/auth/verify-emai | This route is called when user clicks on the Verification link sent to their email address on sign up. \n It Checks if token is invalid or expired. Otherwise, it verifies the user. | token - string | Redirects user to `/verification-success` route | status -  400 \n Message - “Invalid or expired token, please request a new one“ \n  \n Status - 500 \n Message - “Verification failed, please try again“ |
| Resend Verification Email | /api/auth/resend-verification | This route is called when the user clicks on a button on the frontend to request for a new verification link. \n This route will check if user has been verified before sending another verification link | email - string (Valid email address) | status - 200 \n message - “Verification email sent successfully“ | status - 404 \n message - “User not found“ \n  \n status - 401 \n message - “Please provide a valid email address“ \n  \n status - 400 \n message - “Email has been verified“ \n  \n statsus - 500 \n message - “Failed to send verification email“ |
| User Login | /api/auth/signin | This route is called when the user signs in using their email and password on the frontend | email - string \n password - string | status - 200 \n message - “Login successful“ | status - 401 \n message - “Invalid credentials“ \n  \n status - 400 \n message - “Please provide credentials“ \n  \n status - 403 \n message - “Email is not verified, please verify your email before logging in“ \n  \n status - 500 \n message - “Server error, try again“ |
| Forgot Password | api/auth/forgot-password | This route is called when the user requests for a new password | email - string | For Safety reasons, whether the user inputs a wrong or correct email address they get a 200 status with a message - “If your email is registered you will receive a password reset code “ | status - 500 \n message - server error, try again |
| Verify Reset Password with Token | api/auth/verify-reset-code | This route is called when the user inputs the code they receive in their email in the UI | email - string - email address of the user \n  \n token - number - \n the code sent to the user email address | status - 200 \n message - “code verified successfully“ \n ==resetToken== | status - 400 \n message - “Email and code are required“ OR “Invalid or expired code ‘ \n  \n status - 500 \n message - “Server error, try again“ |
| Reset Password | api/auth/reset-password | This endpoint is called when the user finally inputs a new passwoed | ==resetToken==, - token received after verifying reset code, \n newPassword - password | status - 200, \n message - “Password reset successful“ | status - 400, \n message - “Reset token and new password are required“ OR “Invalid or expired reset token“ \n  \n status - 500 \n message - “Server error, try again” |
|    |    |    |    |    |    |


