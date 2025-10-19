import * as React from 'react'

type RegisterFn = ReturnType<typeof import('react-hook-form').useForm>['register']

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  register: RegisterFn
  name: string
}

export default function NumericInput({ register, name, ...rest }: Props) {
  return (
    <input
      type="number"
      inputMode="decimal"
      {...register(name as any, {
        valueAsNumber: true,
        setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
      })}
      {...rest}
    />
  )
}

