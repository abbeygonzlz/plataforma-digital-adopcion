import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { shelterService } from '../services/api'
import styles from './Shelters.module.css'

const MOCK = [
  { id: 1, fullName: 'Refugio Esperanza', region: 'Santiago', profileDescription: 'Más de 10 años rescatando y dando hogares a animales.' },
  { id: 2, fullName: 'Casa Patitas', region: 'Valparaíso', profileDescription: 'Dedicados al rescate de perros y gatos en situación de calle.' },
  { id: 3, fullName: 'Huella Feliz', region: 'Concepción', profileDescription: 'Refugio familiar con enfoque en la rehabilitación animal.' },
]

export default function Shelters() {
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    shelterService.getAll()
      .then(r => setShelters(Array.isArray(r.data) ? r.data : MOCK))
      .catch(() => setShelters(MOCK))
      .finally(() => setLoading(false))
  }, [])

  const list = loading ? MOCK : (shelters.length > 0 ? shelters : MOCK)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Refugios aliados</h1>
          <p className={styles.subtitle}>Organizaciones comprometidas con el bienestar animal</p>
        </div>
        <div className={styles.grid}>
          {list.map((s, i) => {
            const sId = s.idUser ?? s.id ?? i
            return (
            <Link key={sId} to={`/shelters/${sId}`} className={styles.card}>
              <div className={styles.cardIcon}>🏠</div>
              <h3 className={styles.cardName}>{s.fullName || s.name}</h3>
              <p className={styles.cardCity}>📍 {s.region || s.city || 'Sin región'}</p>
              <p className={styles.cardDesc}>{s.profileDescription || s.description || ''}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardLink}>Ver más →</span>
              </div>
            </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
