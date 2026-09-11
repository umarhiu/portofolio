/** Only shown when the pre-paint bootstrap opts into the first-load intro. */
export function GreetingPreloader() {
  return <div className="greeting-preloader" data-greeting-preloader aria-hidden="true">
    <div className="greeting-preloader__label"><span data-greeting-word lang="en">Hello</span></div>
    <svg className="greeting-preloader__curve" viewBox="0 0 1000 160" preserveAspectRatio="none">
      <path data-greeting-curve d="M0 0 H1000 V0 Q500 280 0 0 Z" />
    </svg>
  </div>;
}
