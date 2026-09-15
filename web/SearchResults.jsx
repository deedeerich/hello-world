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
