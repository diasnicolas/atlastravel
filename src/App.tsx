import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { AgencyData } from './types/agencia';
import { useAgencyData } from './data/useAgencyData';
import { visibleSections } from './lib/sections';
import type { SectionId } from './lib/sections';
import { useBrandTheme } from './hooks/useBrandTheme';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { Preloader } from './components/Preloader';
import { ErrorState } from './components/ErrorState';
import { SectionBoundary } from './components/SectionBoundary';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Search } from './components/Search';
import { Numbers } from './components/Numbers';
import { Team } from './components/Team';
import { Differentials } from './components/Differentials';
import { Services } from './components/Services';
import { Testimonials } from './components/Testimonials';
import { Gallery } from './components/Gallery';
import { AtlasClub } from './components/AtlasClub';
import { Faq } from './components/Faq';
import { CtaFinal } from './components/CtaFinal';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { BackToTop, WhatsAppFloat } from './components/Floating';

/** Página completa montada a partir dos dados da agência. */
function Site({ data }: { data: AgencyData }) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set());
  const visible = useMemo(() => visibleSections(data, failed), [data, failed]);
  const mainRef = useRef<HTMLElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);

  useBrandTheme(data.agencia?.identidade_visual);
  useDocumentMeta(data);
  useSmoothScroll(navbarRef, true);

  const onError = useCallback((id: string) => {
    setFailed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const section = (id: SectionId, node: ReactNode) =>
    visible.has(id) ? <SectionBoundary id={id} onError={onError}>{node}</SectionBoundary> : null;

  return (
    <>
      <SectionBoundary id="header" onError={onError}>
        <Header data={data} visible={visible} mainRef={mainRef} navbarRef={navbarRef} brandRef={brandRef} />
      </SectionBoundary>
      <main id="conteudo" tabIndex={-1} ref={mainRef}>
        {section('hero', <Hero data={data} visible={visible} />)}
        {section('hero-busca', <Search data={data} flat={!visible.has('hero')} />)}
        {section('sobre-numeros', <Numbers data={data} />)}
        {section('sobre-equipe', <Team data={data} />)}
        {section('diferenciais', <Differentials data={data} />)}
        {section('servicos', <Services data={data} />)}
        {section('depoimentos', <Testimonials data={data} />)}
        {section('galeria', <Gallery data={data} />)}
        {section('atlas-club', <AtlasClub data={data} />)}
        {section('faq', <Faq data={data} />)}
        {section('cta-final', <CtaFinal data={data} />)}
        {section('contato', <Contact data={data} />)}
      </main>
      {section('rodape', <Footer data={data} visible={visible} />)}
      <SectionBoundary id="flutuantes" onError={onError}>
        <WhatsAppFloat data={data} />
        <BackToTop focusRef={brandRef} />
      </SectionBoundary>
    </>
  );
}

export default function App() {
  const { state, retry } = useAgencyData();
  const reduced = usePrefersReducedMotion();

  // Animações de entrada só quando há suporte e o usuário não pediu menos movimento
  useLayoutEffect(() => {
    const root = document.documentElement;
    const enabled = !reduced && 'IntersectionObserver' in window;
    root.classList.toggle('reveal-on', enabled);
  }, [reduced]);

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Preloader done={state.status !== 'loading'} />
      {state.status === 'error' && (
        <main id="conteudo" tabIndex={-1}>
          <ErrorState message={state.error} onRetry={retry} />
        </main>
      )}
      {state.status === 'ready' && <Site data={state.data} />}
    </>
  );
}
