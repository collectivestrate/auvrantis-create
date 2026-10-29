import Link from 'next/link';

/** The two existing plans, shown wherever someone can unlock Pro. */
export function ProPlans({ cta = 'Get started', href = '/learn/account' }: { cta?: string; href?: string }) {
  return (
    <div className="mk-plans lc-pro-plans">
      <article className="mk-plan">
        <h3>Starter</h3>
        <p className="mk-plan-sub">For your first website.</p>
        <p className="mk-price">$5.99<span> / month</span></p>
        <ul>
          <li>All Learning Center Pro courses</li>
          <li>Limited Studio creations</li>
          <li>All 12 designs</li>
        </ul>
        <Link className="mk-btn" href={`${href}?plan=starter`}>{cta}</Link>
      </article>
      <article className="mk-plan mk-plan-dark">
        <h3>Unlimited</h3>
        <p className="mk-plan-sub">For everything you want to make.</p>
        <p className="mk-price">$15.99<span> / month</span></p>
        <ul>
          <li>All Learning Center Pro courses</li>
          <li>Unlimited Studio creations</li>
          <li>New designs, courses and tools as they launch</li>
        </ul>
        <Link className="mk-btn" href={`${href}?plan=unlimited`}>{cta}</Link>
      </article>
    </div>
  );
}
