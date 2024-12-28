import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import { registerValidationSchema } from 'src/schemas'

import type { SignUpType } from 'types/User'

import styles from './signup.module.scss'

import AuthTemplate from 'components/AuthTemplate'
import InputPassword from 'components/Form/InputPassword'
import InputText from 'components/Form/InputText'
import toast from 'utils/toast'


type SignUpRequestType = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2?: string | undefined;
  username: string;
}

const SignUp = () => {
  const navigate = useNavigate()

  const methods = useForm<SignUpType>({
    resolver: yupResolver(registerValidationSchema)
  })

  const signUpUser = async (data: SignUpType) => {
    const signUpData: SignUpRequestType = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      username: data.username,
      password: data.password,
      password2: data.password2
    }

    axios.post(`${import.meta.env.VITE_API_BASE_URL}/client/register`, signUpData, { headers: { 'Content-Type': 'application/json' } })
      .then(response => {
        localStorage.setItem('token', response.data.access)
        toast.success('Signed up successfully')
        navigate('/')
      })
      .catch(() => {
        toast.error('Failed to sign up')
      })
  }

  return (
    <AuthTemplate type='sign-up' methods={methods} handleAuth={methods.handleSubmit(signUpUser)} >
      <form className={styles.signupContentMiddle}>
        <div className={styles.signupContentInputs}>
          <InputText type="text" id="first_name" name="first_name" placeholder="Enter your first name" label="First Name" isRequired={true} />
          <InputText type="text" id="last_name" name="last_name" placeholder="Enter your last name" label="Last Name" isRequired={true} />
          <InputText type="text" id="email" name="email" placeholder="Enter your e-mail" label="E-mail" isRequired={true} />
        </div>
        <div className={styles.signupContentInputs}>
          <InputText id="username" name="username" placeholder="Enter your username" label="Username" isRequired={true} />
          <InputPassword id="password" name="password" placeholder="Create a password" label="Password" isRequired={true} />
          <InputPassword id="password2" name="password2" placeholder="Confirm password" label="Confirm Password" isRequired={true} />
        </div>
      </form>
    </AuthTemplate>
  )
}

export default SignUp
