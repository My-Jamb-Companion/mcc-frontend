export interface TeacherRegistrationInputs {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  agree_to_terms: boolean;
  /** The one-time token from the sign-up form's human check; the server requires it once it has keys. */
  captcha_token?: string | null;
}
