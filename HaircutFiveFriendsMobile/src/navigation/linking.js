// Config de deep linking de React Navigation.
// haircutfivefriends://reset-password?token=XXXX  ->  screen ResetPassword (token en params)
// haircutfivefriends://verify-email?token=XXXX    ->  screen VerifyEmail (token en params)
export const linking = {
  prefixes: ['haircutfivefriends://'],
  config: {
    screens: {
      Welcome: 'welcome',
      Login: 'login',
      Register: 'register',
      VerifyEmail: 'verify-email',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
    },
  },
};
