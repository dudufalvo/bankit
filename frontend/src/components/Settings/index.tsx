import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useUser } from 'src/contexts/userContext'
import { profileValidationSchema, privacyValidationSchema } from 'src/schemas'

import styles from './settings.module.scss'

import Button from 'components/Button'
import InputPassword from 'components/Form/InputPassword'
import InputText from 'components/Form/InputText'
import InputFile from 'components/InputFile'
import Separator from 'components/Separator'
import toast from 'utils/toast'

type ProfileFormType = {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

type PrivacyFormType = {
  current_password: string;
  password: string;
  confirm_password: string;
}

const Settings = () => {
  const { user, updateUserProfile } = useUser()

  const profileMethods = useForm<ProfileFormType>({
    resolver: yupResolver<ProfileFormType>(profileValidationSchema),
    defaultValues: user
  })

  useEffect(() => {
    profileMethods.reset(user)
  }, [user, profileMethods])

  const privacyMethods = useForm<PrivacyFormType>({
    resolver: yupResolver(privacyValidationSchema)
  })

  const handleProfileUpdate = (data: ProfileFormType) => {
    const updatedData = { 
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      username: data.username,
      is_manager: user.is_manager
    }

    updateUserProfile(updatedData)
  }

  const hanleUpdateUserPassword = (data: PrivacyFormType) => {
    axios.put(`${import.meta.env.VITE_API_BASE_URL}/client/update`, { data } ,{ headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(() => {
        toast.success('Password updated successfully')
      })
      .catch(() => {
        toast.error('Error updating password')
      })
  }

  return (
    <>
      <h2>My Profile</h2>
      <FormProvider {...profileMethods}>
        <form className={styles.settings}>
          <div className={styles.profileRight}>
            <InputText id='first_name' name='first_name' label='First Name' placeholder='Insert your first name' />
            <InputText id='last_name' name='last_name' label='Last Name' placeholder='Insert your last name' />
            <InputText id='username' name='username' label='Username' placeholder='Insert your username' />
            <InputText id='email' name='email' label='Email' placeholder='Insert your email' isDisabled />
            <Button type='submit' fullWidth handle={profileMethods.handleSubmit(handleProfileUpdate)}>Save</Button>
          </div>
          <div className={styles.profileLeft}>
            <InputFile label='Profile Photo' name='image' />
          </div>
        </form>
      </FormProvider>
      <Separator />
      <h2>Privacy</h2>
      <FormProvider {...privacyMethods}>
        <form className={styles.settings}>
          <InputPassword id='current_password' name='current_password' label='Current password' placeholder='Insert current password' />
          <InputPassword id='password' name='password' label='New Password' placeholder='Insert new password' />
          <InputPassword id='confirm_password' name='confirm_password' label='Confirm new password' placeholder='Confirm your new password' />
          <Button type='submit' fullWidth handle={privacyMethods.handleSubmit(hanleUpdateUserPassword)}>Save</Button>
        </form>
      </FormProvider>
    </>
  )
}

export default Settings
