/* PLANTED DEFECTS -- see FIXTURE.md. Expected: semgrep p/xss, CodeQL js/xss (taint tracking). */
import React from 'react';

/* ── HOW YOU TELL WHETHER JSX IS PARAMETRISED ─────────────────────────────────────────
 *
 * JSX escapes by DEFAULT. `{value}` inserts a text node -- the browser never parses it as
 * markup, so `<img onerror=alert(1)>` arrives as those literal characters. That is
 * parametrisation, and it is the reason most React code is not XSS-vulnerable by accident.
 *
 * There are exactly three ways to leave that default, and they are what a reviewer and a
 * scanner both look for:
 *
 *   1. dangerouslySetInnerHTML   -- named to be greppable. It is raw HTML injection.
 *   2. a raw DOM escape hatch    -- ref + .innerHTML / insertAdjacentHTML / document.write
 *   3. a URL-position sink       -- href/src taking `javascript:`; attribute position, not text
 *
 * So "is it parametrised" is not answered by reading the JSX -- it is answered by asking
 * whether untrusted data REACHES one of those three sinks. That is a dataflow question, which
 * is why CodeQL taint tracking earns its runtime here and grep does not: the source and the
 * sink are usually in different files.
 *
 * NOTE the boundary this fixture proves: escaping is about INJECTION. It is not about SQL
 * parametrisation, and it is not authorisation. Three different controls.
 */

export function Safe({ query }) {
  // PARAMETRISED. React escapes it. Untrusted `query` is text, never markup.
  return <p>Results for {query}</p>;
}

export function Unsafe({ query }) {
  // DEFECT 3: the escape hatch, fed straight from untrusted input.
  return <p dangerouslySetInnerHTML={{ __html: 'Results for ' + query }} />;
}

export function UnsafeLink({ userSuppliedUrl }) {
  // DEFECT 4: attribute position. Escaping does nothing here -- `javascript:alert(1)` is a
  // perfectly well-formed URL. The control is an allowlist of schemes, not encoding.
  return <a href={userSuppliedUrl}>continue</a>;
}

export function UnsafeRef({ query }) {
  // DEFECT 5: raw DOM sink reached through a ref, which is the version grep misses.
  const el = React.useRef(null);
  React.useEffect(() => {
    if (el.current) el.current.innerHTML = query;
  }, [query]);
  return <div ref={el} />;
}

/* ── WHY THE FIRST VERSION OF THIS FILE PROVED NOTHING ────────────────────────────────
 *
 * Everything above takes `query` as a PROP. Semgrep flagged those on pattern alone, and CodeQL
 * reported ZERO results over all of them -- correctly. Taint tracking needs a SOURCE it is
 * documented to recognise as attacker-controlled, and a React prop is not one: nothing in this
 * file told the engine where `query` came from, so there was no flow to track. A sink with no
 * source is not a dataflow test, it is a pattern test with extra steps.
 *
 * That is the difference between an acceptance test and a vibe. `EXPECTED_FINDINGS.md` must map a
 * planted defect to a QUERY DOCUMENTED TO DETECT IT -- here `js/xss` and `js/client-side-unvalidated-
 * url-redirection`, whose source set includes `window.location` and `document.URL`.
 *
 * So these read from a real source. If CodeQL still reports zero on THESE, the finding is about
 * CodeQL or its configuration rather than about the fixture.
 */

export function TaintedFromLocation() {
  // SOURCE: window.location.search is in CodeQL's documented remote-flow source set.
  // SINK:   innerHTML. Source and sink in separate statements, which is the whole point.
  const params = new URLSearchParams(window.location.search);
  const term = params.get('q');
  const el = React.useRef(null);
  React.useEffect(() => {
    if (el.current) el.current.innerHTML = '<b>' + term + '</b>';   // js/xss
  }, [term]);
  return <div ref={el} />;
}

export function TaintedRedirect() {
  // SOURCE: document.location.hash  ->  SINK: assignment to window.location.
  const next = document.location.hash.slice(1);
  React.useEffect(() => {
    window.location = next;   // js/client-side-unvalidated-url-redirection
  }, [next]);
  return null;
}

export function TaintedDangerous() {
  // SOURCE: location.search  ->  SINK: dangerouslySetInnerHTML, one hop apart.
  const raw = new URLSearchParams(location.search).get('html');
  return <div dangerouslySetInnerHTML={{ __html: raw }} />;   // js/xss
}
