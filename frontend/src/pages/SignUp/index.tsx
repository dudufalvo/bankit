import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css'
import { registerValidationSchema } from 'src/schemas'

import type { MultiValue, SingleValue } from 'react-select'
import type { DropdownOptionType } from 'types/Component'
import type { SignUpType } from 'types/User'

import styles from './signup.module.scss'

import AuthTemplate from 'components/AuthTemplate'
import InputNumber from 'components/Form/InputNumber'
import InputPassword from 'components/Form/InputPassword'
import InputText from 'components/Form/InputText'
import SelectDropdown from 'components/SelectDropdown'
import toast from 'utils/toast'


const filters = [
  { label: 'Email', value: '1' },
  { label: 'Phone', value: '0' }
]


type SignUpRequestType = {
  first_name: string
  last_name: string
  email: string
  password: string
  password2?: string | undefined
  username: string
  phone_number: number
  preferred_contact_method_is_email?: boolean
}


const SignUp = () => {
  const navigate = useNavigate()

  const [selectedType, setSelectedType] = useState<DropdownOptionType>({ label: 'Email', value: '1' })

  const methods = useForm<SignUpType>({
    resolver: yupResolver(registerValidationSchema),
  })


  const signUpUser = async (data: SignUpType) => {
    const signUpData: SignUpRequestType = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      username: data.username,
      password: data.password,
      password2: data.password2,
      phone_number: data.phone_number,
      preferred_contact_method_is_email: Boolean(Number(selectedType.value))
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


  const handleSelectedType = (value: SingleValue<DropdownOptionType> | MultiValue<DropdownOptionType>) => {
      if (!value) return
      const filteredType = value as DropdownOptionType
  
      setSelectedType(filteredType)
    }


  return (
    <AuthTemplate type='sign-up' methods={methods} handleAuth={methods.handleSubmit(signUpUser)} >
      <form className={styles.signupContentMiddle}>
        <div className={styles.signupContentInputs}>
          <InputText type="text" id="first_name" name="first_name" placeholder="Enter your first name" label="First Name" isRequired={true} />
          <InputText type="text" id="last_name" name="last_name" placeholder="Enter your last name" label="Last Name" isRequired={true} />
          <InputText type="text" id="email" name="email" placeholder="Enter your e-mail" label="E-mail" isRequired={true} />
          <InputText id="username" name="username" placeholder="Enter your username" label="Username" isRequired={true} />
        </div>
        <div className={styles.signupContentInputs}>
          <InputNumber type="number" id="phone_number" name="phone_number" label="Phone Number" />
          <SelectDropdown type='select' sendOptionsToParent={handleSelectedType} defaultOption={selectedType} options={filters} label='Preferred Method of Contact' name='preferred_contact_method_is_email' />
          <InputPassword id="password" name="password" placeholder="Create a password" label="Password" isRequired={true} />
          <InputPassword id="password2" name="password2" placeholder="Confirm password" label="Confirm Password" isRequired={true} />
        </div>
      </form>
    </AuthTemplate>
  )
}

export default SignUp
