import * as yup from 'yup'

export const registerValidationSchema = yup.object().shape({
  first_name: yup.string().required('first name is required'),
  last_name: yup.string().required('last name is required'),
  email: yup.string()
    .required('email is required')
    .email('email is invalid'),
  password: yup.string()
    .required('password is required')
    .min(6, 'password must be at least 6 characters'),
  password2: yup.string()
    .required('password confirmation is required')
    .oneOf([yup.ref('password')], 'passwords must match'),
  username: yup.string().required('username is required'),
  phone_number: yup.number().required('phone number is required')
})
