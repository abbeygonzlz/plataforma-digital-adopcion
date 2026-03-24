import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService, marketplaceService, consultationService, consultationResponseService } from '../services/api'
import Button from '../components/ui/Button'
import styles from './ProfilePage.module.css'

const CR_PROVINCES = ['San José','Alajuela','Cartago','Heredia','Guanacaste','Puntarenas','Limón']
const CONDITIONS = [['new','Nuevo'],['used','Usado'],['like_new','Como nuevo']]

// Mini chat dentro del perfil 
function ProfileChat({ conversation, currentUser, onClose, onSold }) {
 const { item, consultation } = conversation
 const [messages, setMessages] = useState([])
 const [text, setText] = useState('')
 const [sending, setSending] = useState(false)
 const [loadingMsgs, setLoadingMsgs] = useState(true)
 const [saleStatus, setSaleStatus] = useState(
 consultation.consultationStatus === 'closed' ? 'sold' : null
 )
 const [editMode, setEditMode] = useState(false)
 const [editForm, setEditForm] = useState({
 title: item.title||'', category: item.category||'Alimento',
 description: item.description||'', itemCondition: item.itemCondition||'new',
 price: item.price??'', region: item.region||'', mainPhoto: item.mainPhoto||''
 })
 const [savingEdit, setSavingEdit] = useState(false)
 const bottomRef = useRef(null)

 const cId = consultation.idConsultation ?? consultation.id
 const totalMessages = messages.length

 useEffect(() => { loadMessages() }, [])
 useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
 useEffect(() => {
 if (totalMessages >= 5 && saleStatus === null) setSaleStatus('prompt')
 }, [totalMessages, saleStatus])

 const loadMessages = async () => {
 setLoadingMsgs(true)
 try {
 const r = await consultationResponseService.getByConsultation(cId).catch(() => ({ data: [] }))
 const responses = Array.isArray(r.data) ? r.data : []
 const allMsgs = [
 { id: 'first', text: consultation.message, senderId: parseInt(senderId ?? consultation.senderIdUser ?? 0), createdAt: consultation.createdAt }
 ]
 responses.forEach(resp => allMsgs.push({
 id: resp.idResponse ?? resp.id,
 text: resp.responseMessage,
 senderId: parseInt(resp.idUser),
 createdAt: resp.createdAt
 }))
 setMessages(allMsgs)
 } finally { setLoadingMsgs(false) }
 }

 const sendMessage = async () => {
 if (!text.trim()) return
 setSending(true)
 try {
 await consultationResponseService.create({
 idConsultation: parseInt(cId),
 idUser: parseInt(currentUser.id),
 responseMessage: text.trim()
 })
 await consultationService.updateStatus(cId, 'answered').catch(() => {})
 setText('')
 await loadMessages()
 } catch { alert('Error al enviar.') }
 finally { setSending(false) }
 }

 const handleKeyDown = (e) => {
 if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
 }

 const markAsSold = async () => {
 try {
 await marketplaceService.update(item.id ?? item.idMarketplaceItem, { ...item, publicationStatus: 'sold' })
 await consultationService.updateStatus(cId, 'closed').catch(() => {})
 setSaleStatus('sold')
 onSold && onSold(item.id ?? item.idMarketplaceItem)
 } catch { alert('Error al actualizar.') }
 }

 const keepAvailable = async () => {
 setSaleStatus('available')
 await consultationService.updateStatus(cId, 'answered').catch(() => {})
 }

 const saveEdit = async () => {
 setSavingEdit(true)
 try {
 await marketplaceService.update(item.id ?? item.idMarketplaceItem, {
 ...editForm, price: parseFloat(editForm.price) || 0
 })
 Object.assign(item, editForm)
 setEditMode(false)
 } catch { alert('Error al guardar.') }
 finally { setSavingEdit(false) }
 }

 const inputStyle = { width: '100%', padding: '0.55rem 0.85rem', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }
 const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '3px' }

 return (
 <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
 <div style={{ background: 'var(--color-surface)', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

 {/* Header */}
 <div style={{ padding: '1.1rem 1.4rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
 <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#F5EDD8,#E8C49A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 {item.mainPhoto ? <img src={item.mainPhoto} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <span style={{ fontSize:'1.2rem', color:'var(--color-text-muted)' }}>—</span>}
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <p style={{ fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
 <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Comprador:{' '}
              <Link to={`/user/${senderId ?? consultation.senderIdUser}`}
                onClick={e => e.stopPropagation()}
                style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                {conversation.buyerName || `Usuario #${consultation.senderIdUser}`}
              </Link>
            </p>
 </div>
 <button onClick={() => setEditMode(!editMode)} style={{ background: 'var(--color-primary-bg)', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '0.78rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}>
 Editar
 </button>
 <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0 }}>✕</button>
 </div>

 {/* Edición inline */}
 {editMode && (
 <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', flexShrink: 0 }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
 <div style={{ gridColumn:'1/-1' }}><label style={labelStyle}>Título</label><input value={editForm.title} onChange={e => setEditForm(p=>({...p,title:e.target.value}))} style={inputStyle} /></div>
 <div><label style={labelStyle}>Precio (₡)</label><input type="number" value={editForm.price} onChange={e => setEditForm(p=>({...p,price:e.target.value}))} style={inputStyle} /></div>
 <div>
 <label style={labelStyle}>Provincia</label>
 <select value={editForm.region} onChange={e => setEditForm(p=>({...p,region:e.target.value}))} style={inputStyle}>
 <option value="">Selecciona</option>
 {CR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>Categoría</label>
 <select value={editForm.category} onChange={e => setEditForm(p=>({...p,category:e.target.value}))} style={inputStyle}>
 {['Alimento','Juguetes','Ropa','Accesorios','Salud','Otro'].map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 </div>
 <div>
 <label style={labelStyle}>Estado</label>
 <select value={editForm.itemCondition} onChange={e => setEditForm(p=>({...p,itemCondition:e.target.value}))} style={inputStyle}>
 {CONDITIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
 </select>
 </div>
 <div style={{ gridColumn:'1/-1' }}><label style={labelStyle}>Descripción</label><textarea rows={2} value={editForm.description} onChange={e => setEditForm(p=>({...p,description:e.target.value}))} style={{ ...inputStyle, resize:'vertical' }} /></div>
 </div>
 <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.6rem' }}>
 <Button size="sm" loading={savingEdit} onClick={saveEdit}>Guardar</Button>
 <button onClick={() => setEditMode(false)} style={{ background:'none', border:'1px solid var(--color-border)', borderRadius:'8px', padding:'5px 12px', fontSize:'0.82rem', cursor:'pointer', color:'var(--color-text-secondary)' }}>Cancelar</button>
 </div>
 </div>
 )}

 {/* Mensajes */}
 <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
 {loadingMsgs ? (
 <p style={{ textAlign:'center', color:'var(--color-text-muted)', padding:'2rem 0' }}>Cargando...</p>
 ) : messages.map((msg, i) => {
 const isMine = msg.senderId === parseInt(currentUser.id)
 return (
 <div key={msg.id ?? i} style={{ display:'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
 <div style={{
 maxWidth:'75%', padding:'0.6rem 0.9rem',
 borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
 background: isMine ? 'var(--color-primary)' : 'var(--color-surface-alt)',
 color: isMine ? 'white' : 'var(--color-text-primary)',
 fontSize:'0.88rem', lineHeight:1.45,
 boxShadow:'0 1px 3px rgba(0,0,0,0.08)'
 }}>
 {msg.text}
 </div>
 </div>
 )
 })}

 {saleStatus === 'prompt' && (
 <div style={{ background:'linear-gradient(135deg,#FDF8ED,#FFF3CD)', border:'1.5px solid #F0C000', borderRadius:'14px', padding:'1rem 1.1rem', textAlign:'center', marginTop:'0.5rem' }}>
 <p style={{ fontWeight:700, color:'#8B6914', marginBottom:'0.3rem', fontSize:'0.9rem' }}> ¿Se concretó la venta?</p>
 <p style={{ fontSize:'0.8rem', color:'#A07820', marginBottom:'0.8rem' }}>Han intercambiado varios mensajes. ¿Qué pasó?</p>
 <div style={{ display:'flex', gap:'0.5rem', justifyContent:'center', flexWrap:'wrap' }}>
 <button onClick={markAsSold} style={{ background:'#4A7C59', color:'white', border:'none', borderRadius:'10px', padding:'7px 16px', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}> Vendido</button>
 <button onClick={keepAvailable} style={{ background:'white', color:'#8B6914', border:'1.5px solid #F0C000', borderRadius:'10px', padding:'7px 16px', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}> Sigue en venta</button>
 </div>
 </div>
 )}
 {saleStatus === 'sold' && (
 <div style={{ background:'#EDF5F0', border:'1.5px solid #4A7C59', borderRadius:'12px', padding:'0.8rem', textAlign:'center', color:'#4A7C59', fontWeight:600, fontSize:'0.88rem' }}>
 Artículo marcado como <strong>vendido</strong>
 </div>
 )}
 {saleStatus === 'available' && (
 <div style={{ background:'var(--color-primary-bg)', border:'1.5px solid var(--color-primary)', borderRadius:'12px', padding:'0.8rem', textAlign:'center', color:'var(--color-primary)', fontWeight:600, fontSize:'0.85rem' }}>
 Artículo sigue en venta
 </div>
 )}
 <div ref={bottomRef} />
 </div>

 {/* Input */}
 {saleStatus !== 'sold' && (
 <div style={{ padding:'0.85rem 1.4rem', borderTop:'1px solid var(--color-border)', display:'flex', gap:'0.5rem', alignItems:'flex-end', flexShrink:0 }}>
 <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
 placeholder="Escribe una respuesta… (Enter para enviar)" rows={1}
 style={{ flex:1, padding:'0.6rem 0.85rem', border:'1.5px solid var(--color-border)', borderRadius:'12px', fontSize:'0.88rem', resize:'none', outline:'none', lineHeight:1.4, maxHeight:'90px', overflow:'auto' }} />
 <button onClick={sendMessage} disabled={!text.trim() || sending}
 style={{ background: text.trim() ? 'var(--color-primary)' : 'var(--color-border)', border:'none', borderRadius:'12px', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor: text.trim() ? 'pointer' : 'default', fontSize:'1rem', flexShrink:0 }}>
 {sending ? '⏳' : ''}
 </button>
 </div>
 )}
 </div>
 </div>
 )
}

// Componente principal Profile 
export default function Profile() {
 const { user, updateUser } = useAuth()
 const userId = user?.idUser ?? user?.id

 // Estado del formulario de perfil 
 const [form, setForm] = useState({
 fullName: user?.fullName || '',
 phone: user?.phone || '',
 region: user?.region || '',
 profileDescription: user?.profileDescription || '',
 profileImage: user?.profileImage || '',
 status: user?.status || 'Active',
 })
 const [saving, setSaving] = useState(false)
 const [saved, setSaved] = useState(false)
 const [error, setError] = useState('')

 // Estado de mensajes marketplace 
 const [searchParams] = useSearchParams()
 const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'messages' ? 'messages' : 'profile')
 const [conversations, setConversations] = useState([]) // { item, consultation, buyerName }
 const [loadingMsgs, setLoadingMsgs] = useState(false)
 const [openChat, setOpenChat] = useState(null) // conversation object
 const [soldItems, setSoldItems] = useState(new Set())

 // Cargar conversaciones de marketplace cuando se activa la tab
 useEffect(() => {
 if (activeTab === 'messages' && userId) loadConversations()
 }, [activeTab, userId])

 const loadConversations = async () => {
 setLoadingMsgs(true)
 try {
 // Traer todos los items del usuario (vendedor)
 const itemsRes = await marketplaceService.getAll().catch(() => ({ data: [] }))
 const allItems = Array.isArray(itemsRes.data) ? itemsRes.data : []
 const myItems = allItems.filter(i => parseInt(i.idUser) === parseInt(userId))

 if (myItems.length === 0) { setConversations([]); return }

 // Traer todas las consultas recibidas por este usuario
 const consultRes = await consultationService.getByReceiver(parseInt(userId)).catch(() => ({ data: [] }))
 const allConsultations = Array.isArray(consultRes.data) ? consultRes.data : []

 // Filtrar las que tienen subject = marketplace:itemId
 const marketplaceConsults = allConsultations.filter(c =>
 typeof c.subject === 'string' && c.subject.startsWith('marketplace:')
 )

 // Cruzar con los items del usuario para armar las conversaciones
 const convList = []
 for (const consult of marketplaceConsults) {
 const itemId = parseInt(consult.subject.replace('marketplace:', ''))
 const item = myItems.find(i => (i.id ?? i.idMarketplaceItem) === itemId)
 if (!item) continue

     // Obtener nombre del comprador (soporta variantes del campo)
     const senderId = consult.senderIdUser ?? consult.idSender ?? consult.sender_id ?? consult.idUser
     let buyerName = senderId ? `Usuario #${senderId}` : 'Usuario desconocido'
     if (senderId) {
       try {
         const uRes = await userService.getById(senderId)
         if (uRes?.data?.fullName) buyerName = uRes.data.fullName
       } catch { /* silencioso */ }
     }
     convList.push({ item, consultation: consult, buyerName, senderId })
 }

 // Ordenar: primero los no cerrados, luego por id desc (más recientes primero)
 convList.sort((a, b) => {
 const aOpen = a.consultation.consultationStatus !== 'closed' ? 0 : 1
 const bOpen = b.consultation.consultationStatus !== 'closed' ? 0 : 1
 if (aOpen !== bOpen) return aOpen - bOpen
 return (b.consultation.idConsultation ?? 0) - (a.consultation.idConsultation ?? 0)
 })

 setConversations(convList)
 } finally {
 setLoadingMsgs(false)
 }
 }

 const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

 const handleSubmit = async (e) => {
 e.preventDefault()
 setSaving(true); setError('')
 try {
 await userService.update(userId, form)
 updateUser(form)
 setSaved(true)
 setTimeout(() => setSaved(false), 3000)
 } catch {
 setError('Error al guardar los cambios.')
 } finally { setSaving(false) }
 }

 const handleSold = (itemId) => {
 setSoldItems(prev => new Set([...prev, itemId]))
 setOpenChat(null)
 loadConversations()
 }

 const statusColor = {
 pending: '#D4A017', answered: '#4A7C59', closed: '#888', '': '#D4A017'
 }
 const statusLabel = {
 pending: 'Pendiente', answered: 'Respondida', closed: 'Cerrada', '': 'Pendiente'
 }

 return (
 <div className={styles.page}>
 <div className="container">
 <h1 className={styles.title}>Mi perfil</h1>

 {/* Tabs */}
 <div style={{ display:'flex', gap:'0.25rem', borderBottom:'2px solid var(--color-border)', marginBottom:'2rem' }}>
 {[
 { id:'profile', label:' Mis datos' },
 { id:'messages', label:' Mensajes del Marketplace' },
 ].map(t => (
 <button key={t.id} onClick={() => setActiveTab(t.id)}
 style={{ padding:'0.65rem 1.25rem', border:'none', background:'none', cursor:'pointer', fontSize:'0.9rem', fontWeight:600,
 color: activeTab === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
 borderBottom: activeTab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
 marginBottom:'-2px', transition:'all 0.15s' }}>
 {t.label}
 </button>
 ))}
 </div>

 {/* Tab: perfil */}
 {activeTab === 'profile' && (
 <div className={styles.card}>
 <div className={styles.avatar}>
 {user?.profileImage
 ? <img src={user.profileImage} alt={user.fullName} style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%' }} />
 : user?.fullName?.[0]?.toUpperCase() ?? 'U'
 }
 </div>
 <p style={{ textAlign:'center', color:'#666', marginBottom:'0.5rem' }}>
 {user?.email} · <strong>{user?.userType}</strong>
 </p>
 {error && <p style={{ color:'red', textAlign:'center' }}>{error}</p>}
 <form className={styles.form} onSubmit={handleSubmit}>
 {[
 { name:'fullName', label:'Nombre completo', type:'text' },
 { name:'phone', label:'Teléfono', type:'tel' },
 { name:'region', label:'Provincia', type:'select' },
 { name:'profileDescription', label:'Descripción', type:'text' },
 { name:'profileImage', label:'URL de foto de perfil', type:'text' },
 ].map(({ name, label, type }) => (
 <div key={name} className={styles.field}>
 <label className={styles.label}>{label}</label>
 {type === 'select' ? (
 <select name={name} value={form[name]} onChange={handleChange} className={styles.input}>
 <option value="">Selecciona tu provincia</option>
 {CR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
 </select>
 ) : (
 <input name={name} value={form[name]} onChange={handleChange} className={styles.input} type={type} />
 )}
 </div>
 ))}
 <Button type="submit" loading={saving}>{saved ? ' Guardado' : 'Guardar cambios'}</Button>
 </form>
 </div>
 )}

 {/* Tab: mensajes marketplace */}
 {activeTab === 'messages' && (
 <div style={{ maxWidth:'700px' }}>
 {loadingMsgs ? (
 <p style={{ color:'var(--color-text-muted)' }}>Cargando conversaciones...</p>
 ) : conversations.length === 0 ? (
 <div style={{ textAlign:'center', padding:'4rem 0' }}>
 <div style={{ fontSize:'3rem', marginBottom:'1rem', opacity:0.4 }}></div>
 <p style={{ color:'var(--color-text-muted)' }}>No tienes mensajes de compradores aún.</p>
 <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)', marginTop:'0.5rem' }}>
 Cuando alguien contacte uno de tus artículos, aparecerá aquí.
 </p>
 </div>
 ) : (
 <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
 {conversations.map((conv, i) => {
 const { item, consultation, buyerName, senderId } = conv
 const itemId = item.id ?? item.idMarketplaceItem
 const cId = consultation.idConsultation ?? consultation.id
 const status = consultation.consultationStatus || 'pending'
 const isClosed = status === 'closed'
 const isItemSold = soldItems.has(itemId) || item.publicationStatus === 'sold'
 const color = statusColor[status] || '#D4A017'
 const label = statusLabel[status] || 'Pendiente'

            return (
              <React.Fragment key={`${itemId}-${cId}-${i}`}>
              <div
                onClick={() => setOpenChat(conv)}
                style={{ background:'var(--color-surface)', border:'1px solid var(--color-border-light)', borderRadius:'14px', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', transition:'box-shadow 0.15s', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}
                onMouseOver={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'}
                onMouseOut={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'}
              >
 {/* Foto item */}
 <div style={{ width:'48px', height:'48px', borderRadius:'10px', overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#F5EDD8,#E8C49A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
 {item.mainPhoto
 ? <img src={item.mainPhoto} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
 : <span style={{ fontSize:'1.4rem' }}></span>
 }
 </div>

 {/* Info */}
 <div style={{ flex:1, minWidth:0 }}>
 <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.2rem', flexWrap:'wrap' }}>
 <span style={{ fontWeight:700, color:'var(--color-text-primary)', fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'180px' }}>{item.title}</span>
 {isItemSold && (
 <span style={{ background:'#EDF5F0', color:'#4A7C59', padding:'1px 8px', borderRadius:'99px', fontSize:'0.7rem', fontWeight:700 }}>VENDIDO</span>
 )}
 </div>
 <p style={{ fontSize:'0.82rem', color:'var(--color-text-muted)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                <Link to={`/user/${senderId ?? consultation.senderIdUser}`}
                  onClick={e => e.stopPropagation()}
                  style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
                  {buyerName}
                </Link>
              </p>
 <p style={{ fontSize:'0.8rem', color:'var(--color-text-muted)', margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
 "{consultation.message?.slice(0, 60)}{consultation.message?.length > 60 ? '…' : ''}"
 </p>
 </div>

 {/* Status badge + ver perfil */}
              <div style={{ flexShrink:0, textAlign:'right', display:'flex', flexDirection:'column', gap:'0.4rem', alignItems:'flex-end' }}>
                <span style={{ background: color + '20', color, padding:'3px 10px', borderRadius:'99px', fontSize:'0.72rem', fontWeight:700, whiteSpace:'nowrap' }}>
                  {label}
                </span>
                <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', marginTop:'2px' }}>Abrir chat →</p>
              </div>
            </div>
              {senderId && (
                <Link
                  to={`/user/${senderId}`}
                  onClick={e => e.stopPropagation()}
                  style={{ display:'inline-block', fontSize:'0.78rem', color:'var(--color-primary)', fontWeight:600, textDecoration:'none', padding:'4px 2px', marginLeft:'60px' }}>
                  Ver perfil del comprador →
                </Link>
              )}
              </React.Fragment>
            )
 })}
 </div>
 )}

 {/* Refresh button */}
 {!loadingMsgs && conversations.length > 0 && (
 <div style={{ marginTop:'1.5rem', textAlign:'center' }}>
 <button onClick={loadConversations} style={{ background:'none', border:'1px solid var(--color-border)', borderRadius:'8px', padding:'7px 18px', fontSize:'0.85rem', cursor:'pointer', color:'var(--color-text-secondary)' }}>
 Actualizar mensajes
 </button>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Chat modal */}
 {openChat && (
 <ProfileChat
 conversation={openChat}
 currentUser={user}
 onClose={() => { setOpenChat(null); loadConversations() }}
 onSold={handleSold}
 />
 )}
 </div>
 )
}
