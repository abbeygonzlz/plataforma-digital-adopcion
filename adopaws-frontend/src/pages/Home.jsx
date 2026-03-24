import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PetCard from '../components/pets/PetCard'
import Button from '../components/ui/Button'
import { petService, petPhotoService } from '../services/api'
import styles from './Home.module.css'

const stats = [
  { value: '2,400+', label: 'Mascotas adoptadas' },
  { value: '180+', label: 'Refugios aliados' },
  { value: '15k+', label: 'Familias felices' },
]

const steps = [
  {
    step: '01',
    icon: '🔍',
    title: 'Explora',
    description: 'Navega por cientos de mascotas disponibles. Filtra por especie, edad, tamaño y zona.',
  },
  {
    step: '02',
    icon: '❤️',
    title: 'Conecta',
    description: 'Conoce la historia de cada animal y comunícate directamente con el refugio.',
  },
  {
    step: '03',
    icon: '🏠',
    title: 'Adopta',
    description: 'Completa el proceso de adopción y dale a tu nuevo compañero el hogar que merece.',
  },
]

const speciesFilters = [
  { id: 'dog', label: 'Perros', emoji: '🐕' },
  { id: 'cat', label: 'Gatos', emoji: '🐈' },
  { id: 'rabbit', label: 'Conejos', emoji: '🐇' },
  { id: 'bird', label: 'Aves', emoji: '🐦' },
]

// Mock featured pets for when API is not available
const mockPets = [
  { id: 1, name: 'Luna', species: 'dog', breed: 'Labrador Mix', ageYears: 2, gender: 'female', size: 'large', status: 'available', shelter: { name: 'Refugio Esperanza' } },
  { id: 2, name: 'Milo', species: 'cat', breed: 'Siamés', ageYears: 1, gender: 'male', size: 'small', status: 'available', shelter: { name: 'Casa Patitas' } },
  { id: 3, name: 'Coco', species: 'dog', breed: 'Golden Retriever', ageYears: 3, gender: 'male', size: 'large', status: 'available', shelter: { name: 'Refugio Esperanza' } },
  { id: 4, name: 'Nala', species: 'cat', breed: 'Persa Mix', ageMonths: 8, ageYears: 0, gender: 'female', size: 'small', status: 'available', shelter: { name: 'Huella Feliz' } },
  { id: 5, name: 'Bruno', species: 'dog', breed: 'Beagle', ageYears: 4, gender: 'male', size: 'medium', status: 'available', shelter: { name: 'Casa Patitas' } },
  { id: 6, name: 'Lola', species: 'rabbit', breed: 'Holandés', ageMonths: 6, ageYears: 0, gender: 'female', size: 'small', status: 'available', shelter: { name: 'Refugio Esperanza' } },
]

export default function Home() {
  const navigate = useNavigate()
  const [featuredPets, setFeaturedPets] = useState(mockPets)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState(null)

  useEffect(() => {
    petService.getAll()
      .then(async res => {
        const list = Array.isArray(res.data) ? res.data : []
        if (!list.length) return
        const enriched = await Promise.all(list.map(async p => {
          try {
            const petId = p.idPet ?? p.id
            const photos = await petPhotoService.getByPet(petId)
            const photoList = Array.isArray(photos.data) ? photos.data : []
            const main = photoList.find(ph => ph.isMain) || photoList[0]
            return { ...p, mainPhoto: main?.photoUrl || null }
          } catch { return p }
        }))
        setFeaturedPets(enriched)
      })
      .catch(() => {/* use mock data */})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedSpecies) params.set('species', selectedSpecies)
    navigate(`/pets?${params.toString()}`)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>🐾</span> La plataforma líder en adopción
          </div>
          <h1 className={styles.heroTitle}>
            Encuentra a tu<br />
            <em>compañero ideal</em>
          </h1>
          <p className="hero-sub">
            Miles de mascotas esperan un hogar lleno de amor. Conectamos refugios con familias para dar segundas oportunidades.
          </p>

          {/* Search bar */}
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <div className={styles.searchInput}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, raza..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.searchSpecies}>
              {speciesFilters.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.speciesBtn} ${selectedSpecies === s.id ? styles.speciesBtnActive : ''}`}
                  onClick={() => setSelectedSpecies(selectedSpecies === s.id ? null : s.id)}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <Button type="submit" size="lg">
              Buscar mascotas
            </Button>
          </form>
        </div>

        {/* Hero image area */}
        <div className={styles.heroVisual}>
          <div className={styles.heroCard1}>
            <div className={styles.heroCardInner}>🐕</div>
            <div className={styles.heroCardLabel}>
              <strong>Max</strong>
              <span>Labrador · 2 años</span>
            </div>
          </div>
          <div className={styles.heroCard2}>
            <div className={styles.heroCardInner}>🐈</div>
            <div className={styles.heroCardLabel}>
              <strong>Luna</strong>
              <span>Persa · 1 año</span>
            </div>
          </div>
          <div className={styles.heroPawBg}>🐾</div>
          <div className={styles.heroCircle} />
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map(s => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured pets */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Te van a robar el corazón</p>
              <h2 className={styles.sectionTitle}>Mascotas destacadas</h2>
            </div>
            <Link to="/pets" className={styles.seeAll}>
              Ver todas →
            </Link>
          </div>

          <div className={styles.petsGrid}>
            {featuredPets.slice(0, 6).map(pet => (
              <PetCard key={pet.id ?? pet.idPet} pet={pet} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Simple y rápido</p>
              <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
            </div>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map(step => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepEmoji}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>¿Tienes un refugio?</h2>
              <p className={styles.ctaText}>
                Únete a nuestra red de refugios y conecta a tus animales con familias que los esperan. Gratis, siempre.
              </p>
              <div className={styles.ctaActions}>
                <Link to="/register?role=shelter">
                  <Button size="lg">Registrar mi refugio</Button>
                </Link>
                <Link to="/shelters">
                  <Button size="lg" variant="secondary">Ver refugios</Button>
                </Link>
              </div>
            </div>
            <div className={styles.ctaDecor}>🏠</div>
          </div>
        </div>
      </section>
    </div>
  )
}
