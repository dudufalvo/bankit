import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { scheduletValidationSchema } from 'src/schemas'

import type { ModalBaseType } from 'types/Component'

import styles from './schedulemodal.module.scss'

import InputText from 'components/Form/InputText'
import { ModalWrapper } from 'components/Modals'
import toast from 'utils/toast'


type ScheduleFormType = {
  date: string
  end_time: string
  initial_time: string
}

type ScheduleRequestType = ScheduleFormType & {
  loan_id: number
}

type ScheduleModalType = ModalBaseType & {
  loan_id: number
}


const ScheduleModal = ({ isOpen, loan_id, handleClosing }: ScheduleModalType) => {
  const navigate = useNavigate()

  const methods = useForm<ScheduleFormType>({
    resolver: yupResolver(scheduletValidationSchema)
  })

  const handleSchedule = (formData: ScheduleFormType) => {
    const data: ScheduleRequestType = {
      loan_id: loan_id,
      date: formData.date,
      end_time: formData.end_time,
      initial_time: formData.initial_time
    }

    axios.post(`${import.meta.env.VITE_API_BASE_URL}/manager/schedule-interview`, data, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' } })
    .then(() => {
      toast.success('Interview scheduled successfully')
      navigate('/')
    })
    .catch(() => {
      toast.error('Failed to schedule interview')
    })
  }

  return (
    <ModalWrapper title='Schedule Interview' isOpen={isOpen} submitTxt='Schedule' methods={methods} handleClosing={handleClosing} handleCreating={handleSchedule} >
      <FormProvider {...methods}>
        <form className={styles.scheduleModal}>
          <InputText type="text" id="date" name="date" placeholder="Enter the interview date (2024-12-30)" label="Date" isRequired={true} />
          <InputText type="text" id="initial_time" name="initial_time" placeholder="Enter the interview initial time" label="Initial Time" isRequired={true} />
          <InputText type="text" id="end_time" name="end_time" placeholder="Enter the interview end time" label="End Time" isRequired={true} />
        </form>
      </FormProvider>
    </ModalWrapper >
  )
}

export default ScheduleModal
