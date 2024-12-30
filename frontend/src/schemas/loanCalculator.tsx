import * as yup from 'yup'

export const loanCalculatorValidationSchema = yup.object().shape({
  amount: yup.number()
    .min(1000)
    .max(10000000),
  duration: yup.number()
    .min(0)
    .max(10000000),
  monthly_payment: yup.number()
    .min(0)
    .max(10000000),
  gross_monthly_income: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  liquid_monthly_income: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  household_income: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  fixed_monthly_expenses: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  savings_investments: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  existing_debt_obligations: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  number_current_loans: yup.number()
    .min(0)
    .max(10000000)
    .required(),
  number_of_dependents: yup.number()
    .min(0)
    .max(10000000)
    .required(),
})
