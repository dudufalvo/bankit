import AuthTemplate from "components/AuthTemplate"
import styles from './loancalculator.module.scss'
import InputText from "components/Form/InputText"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { loanCalculatorValidationSchema } from "src/schemas/loanCalculator"
import { yupResolver } from "@hookform/resolvers/yup"
import InputNumber from "components/Form/InputNumber"


export type LoanCalculatorType = {
  type: string
  amount: number
  duration: number
  monthly_payment: number
}


const LoanCalculator = () => {
  const navigate = useNavigate()

  const methods = useForm<LoanCalculatorType>({
    resolver: yupResolver(loanCalculatorValidationSchema)
  })

  const applyLoanValues = async (data: LoanCalculatorType) => {  }

  return (
    <AuthTemplate type='loan' methods={methods} handleAuth={methods.handleSubmit(applyLoanValues)} >
      <form className={styles.signupContentMiddle}>
        <InputText type="text" id="type" name="type" placeholder="Enter your first name" label="Type" isRequired={true} />
        <InputNumber id="amount" name="amount" label="Amount" isRequired={true} />
        <InputNumber id="duration" name="duration" label="Duration" isRequired={true} />
        <InputNumber id="monthly_payment" name="monthly_payment" label="Monthly Payment" isRequired={true} />
      </form>
    </AuthTemplate>
  )
}

export default LoanCalculator