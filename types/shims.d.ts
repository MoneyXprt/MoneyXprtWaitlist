declare module 'vitest' {
  export const describe: any
  export const it: any
  export const expect: any
}
declare module 'vitest/config' {
  export const defineConfig: any
}
declare module 'pdf-lib' {
  export const PDFDocument: any
  export const StandardFonts: any
}
declare module 'stripe' {
  const Stripe: any
  export default Stripe
}
declare module 'zustand' {
  export type StateCreator<T> = (set: any, get: any) => T
  export function create<T>(init: StateCreator<T>): {
    (): T
    <U>(selector: (state: T) => U): U
  }
}

