"use client";

import React from "react";
import { showError } from "../../lib/toast";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary:", error);
    showError("Something went wrong");
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4">Something broke. Please refresh.</div>;
    }

    return this.props.children;
  }
}