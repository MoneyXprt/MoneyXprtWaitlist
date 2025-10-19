import * as React from 'react'

type RegisterFn = ReturnType<typeof import('react-hook-form').useForm>['register']

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> & {
  register: RegisterFn
  name: string
}

export default function NumericInput({ register, name, onBlur, onChange, ...rest }: Props) {
  const reg = register(name as any, {
    valueAsNumber: true,
    setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
  })

  return (
    <input
      type="number"
      inputMode="decimal"
      name={reg.name}
      ref={reg.ref}
      onChange={(e) => {
        reg.onChange(e)
        onChange?.(e)
      }}
      onBlur={(e) => {
        reg.onBlur(e)
        onBlur?.(e)
      }}
      {...rest}
    />
  )
}
