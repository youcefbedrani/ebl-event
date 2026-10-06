import { SITES } from '../data.js';
import { useLang } from '../lang.jsx';

export default function SitesPanel({ active, onOpenViewer }) {
  const { t } = useLang();

  return (
    <section className={'panel' + (active ? ' on' : '')} data-panel="sites">
      <h2 className="title">{t('sites_title')}</h2>
      <p className="lead">{t('sites_sub')}</p>

      <div className="rows" id="siteRows">
        {SITES.map((s) => (
          <div className="row" key={s.id}>
            <div className="rtxt">
              <h3>{s.name}</h3>
              <p className="host">{s.host}</p>
            </div>
            <div className="acts">
              <button
                type="button"
                className="btn btn-fill"
                onClick={() =>
                  onOpenViewer(
                    s.name,
                    { client: s.client, admin: s.admin, cred: s.cred, embed: s.embed },
                    'client'
                  )
                }
              >
                {t('btn_client')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  onOpenViewer(
                    s.name,
                    { client: s.client, admin: s.admin, cred: s.cred, embed: s.embed },
                    'admin'
                  )
                }
              >
                {t('btn_admin')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
