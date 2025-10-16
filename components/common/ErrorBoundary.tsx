"use client"
import React from "react"

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; err?: any }>{
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(err: any) { return { hasError: true, err } }
  componentDidCatch(err: any, info: any) { console.error("Planner ErrorBoundary", err, info) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-red-600">
          <div className="font-semibold mb-1">Something went wrong.</div>
          <pre className="whitespace-pre-wrap text-xs text-red-700 opacity-80">
            {String(this.state.err?.message ?? this.state.err ?? "Unknown error")}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

