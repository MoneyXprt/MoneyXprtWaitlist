"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";

export type SearchParamsObject = Record<string, string>;

export default function WithSearchParams(props: {
  children: (params: SearchParamsObject) => React.ReactNode;
}) {
  const sp = useSearchParams();
  const params: SearchParamsObject = {};
  sp.forEach((v, k) => { params[k] = v; });
  return <>{props.children(params)}</>;
}

