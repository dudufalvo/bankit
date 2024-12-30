import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loanCalculatorValidationSchema } from 'src/schemas/loanCalculator'

import type { MultiValue, SingleValue } from 'react-select'
import type { DropdownOptionType } from 'types/Component'

import styles from './loancalculator.module.scss'

import AuthTemplate from 'components/AuthTemplate'
import Button from 'components/Button'
import InputNumber from 'components/Form/InputNumber'
import InputText from 'components/Form/InputText'
import SelectDropdown from 'components/SelectDropdown'
import WebCamModal from 'components/WebCam'
import toast from 'utils/toast'


export type LoanCalculatorType = {
  amount?: number
  duration?: number
  interest_rate?: number
  household_income: number
  monthly_payment?: number
  savings_investments: number
  gross_monthly_income: number
  number_current_loans: number
  number_of_dependents: number
  liquid_monthly_income: number
  fixed_monthly_expenses: number
  existing_debt_obligations: number
}

export type LoanCalculatorRequest = LoanCalculatorType & {
  user: string
}


const filtersVariables = [
  { label: 'Amount + Duration', value: '1' },
  { label: 'Duration + Monthly Payment', value: '2' },
  { label: 'Monthly Payment + Amount', value: '3' }
]

const filtersTypes = [
  { label: 'Personal Loan', value: '10' },
  { label: 'Mortgage Loan', value: '5' },
  { label: 'Automotive Loan', value: '7' },
  { label: 'Business Loan', value: '8' }
]


