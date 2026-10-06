import { useLang } from '../lang.jsx';

const PILLARS = [
  ['sv1_t', 'sv1'],
  ['sv2_t', 'sv2'],
  ['sv3_t', 'sv3']
];

export default function ServicesPanel({ active }) {
  const { t } = useLang();

  return (
    <section className={'panel' + (active ? ' on' : '')} data-panel="services">
      <h2 className="title">{t('services_title')}</h2>
      <div className="pillars">
        {PILLARS.map(([titleKey, bodyKey]) => (
          <div className="pillar" key={titleKey}>
            <h3>{t(titleKey)}</h3>
            <p>{t(bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
