Auth0 Setup
- Create an API application in Auth0
- Authorize it in Auth0 Management API and add *:user, read:roles and *:client_grant permissions
- Create a Role with name as 'ADMIN' (can be changed via .env)
- Create an admin user with the said role. Any user with this role will be an admin
- Disable user Sign-Up

https://auth0.com/docs/customize/email/send-email-invitations-for-application-signup