const LoanCalculator = () => {
  const navigate = useNavigate()

  const [image, setImage] = useState<File>()
  const [user, setUser] = useState<string>()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [openWebCam, setOpenWebCam] = useState<boolean>(false)
  const [selectedType, setSelectedType] = useState<DropdownOptionType>({ label: 'Personal Loan', value: '10' })
  const [selectedVariable, setSelectedVariable] = useState<DropdownOptionType>({ label: 'Amount + Duration', value: '1' })

  const methods = useForm<LoanCalculatorType>({
    resolver: yupResolver(loanCalculatorValidationSchema),
    defaultValues: {
      duration: 1,
      amount: 10000,
      monthly_payment: 10000,
    }
  })

  const applyLoanValues = async (loanData: LoanCalculatorType) => {
    const data: LoanCalculatorRequest = {
      user: user as string,
      amount: loanData.amount,
      duration: loanData.duration,
      monthly_payment: loanData.monthly_payment,
      interest_rate: Number(selectedType.value),
      household_income: loanData.household_income,
      savings_investments: loanData.savings_investments,
      number_current_loans: loanData.number_current_loans,
      number_of_dependents: loanData.number_of_dependents,
      gross_monthly_income: loanData.gross_monthly_income,
      liquid_monthly_income: loanData.liquid_monthly_income,
      fixed_monthly_expenses: loanData.fixed_monthly_expenses,
      existing_debt_obligations: loanData.existing_debt_obligations,
    }

    if (!user) {
      toast.error('You must authenticate before the request!')
      return
    }

    axios.post(`${import.meta.env.VITE_API_BASE_URL}/create-loan-request`, { ...data })
      .then(() => {
        toast.success('Loan requested sucessfully!')
        navigate('/')
      })
      .catch(() => {
        toast.error('Failed to authenticate!')
      })
  }


  const handleSelectedVariable = (value: SingleValue<DropdownOptionType> | MultiValue<DropdownOptionType>) => {
    if (!value) return
    const filteredVariable = value as DropdownOptionType

    setSelectedVariable(filteredVariable)
  }


  const handleSelectedType = (value: SingleValue<DropdownOptionType> | MultiValue<DropdownOptionType>) => {
    if (!value) return
    const filteredType = value as DropdownOptionType

    setSelectedType(filteredType)
  }

  const roundToTwoDecimalPlaces = (num: number) => Math.round(num * 100) / 100

  const { setValue, watch } = methods

  const [amount, duration, monthly_payment] = watch(['amount', 'duration', 'monthly_payment'])


  useEffect(() => {
    if (selectedVariable.value === '1') {
      if (amount && duration) {
        setValue('monthly_payment', roundToTwoDecimalPlaces((amount * (1 + Number(selectedType.value) / 100)) / duration))
      }
    } else if (selectedVariable.value === '2') {
      if (duration && monthly_payment) {
        setValue('amount', roundToTwoDecimalPlaces(monthly_payment * duration * (1 + Number(selectedType.value) / 100)))
      }
    } else if (selectedVariable.value === '3') {
      if (amount && monthly_payment) {
        setValue('duration', roundToTwoDecimalPlaces(amount / (monthly_payment * (1 + Number(selectedType.value) / 100))))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, duration, monthly_payment, selectedType.value])

  useEffect(() => {
    if (!image) return

    const formData = new FormData()
    formData.append('image', image)

    axios.post(`${import.meta.env.VITE_API_BASE_URL}/facial-authentication`, { image }, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(response => {
        setUser(response.data.email)
        toast.success('Authenticated sucessfully!')
      })
      .catch(() => {
        toast.error('Failed to authenticate!')
      })
  }, [image])

  return (
    <AuthTemplate type='request-loan' methods={methods} handleAuth={methods.handleSubmit(applyLoanValues)} >
      { currentStep === 1 && (
      <form className={styles.loanCalculator}>
        <SelectDropdown type='select' sendOptionsToParent={handleSelectedType} defaultOption={selectedType} options={filtersTypes} label='Type' name='type' />
        <InputText id="rate" name="rate" label="Base Interest Rate" isRequired={true} isDisabled placeholder={`${selectedType.value}%`} />
        <SelectDropdown type='select' sendOptionsToParent={handleSelectedVariable} defaultOption={selectedVariable} options={filtersVariables} label='Variable' name='variable' />
        <InputNumber type="money" id="amount" name="amount" label="Amount" isRequired={true} value={amount} valueDisabled={selectedVariable.value === '2'} />
        <InputNumber type="number" id="duration" name="duration" label="Duration" isRequired={true} value={duration} valueDisabled={selectedVariable.value === '3'}  />
        <InputNumber type="number" id="monthly_payment" name="monthly_payment" label="Monthly Payment" value={monthly_payment} valueDisabled={selectedVariable.value === '1'} isRequired={true} />
        <Button fullWidth handle={() => setCurrentStep(2)}>Next</Button>
      </form>
      )}
      { currentStep === 2 && (
        <form className={styles.loanCalculator}>
          <Button fullWidth handle={() => setOpenWebCam(true)}>Authenticate</Button>
          <span>{`USER: ${user || 'need authentication'}`}</span>
          <div className={styles.loanCalculatorMiddle}>
            <div className={styles.loanCalculator}>
              <InputNumber type="money" id="gross_monthly_income" name="gross_monthly_income" label="Gross Monthly Income" />
              <InputNumber type="money" id="liquid_monthly_income" name="liquid_monthly_income" label="Liquid Monthly Income" />
              <InputNumber type="money" id="household_income" name="household_income" label="Household Income" />
              <InputNumber type="money" id="fixed_monthly_expenses" name="fixed_monthly_expenses" label="Fixed Monthly Expenses" />
            </div>
            <div className={styles.loanCalculator}>
              <InputNumber type="money" id="savings_investments" name="savings_investments" label="Savings and Investments" />
              <InputNumber type="money" id="existing_debt_obligations" name="existing_debt_obligations" label="Existing Debt Obligations" />
              <InputNumber type="number" id="number_current_loans" name="number_current_loans" label="Number of Current Loans" />
              <InputNumber type="number" id="number_of_dependents" name="number_of_dependents" label="Number of Dependents" />
            </div>
          </div>
          <Button fullWidth handle={() => setCurrentStep(1)}>Back</Button>
        </form>
      )}
      {openWebCam ? <WebCamModal close={() => setOpenWebCam(false)} onCapture={setImage} /> : null}
    </AuthTemplate>
  )
}

export default LoanCalculator
