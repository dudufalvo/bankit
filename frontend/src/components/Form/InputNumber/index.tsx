import { useFormContext } from 'react-hook-form'
import styles from './inputnumber.module.scss'
import InputMain from '../InputMain'
import { BiErrorCircle } from 'react-icons/bi'

type InputNumberType = {
  id: string
  name: string
  label?: string
  type: 'number' | 'money'
  isRequired?: boolean
  valueDisabled?: boolean
}

const InputNumber = ({
  id,
  name,
  type,
  label,
  isRequired,
  valueDisabled
}: InputNumberType) => {
  const { register, formState: { errors } } = useFormContext()

  return (
    <InputMain label={label} name={name} id={name} isRequired={isRequired}>
      <div>
        <div className={`${styles.inlineInput} ${valueDisabled && styles.valueDisabled} ${errors[name] ? styles.errorInput : ''}`}>
          {type === 'money' && '€'}
          <input id={id} {...register(name)} type='number' step='0.1' placeholder='00.00' disabled={valueDisabled} />
        </div>
        {errors[name] && <BiErrorCircle className={styles.errorIcon} />}
      </div>
    </InputMain>
  )
}

export default InputNumber
