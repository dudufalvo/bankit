import * as yup from 'yup'

export const scheduletValidationSchema = yup.object({
  date: yup.string().required('date is required'),
  initial_time: yup.string().required('initial time is required'),
  end_time: yup.string().required('end time is required'),
})
