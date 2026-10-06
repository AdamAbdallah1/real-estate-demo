import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa'
import { useI18n } from '../i18n'
import { resolveText } from '../i18n/translations'

const scrollTo = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Footer({ contact, social }) {
  const { t, lang } = useI18n()
  const address = resolveText(contact?.address, lang) || t('footer.defaultAddress')
  const whatsapp = String(contact?.whatsapp || '9611000000').replace(/[^0-9]/g, '')
  const email = contact?.email || 'hello@nara.example'
  const links = [
    social?.instagram ? { label: 'Instagram', href: social.instagram, Icon: FaInstagram } : null,
    social?.facebook ? { label: 'Facebook', href: social.facebook, Icon: FaFacebook } : null,
    social?.linkedin ? { label: 'LinkedIn', href: social.linkedin, Icon: FaLinkedin } : null,
  ].filter(Boolean)

  return (
    <footer className="bg-ink text-ivory/80">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <p lang="en" className="font-serif text-xl tracking-[0.22em] text-ivory">{t('brand.name')}</p>
            <p className="text-[9px] tracking-[0.5em] text-ivory/50">{t('brand.sub')}</p>
            <p className="mt-6 text-[13px]">{address}</p>
          </div>
          <nav aria-label={t('nav.footer')} className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            <a href="#properties" onClick={scrollTo('properties')}>{t('footer.linkBuy')}</a>
            <a href="#properties" onClick={scrollTo('properties')}>{t('footer.linkRent')}</a>
            <a href="#properties" onClick={scrollTo('properties')}>{t('footer.linkSell')}</a>
            <a href="#locations" onClick={scrollTo('locations')}>{t('footer.linkLocations')}</a>
            <a href="#about" onClick={scrollTo('about')}>{t('footer.linkAbout')}</a>
            <a href="#contact" onClick={scrollTo('contact')}>{t('footer.linkContact')}</a>
          </nav>
          <div className="flex flex-wrap items-start gap-5 text-ivory/70">
            {links.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="hover:text-ivory"><Icon size={17} /></a>
            ))}
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-ivory"><FaWhatsapp size={17} /></a>
            <a href={`mailto:${email}`} aria-label={t('footer.email')} className="text-[13px] hover:text-ivory">{email}</a>
          </div>
        </div>
        <p className="mt-14 border-t border-ivory/15 pt-6 text-[11px] tracking-wide text-ivory/40">
          {t('footer.concept')}
        </p>
      </div>
    </footer>
  )
}
