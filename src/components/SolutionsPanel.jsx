import { SOLUTIONS } from '../data.js';
import { useLang } from '../lang.jsx';

export default function SolutionsPanel({ active, onOpenViewer }) {
  const { t } = useLang();

  return (
    <section className={'panel' + (active ? ' on' : '')} data-panel="solutions">
      <div className="intro">
        <h2 className="title">{t('sol_title')}</h2>
        <div className="intro-cols">
          <p className="lead">{t('sol_p1')}</p>
          <p className="lead">{t('sol_p2')}</p>
        </div>
      </div>

      <div className="cards" id="solCards">
        {SOLUTIONS.map((s) => (
          <article className="card" key={s.key}>
            <div className="plate">
              <img src={s.logo} alt={s.name} draggable="false" />
            </div>
            <p className="tag">{t(s.key + '_tag')}</p>
            <p className="desc">{t(s.key + '_desc')}</p>
            <div className="cbtns">
              {s.url && (
                <button
                  type="button"
                  className="btn btn-fill"
                  onClick={() =>
                    onOpenViewer(s.name, { client: s.url, embed: s.demo ? s.demo.embed : true }, 'client')
                  }
                >
                  {t('btn_visit')}
                </button>
              )}
              {s.demo && (
                <button
                  type="button"
                  className={s.url ? 'btn btn-ghost' : 'btn btn-fill'}
                  onClick={() =>
                    onOpenViewer(
                      s.name,
                      { admin: s.demo.admin, cred: s.demo.cred, embed: s.demo.embed },
                      'admin'
                    )
                  }
                >
                  {t('btn_demo')}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
