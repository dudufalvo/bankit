export type SignUpType = {
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  password2: string,
  username: string,
  phone_number: number
}

export type RecoverPasswordType = {
  email: string
}

export type ResetPasswordType = {
  password: string
}

export type ResetPasswordRequestType = {
  password: string,
  reset_token: string
}

export type SignInType = {
  username: string,
  password: string,
  rememberMe: boolean,
}
