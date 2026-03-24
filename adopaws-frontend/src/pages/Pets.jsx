import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import PetCard from '../components/pets/PetCard'
import Button from '../components/ui/Button'
import { petService, petPhotoService } from '../services/api'
import styles from './Pets.module.css'

const SPECIES_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'dog', label: '🐕 Perros' },
  { value: 'cat', label: '🐈 Gatos' },
  { value: 'rabbit', label: '🐇 Conejos' },
  { value: 'bird', label: '🐦 Aves' },
  { value: 'other', label: '🐾 Otros' },
]

const AGE_OPTIONS = [
  { value: '', label: 'Cualquier edad' },
  { value: 'baby', label: 'Bebé (0-6 meses)' },
  { value: 'young', label: 'Joven (6m-2 años)' },
  { value: 'adult', label: 'Adulto (2-8 años)' },
  { value: 'senior', label: 'Senior (8+ años)' },
]

const SIZE_OPTIONS = [
  { value: '', label: 'Cualquier tamaño' },
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
]

const GENDER_OPTIONS = [
  { value: '', label: 'Cualquier género' },
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Hembra' },
]

// Mock data for development
const generateMockPets = () => {
  const names = ['Luna', 'Max', 'Bella', 'Charlie', 'Mia', 'Rocky', 'Coco', 'Nala', 'Bruno', 'Lola', 'Zeus', 'Canela', 'Simba', 'Daisy', 'Thor']
  const species = ['dog', 'dog', 'cat', 'cat', 'dog', 'rabbit', 'dog', 'cat']
  const breeds = { dog: ['Labrador Mix', 'Golden Retriever', 'Beagle', 'Poodle Mix', 'Husky', 'Chihuahua Mix'], cat: ['Siamés', 'Persa Mix', 'Europeo Común', 'Maine Coon'], rabbit: ['Holandés', 'Angora'] }
  return names.map((name, i) => {
    const sp = species[i % species.length]
    return { id: i + 1, name, species: sp, breed: (breeds[sp] || ['Mixto'])[i % (breeds[sp]?.length || 1)], ageYears: i % 5, ageMonths: (i * 3) % 12, gender: i % 2 === 0 ? 'female' : 'male', size: ['small','medium','large'][i % 3], status: i % 7 === 0 ? 'pending' : 'available', shelter: { name: ['Refugio Esperanza','Casa Patitas','Huella Feliz'][i % 3] } }
  })
}

const ALL_MOCK_PETS = generateMockPets()

export default function Pets() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 12

  const filters = {
    search: searchParams.get('search') || '',
    species: searchParams.get('species') || '',
    age: searchParams.get('age') || '',
    size: searchParams.get('size') || '',
    gender: searchParams.get('gender') || '',
  }

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchParams({})
    setPage(1)
  }

  const hasFilters = Object.values(filters).some(Boolean)

  const enrichWithPhotos = async (list) => {
    return Promise.all(list.map(async p => {
      try {
        const petId = p.idPet ?? p.id
        const photos = await petPhotoService.getByPet(petId)
        const photoList = Array.isArray(photos.data) ? photos.data : []
        const main = photoList.find(ph => ph.isMain) || photoList[0]
        return { ...p, mainPhoto: main?.photoUrl || null }
      } catch { return p }
    }))
  }

  const loadPets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await petService.getAll({ ...filters, page, pageSize: PAGE_SIZE })
      const list = res.data.items || res.data
      const enriched = await enrichWithPhotos(Array.isArray(list) ? list : [])
      setPets(enriched)
      setTotalCount(res.data.totalCount || enriched.length)
    } catch {
      // Use mock data filtered
      let filtered = ALL_MOCK_PETS
      if (filters.search) filtered = filtered.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.breed?.toLowerCase().includes(filters.search.toLowerCase()))
      if (filters.species) filtered = filtered.filter(p => p.species === filters.species)
      if (filters.gender) filtered = filtered.filter(p => p.gender === filters.gender)
      if (filters.size) filtered = filtered.filter(p => p.size === filters.size)
      setTotalCount(filtered.length)
      const start = (page - 1) * PAGE_SIZE
      setPets(filtered.slice(start, start + PAGE_SIZE))
    } finally {
      setLoading(false)
    }
  }, [filters.search, filters.species, filters.age, filters.size, filters.gender, page])

  useEffect(() => { loadPets() }, [loadPets])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Mascotas disponibles</h1>
            <p className={styles.subtitle}>
              {totalCount > 0 ? `${totalCount} mascotas esperan un hogar` : 'Encuentra a tu compañero ideal'}
            </p>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Sidebar filters */}
          <aside className={styles.sidebar}>
            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <h3>Filtros</h3>
                {hasFilters && (
                  <button className={styles.clearBtn} onClick={clearFilters}>Limpiar</button>
                )}
              </div>

              {/* Search */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Buscar</label>
                <div className={styles.searchField}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Nombre, raza..."
                    value={filters.search}
                    onChange={e => updateFilter('search', e.target.value)}
                  />
                </div>
              </div>

              {/* Species */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Especie</label>
                <div className={styles.radioGroup}>
                  {SPECIES_OPTIONS.map(opt => (
                    <label key={opt.value} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="species"
                        value={opt.value}
                        checked={filters.species === opt.value}
                        onChange={() => updateFilter('species', opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Edad</label>
                <select
                  className={styles.selectField}
                  value={filters.age}
                  onChange={e => updateFilter('age', e.target.value)}
                >
                  {AGE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Tamaño</label>
                <select
                  className={styles.selectField}
                  value={filters.size}
                  onChange={e => updateFilter('size', e.target.value)}
                >
                  {SIZE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Género</label>
                <select
                  className={styles.selectField}
                  value={filters.gender}
                  onChange={e => updateFilter('gender', e.target.value)}
                >
                  {GENDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main grid */}
          <div className={styles.main}>
            {loading ? (
              <div className={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : pets.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🐾</span>
                <h3>No encontramos resultados</h3>
                <p>Intenta ajustar los filtros o ampliar tu búsqueda.</p>
                <Button onClick={clearFilters} variant="secondary">Limpiar filtros</Button>
              </div>
            ) : (
              <>
                <div className={styles.petsGrid}>
                  {pets.map(pet => (
                    <PetCard key={pet.idPet ?? pet.id} pet={pet} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      ← Anterior
                    </Button>
                    <div className={styles.pageInfo}>
                      Página {page} de {totalPages}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Siguiente →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
