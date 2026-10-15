/** Minimal next/link shim for node-side rendering of static pages. */
import { createElement } from "react";

export default function Link({ href, children, className, ...rest }: Record<string, unknown> & { href: string; children?: React.ReactNode }) {
  return createElement("a", { href, className, ...rest }, children);
}

export { Link };
