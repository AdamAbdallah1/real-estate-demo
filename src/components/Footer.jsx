import { FaInstagram, FaWhatsapp } from 'react-icons/fa'

const scrollTo = (id) => (e) => {
  e.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory/80">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl tracking-[0.22em] text-ivory">NARA</p>
            <p className="text-[9px] tracking-[0.5em] text-ivory/50">REAL ESTATE</p>
            <p className="mt-6 text-[13px]">Beirut, Lebanon</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            <a href="#properties" onClick={scrollTo('properties')}>Buy</a>
            <a href="#properties" onClick={scrollTo('properties')}>Rent</a>
            <a href="#properties" onClick={scrollTo('properties')}>Sell</a>
            <a href="#locations" onClick={scrollTo('locations')}>Locations</a>
            <a href="#about" onClick={scrollTo('about')}>About</a>
            <a href="#contact" onClick={scrollTo('contact')}>Contact</a>
          </nav>
          <div className="flex items-start gap-5 text-ivory/70">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-ivory"><FaInstagram size={17} /></a>
            <a href="https://wa.me/9611000000" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-ivory"><FaWhatsapp size={17} /></a>
            <a href="mailto:hello@nara.example" aria-label="Email" className="text-[13px] hover:text-ivory">hello@nara.example</a>
          </div>
        </div>
        <p className="mt-14 border-t border-ivory/15 pt-6 text-[11px] tracking-wide text-ivory/40">
          Concept website · Property details shown for demonstration
        </p>
      </div>
    </footer>
  )
}
