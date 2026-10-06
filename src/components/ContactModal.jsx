import { useEffect, useState } from 'react';
import { useLang } from '../lang.jsx';

const API_URL =
  'https://script.google.com/macros/s/AKfycbzzP8TxqgnxdRMQ_x3evcrHEbsDDxCI_pIbJqTOrQASTCprRAeVi7TGtZMAfVdFrm-y/exec';

const SERVICES = [
  ['SOLUTION WEB', 's_web'],
  ['APPLICATION MOBILE', 's_mobile'],
  ['ERP & CRM', 's_erp'],
  ['SOLUTION AUGMENTÉE PAR INTELLIGENCE ARTIFICIELLE', 's_ai'],
  ['HÉBERGEMENT WEB & SOLUTIONS E-MAIL', 's_host'],
  ['MARKETING DIGITAL & COMMUNICATION', 's_mkt'],
  ['ÉTUDE DE MARCHÉ', 's_study'],
  ['E-COMMERCE & ADS', 's_ecom']
];

const EMPTY = { name: '', phone: '', email: '', service: '', website: '' };

export default function ContactModal({ open, onClose, resetToken }) {
  const { t } = useLang();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ msg: '', cls: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setValues(EMPTY);
    setErrors({});
    setStatus({ msg: '', cls: '' });
  }, [resetToken]);

  const field = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  function submit(e) {
    e.preventDefault();
    const d = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      service: values.service,
      website: values.website
    };
    const bad = {
      name: d.name.length < 2,
      phone: !/^[0-9+\s().-]{8,20}$/.test(d.phone),
      email: !!d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email),
      service: !d.service
    };
    setErrors(bad);
    if (bad.name || bad.phone || bad.email || bad.service) {
      setStatus({ msg: t('err_fields'), cls: 'err' });
      return;
    }
    setSending(true);
    setStatus({ msg: t('sending'), cls: '' });
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(d)
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          setValues(EMPTY);
          setStatus({ msg: t('ok'), cls: 'ok' });
          setTimeout(() => {
            onClose();
            setStatus({ msg: '', cls: '' });
          }, 3500);
        } else {
          setStatus({ msg: t('err_send'), cls: 'err' });
        }
      })
      .catch(() => setStatus({ msg: t('err_net'), cls: 'err' }))
      .then(() => setSending(false));
  }

  return (
    <div
      className={'modal' + (open ? ' on' : '')}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="contactTitle">
        <div className="sheet-head">
          <h2 id="contactTitle">{t('contact_btn')}</h2>
          <button type="button" className="icon-btn" aria-label="Fermer" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form className="lead-form" noValidate onSubmit={submit}>
          <div className={'field' + (errors.name ? ' invalid' : '')}>
            <label htmlFor="name">
              {t('f_name')} <span className="z2">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              maxLength="100"
              placeholder={t('f_name_ph')}
              value={values.name}
              onChange={field('name')}
            />
          </div>

          <div className={'field' + (errors.phone ? ' invalid' : '')}>
            <label htmlFor="phone">
              {t('f_phone')} <span className="z2">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="05 / 06 / 07 XX XX XX XX"
              value={values.phone}
              onChange={field('phone')}
            />
          </div>

          <div className={'field' + (errors.email ? ' invalid' : '')}>
            <label htmlFor="email">
              {t('f_email')} <small>{t('f_optional')}</small>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={values.email}
              onChange={field('email')}
            />
          </div>

          <div className={'field' + (errors.service ? ' invalid' : '')}>
            <label htmlFor="service">
              {t('f_service')} <span className="z2">*</span>
            </label>
            <select id="service" name="service" value={values.service} onChange={field('service')}>
              <option value="" disabled>
                {t('f_service_ph')}
              </option>
              {SERVICES.map(([value, key]) => (
                <option value={value} key={value}>
                  {t(key)}
                </option>
              ))}
            </select>
          </div>

          <input
            className="hp"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={values.website}
            onChange={field('website')}
          />

          <button type="submit" className="btn submit-btn" disabled={sending}>
            {t('f_send')}
          </button>
          <div className={'form-status ' + status.cls} role="status" aria-live="polite">
            {status.msg}
          </div>
        </form>
      </div>
    </div>
  );
}
