
import type { ReactNode } from 'react'
import type { ToastTransition } from 'react-toastify'
import type { ToastIcon } from 'react-toastify/dist/types'

export type ButtonType = {
  children?: ReactNode,
  type?: 'button' | 'submit' | 'reset',
  handle?: () => void,
  disabled?: boolean,
  fullWidth?: boolean,
  variant?: 'filled' | 'outlined' | 'google' | 'iconOutlined' | 'iconFilled' | 'onlyIcon' | 'red' | 'blue',
  icon?: ReactNode,
  iconPosition?: 'left' | 'middle' | 'right',
  isActive?: boolean
}

export type TabType = {
  children: ReactNode,
  handle?: () => void,
  title: string
}

export type ToastType = {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  autoClose?: number | false,
  hideProgressBar?: boolean,
  closeOnClick?: boolean,
  pauseOnHover?: boolean,
  draggable?: boolean,
  progress?: undefined | number | string,
  closeButton?: boolean,
  theme?: 'dark' | 'light' | 'colored',
  icon?: ToastIcon,
  pauseOnFocusLoss?: boolean,
  delay?: number,
  type?: 'default' | 'success' | 'info' | 'warning' | 'error',
  transition?: ToastTransition
}

export type DropdownOptionType = {
  value: string,
  image?: string | React.ReactNode,
  label: string,
  id?: number,
  handle?: () => void
}

export type ModalBaseType = {
  isOpen: boolean,
  handleClosing: () => void
}

export type DropdownItemType = {
  data: DropdownOptionType,
  dropdownType?: 'search' | 'select',
  isSelected?: boolean,
  isMulti?: boolean
}

export type RequestType<T> = {
  data: { [key: string]: T[] }
}
