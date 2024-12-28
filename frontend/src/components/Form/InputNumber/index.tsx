import { useFormContext } from 'react-hook-form'
import { BiErrorCircle } from 'react-icons/bi'

import InputMain from '../InputMain'

import styles from './inputnumber.module.scss'

type InputNumberType = {
  id: string
  name: string
  value?: number
  label?: string
  isRequired?: boolean
  valueDisabled?: boolean
  type: 'number' | 'money'
}

const InputNumber = ({
  id,
  name,
  type,
  label,
  value,
  isRequired,
  valueDisabled
}: InputNumberType) => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <InputMain label={label} name={name} id={name} isRequired={isRequired}>
        <div className={`${styles.inlineInput} ${valueDisabled && styles.valueDisabled} ${errors[name] ? styles.errorInput : ''}`}>
          {type === 'money' && '€'}
          <input id={id} {...register(name)} type='number' step='1' placeholder='0' defaultValue={0} value={value} disabled={valueDisabled} />
          {errors[name] && <BiErrorCircle className={styles.errorIcon} />}
        </div>
    </InputMain>
  )
}

export default InputNumber
