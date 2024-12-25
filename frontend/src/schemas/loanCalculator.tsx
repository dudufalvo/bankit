import * as yup from 'yup'

export const loanCalculatorValidationSchema = yup.object().shape({
  type: yup.string().required('Loan type is required'),
  amount: yup.number()
    .min(1000)
    .max(10000000)
    .required('Loan amount required'),
  duration: yup.number()
    .min(1)
    .max(10000000)
    .required('Loan duration/maturity required'),
  monthly_payment: yup.number()
    .min(1)
    .max(10000000)
    .required('Loan monthly payment required')
})
