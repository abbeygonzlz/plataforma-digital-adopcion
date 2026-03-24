import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { marketplaceService } from '../services/api'
import Button from '../components/ui/Button'
import ImageUpload from '../components/ui/ImageUpload'

const CATEGORIES = ['Todos', 'Alimento', 'Juguetes', 'Ropa', 'Accesorios', 'Salud', 'Otro']
const CONDITIONS = [['new','Nuevo'],['used','Usado'],['like_new','Como nuevo']]
const EMPTY_FORM = { title: '', category: 'Alimento', description: '', itemCondition: 'new', price: '', region: '', mainPhoto: '' }

export default function Marketplace() {
  const { isAuthenticated, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    marketplaceService.getAll()
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const filtered = catFilter === 'Todos' ? items : items.filter(i => i.category === catFilter)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) { setError('El título es requerido.'); return }
    setSaving(true); setError('')
    try {
      await marketplaceService.create({ ...form, price: parseFloat(form.price) || 0, idUser: user.id })
      setForm(EMPTY_FORM); setShowForm(false); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este artículo?')) return
    try { await marketplaceService.delete(id); setItems(prev => prev.filter(i => i.id !== id)) }
    catch { alert('Error al eliminar.') }
  }

  const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.4rem' }

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--color-bark)', marginBottom: '0.5rem' }}>Marketplace</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Artículos para mascotas de segunda mano y nuevos</p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => { setShowForm(!showForm); setError('') }}>
              {showForm ? '✕ Cancelar' : '+ Publicar artículo'}
            </Button>
          )}
        </div>

        {/* Formulario */}
        {showForm && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-bark)', marginBottom: '1.5rem' }}>Nuevo artículo</h2>
            {error && <div style={{ background: '#FDF0EA', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div><label style={labelStyle}>Título *</label><input name="title" value={form.title} onChange={handleChange} placeholder="Ej: Cama para perro" style={inputStyle} /></div>
                <div><label style={labelStyle}>Precio ($)</label><input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" style={inputStyle} /></div>
                <div><label style={labelStyle}>Región</label><input name="region" value={form.region} onChange={handleChange} placeholder="Ej: Santiago" style={inputStyle} /></div>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select name="itemCondition" value={form.itemCondition} onChange={handleChange} style={inputStyle}>
                    {CONDITIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descripción del artículo..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Foto del artículo</label>
                <ImageUpload
                  label="Seleccionar foto"
                  preview={form.mainPhoto}
                  onUpload={(url) => setForm(prev => ({ ...prev, mainPhoto: url }))}
                />
              </div>
              <div style={{ marginTop: '1.5rem' }}><Button type="submit" loading={saving}>Publicar artículo</Button></div>
            </form>
          </div>
        )}

        {/* Filtros de categoría */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              style={{ padding: '0.4rem 1rem', borderRadius: '99px', border: '1.5px solid', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s',
                borderColor: catFilter === cat ? 'var(--color-primary)' : 'var(--color-border)',
                background: catFilter === cat ? 'var(--color-primary)' : 'white',
                color: catFilter === cat ? 'white' : 'var(--color-text-secondary)' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de artículos */}
        {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Cargando...</p>
          : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🛍️</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No hay artículos en esta categoría aún.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {filtered.map((item, i) => (
                <div key={item.id ?? item.idMarketplaceItem ?? i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                  {item.mainPhoto
                    ? <img src={item.mainPhoto} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    : <div style={{ height: '180px', background: 'linear-gradient(135deg, #F5EDD8, #E8C49A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🛍️</div>
                  }
                  <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{item.title}</h3>
                      {item.price > 0 && <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>${item.price?.toLocaleString()}</span>}
                    </div>
                    {item.description && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>{item.description}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {item.category && <span style={{ fontSize: '0.75rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>{item.category}</span>}
                      {item.itemCondition && <span style={{ fontSize: '0.75rem', background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: '99px' }}>{CONDITIONS.find(c => c[0] === item.itemCondition)?.[1] || item.itemCondition}</span>}
                      {item.region && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>📍 {item.region}</span>}
                    </div>
                    {isAuthenticated && user?.id === item.idUser && (
                      <button onClick={() => handleDelete(item.id)}
                        style={{ marginTop: '0.75rem', background: 'none', border: '1px solid #C0392B', color: '#C0392B', borderRadius: '8px', padding: '4px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}
