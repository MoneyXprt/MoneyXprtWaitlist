export type SParams = { [k: string]: string | string[] | undefined }
export const getStr = (sp: SParams, k: string, d = "") => {
  const v = sp[k]; return Array.isArray(v) ? v[0] ?? d : v ?? d
}

