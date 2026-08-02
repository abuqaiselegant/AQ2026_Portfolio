import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from './components'
import 'katex/dist/katex.min.css';

// The component map is assembled at runtime from MDX components with varying
// prop shapes, so the boundary is intentionally loose here.
type MDXComponent = React.ComponentType<{
  components?: Record<string, unknown>
}>

// Compiled MDX is evaluated once per unique code string and cached at module
// scope, so the component identity stays stable across renders.
const componentCache = new Map<string, MDXComponent>()

const getMDXComponent = (code: string): MDXComponent => {
  const cached = componentCache.get(code)
  if (cached) return cached

  const fn = new Function(code)
  const Component = fn({ ...runtime }).default as MDXComponent
  componentCache.set(code, Component)
  return Component
}

interface MDXProps {
  code: string
  components?: Record<string, React.ComponentType>
}

export const MDXContentRenderer = ({ code, components }: MDXProps) => {
  // Compiled MDX can only be evaluated at runtime, so the component cannot be
  // declared statically. The module-level cache above keeps its identity stable
  // for a given `code`, which is the state-resetting hazard this rule guards.
  const Component = getMDXComponent(code)
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={{ ...mdxComponents, ...components }} />
}