import { Fragment } from 'react';

/** Renders plain text, turning `backticked` words into inline code. */
export function RichText({ text }: { text: string }) {
  const parts = text.split('`');
  return (
    <>
      {parts.map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}
