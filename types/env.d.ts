declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    SUPABASE_SERVICE_ROLE: string
    OPENAI_API_KEY: string
    MONEYXPRT_MODEL?: string
  }
}

