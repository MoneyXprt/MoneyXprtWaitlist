"use client"
import React from 'react'

export default class ErrorBoundary extends React.Component<{children: React.ReactNode, label?: string},{error?: Error}> {
  state = { error: undefined as Error | undefined }
  static getDerivedStateFromError(error: Error){ return { error } }
  componentDidCatch(err: Error){ console.error("ErrorBoundary", this.props.label || "page", err) }
  render(){
    if(this.state.error){
      return <div className="p-6 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
        <div className="font-medium">Something went wrong{this.props.label?` in ${this.props.label}`:''}.</div>
        <div className="mt-1 opacity-80">{this.state.error.message}</div>
      </div>
    }
    return this.props.children as any
  }
}

