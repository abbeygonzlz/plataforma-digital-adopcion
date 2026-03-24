import { useState, useEffect } from 'react'
import { userService } from '../services/api'
import PetCard from '../components/pets/PetCard'
import styles from './SimpleList.module.css'

const MOCK = [
  { id: 1, name: 'Luna', species: 'dog', breed: 'Labrador', ageYears: 2, gender: 'female', size: 'large', status: 'available', isFavorited: true, shelter: { name: 'Refugio Esperanza' } },
]

export default function Favorites() {
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    userService.getFavorites().then(r => setFavs(r.data)).catch(() => setFavs(MOCK)).finally(() => setLoading(false))
  }, [])
  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Mis favoritos</h1>
        {loading ? <p>Cargando...</p> : favs.length === 0 ? (
          <div className={styles.empty}><span>❤️</span><p>No has guardado favoritos aún.</p></div>
        ) : (
          <div className={styles.grid}>
            {favs.map(pet => <PetCard key={pet.id} pet={pet} />)}
          </div>
        )}
      </div>
    </div>
  )
}
