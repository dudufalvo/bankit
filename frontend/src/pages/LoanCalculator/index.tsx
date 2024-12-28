import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loanCalculatorValidationSchema } from 'src/schemas/loanCalculator'

import type { MultiValue, SingleValue } from 'react-select'
import type { DropdownOptionType } from 'types/Component'

import styles from './loancalculator.module.scss'

import AuthTemplate from 'components/AuthTemplate'
import InputNumber from 'components/Form/InputNumber'
import InputText from 'components/Form/InputText'
import SelectDropdown from 'components/SelectDropdown'


export type LoanCalculatorType = {
  amount: number
  duration: number
  monthly_payment: number
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

  const [selectedVariable, setSelectedVariable] = useState<DropdownOptionType>({ label: 'Amount + Duration', value: '1' })
  const [selectedType, setSelectedType] = useState<DropdownOptionType>({ label: 'Personal Loan', value: '10' })

  const methods = useForm<LoanCalculatorType>({
    resolver: yupResolver(loanCalculatorValidationSchema)
  })

  const applyLoanValues = async (data: LoanCalculatorType) => {
    // const loanData: LoanCalculatorType = {
    //   amount: data.amount,
    //   duration: data.duration,
    //   monthly_payment: data.monthly_payment
    // }
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


  return (
    <AuthTemplate type='loan' methods={methods} handleAuth={methods.handleSubmit(applyLoanValues)} >
      <form className={styles.loanCalculator}>
        <SelectDropdown type='select' sendOptionsToParent={handleSelectedType} defaultOption={selectedType} options={filtersTypes} label='Type' name='type' />
        <InputText id="rate" name="rate" label="Base Interest Rate" isRequired={true} isDisabled placeholder={`${selectedType.value}%`} />
        <SelectDropdown type='select' sendOptionsToParent={handleSelectedVariable} defaultOption={selectedVariable} options={filtersVariables} label='Variable' name='variable' />
        <InputNumber type="money" id="amount" name="amount" label="Amount" isRequired={true} valueDisabled={selectedVariable.value === '2'} />
        <InputNumber type="number" id="duration" name="duration" label="Duration" isRequired={true} valueDisabled={selectedVariable.value === '3'}  />
        <InputNumber type="number" id="monthly_payment" name="monthly_payment" label="Monthly Payment" isRequired={true} valueDisabled={selectedVariable.value === '1'} />
      </form>
    </AuthTemplate>
  )
}

export default LoanCalculator
