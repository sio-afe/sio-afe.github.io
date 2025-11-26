import React from 'react';

const policyLinks = [
  { label: 'Terms of Participation', href: '/muqawamah/terms-and-conditions/' },
  { label: 'Privacy Policy', href: '/muqawamah/privacy-policy/' },
  { label: 'Refund Policy', href: '/muqawamah/refund-policy/' },
  { label: 'About Us', href: '/muqawamah/about/' },
  { label: 'Contact Us', href: '/muqawamah/contact/' }
];

export default function Footer({ sponsors = [], edition = '2026' }) {
  const rows = sponsors.length > 0 ? [sponsors.slice(0, 5), sponsors.slice(5)] : [];
  const editionLabel = edition === '2026' ? 'Muqawama 2026' : 'Muqawama 2025';

  return (
    <section id="footer" className="footer-showcase">
      {rows.length > 0 && (
        <>
          <p className="sponsors-eyebrow">Partners  •  Supporters  •  Community</p>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="sponsor-row">
              {row.map((sponsor) => (
                <div key={sponsor.name} className="sponsor-logo">
                  <img src={sponsor.image} alt={sponsor.name} />
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      <div className="sponsors-brand-lockup">
        <span className="brand-label">Presented by</span>
        <img src="/assets/img/title_invert.png" alt="Muqawama" className="footer-title-logo" />
        <p>
          <a href="/muqawamah/2026/" className="footer-edition-link">
            {editionLabel}
          </a>
        </p>
      </div>

      <div className="footer-policy-links">
        {policyLinks.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}

