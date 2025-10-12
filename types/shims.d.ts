declare module 'vitest' {
  export const describe: any
  export const it: any
  export const expect: any
  export const beforeEach: any
  export const afterEach: any
}
declare module 'vitest/config' {
  export const defineConfig: any
}
declare module 'pdf-lib' {
  export const PDFDocument: any
  export const StandardFonts: any
}
declare module 'stripe' {
  export default class Stripe {
    constructor(apiKey: string, config?: any)
    webhooks: { constructEvent: (raw: string, sig: string, secret: string) => any }
    checkout: { sessions: { create: (args: any) => Promise<any> } }
  }
}
declare namespace Stripe {
  type Event = any
  namespace Checkout { type Session = any }
}
declare module 'zustand' {
  export type StateCreator<T> = (set: any, get: any) => T
  export interface UseBoundStore<T> {
    (): T
    <U>(selector: (state: T) => U): U
    getState: () => T
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
  }
  export function create<T>(init: StateCreator<T>): UseBoundStore<T>
}
