import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { id: string; onError: (id: string) => void; children: ReactNode }
interface State { failed: boolean }

/** Isola falhas de uma seção (dados inesperados): a seção some e o resto da página continua. */
export class SectionBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.warn(`[site] falha ao montar a seção "${this.props.id}":`, error);
    this.props.onError(this.props.id);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
