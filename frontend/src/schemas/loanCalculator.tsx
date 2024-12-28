import * as yup from 'yup'

export const loanCalculatorValidationSchema = yup.object().shape({
  amount: yup.number()
    .min(1000)
    .max(10000000)
    .required('loan amount required'),
  duration: yup.number()
    .min(1)
    .max(10000000)
    .required('loan duration/maturity required'),
  monthly_payment: yup.number()
    .min(1)
    .max(10000000)
    .required('loan monthly payment required')
})
