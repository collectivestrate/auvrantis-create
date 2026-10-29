import { CopyCodeButton } from '@/components/learn-client';
import { RichText } from '@/components/rich-text';
import type { LessonStep } from '@/lib/learn-content';

/** Numbered lesson steps with code blocks and tips (used by Pro lessons). */
export function LessonSteps({ steps }: { steps: LessonStep[] }) {
  return (
    <ol className="lc-steps">
      {steps.map((step, index) => (
        <li className="lc-step" key={step.title}>
          <h2><span className="lc-step-num" aria-hidden="true">{index + 1}</span>{step.title}</h2>
          {step.text.map((paragraph) => <p key={paragraph}><RichText text={paragraph} /></p>)}
          {step.code ? (
            <figure className="lc-code">
              <figcaption>
                <span>{step.code.file}</span>
                <CopyCodeButton code={step.code.code} />
              </figcaption>
              <pre tabIndex={0} aria-label={`Code for step ${index + 1}: ${step.code.file}`}><code>{step.code.code}</code></pre>
            </figure>
          ) : null}
          {step.tip ? <p className="lc-tip"><strong>Tip</strong> <RichText text={step.tip} /></p> : null}
        </li>
      ))}
    </ol>
  );
}

export function LessonMistakes({ mistakes }: { mistakes: { problem: string; fix: string }[] }) {
  if (mistakes.length === 0) return null;
  return (
    <section className="lc-section" aria-labelledby="mistakes-title">
      <h2 id="mistakes-title">Common mistakes</h2>
      <dl className="lc-mistakes">
        {mistakes.map((mistake) => (
          <div key={mistake.problem}>
            <dt><RichText text={mistake.problem} /></dt>
            <dd><RichText text={mistake.fix} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
