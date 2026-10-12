import { useState, useEffect } from 'react'
import { ClipboardList, Plus, X, Calendar, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_GESTIONES = [
  { id: 1, codigo: '1/2024', nombre: 'Primer Semestre 2024', inicio: '2024-02-01', fin: '2024-06-30', estado: 'ACTIVO', estudiantes: 1180 },
  { id: 2, codigo: '2/2023', nombre: 'Segundo Semestre 2023', inicio: '2023-08-01', fin: '2023-12-15', estado: 'CERRADO', estudiantes: 1145 },
  { id: 3, codigo: '1/2023', nombre: 'Primer Semestre 2023', inicio: '2023-02-01', fin: '2023-06-30', estado: 'CERRADO', estudiantes: 1110 },
  { id: 4, codigo: '2/2022', nombre: 'Segundo Semestre 2022', inicio: '2022-08-01', fin: '2022-12-15', estado: 'CERRADO', estudiantes: 1090 },
]

const INITIAL_FORM = { codigo: '', nombre: '', inicio: '', fin: '', estado: 'PLANIFICADO' }

export default function Gestiones() {
  const [gestiones, setGestiones] = useState(() => {
    const saved = localStorage.getItem('emi_gestiones')
    if (saved) {
      try { return JSON.parse(saved) } catch { return MOCK_GESTIONES }
    }
    localStorage.setItem('emi_gestiones', JSON.stringify(MOCK_GESTIONES))
    return MOCK_GESTIONES
  })

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)

  useEffect(() => {
    localStorage.setItem('emi_gestiones', JSON.stringify(gestiones))
  }, [gestiones])

  const handleSave = () => {
    const updated = [{ ...form, id: Date.now(), estudiantes: 0 }, ...gestiones]
    setGestiones(updated)
    localStorage.setItem('emi_gestiones', JSON.stringify(updated))
    toast.success('Gestión académica guardada permanentemente.')
    setShowModal(false)
    setForm(INITIAL_FORM)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestiones Académicas</h1>
          <p className="page-subtitle">Semestres y períodos académicos de la EMI (almacenamiento inmutable)</p>
        </div>
        <button id="newGestionBtn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva Gestión
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {gestiones.map(g => (
          <div key={g.id} className={`card ${g.estado === 'ACTIVO' ? 'card-gold' : ''}`} style={{ position: 'relative' }}>
            {g.estado === 'ACTIVO' && (
              <div style={{ position: 'absolute', top: 16, right: 16 }}>
                <span className="badge badge-success"><CheckCircle size={10} /> ACTIVA</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: g.estado === 'ACTIVO' ? 'rgba(201,162,39,0.2)' : 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} className={g.estado === 'ACTIVO' ? 'text-gold' : 'text-muted'} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{g.codigo}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.nombre}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Inicio:</span>
                <span className="font-mono">{g.inicio ? new Date(g.inicio).toLocaleDateString('es-BO') : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Fin:</span>
                <span className="font-mono">{g.fin ? new Date(g.fin).toLocaleDateString('es-BO') : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Estudiantes:</span>
                <span className="text-gold font-bold">{g.estudiantes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header">
              <span className="modal-title">📅 Nueva Gestión Académica</span>
              <button className="btn btn-outline btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Código (ej: 1/2025) *</label>
                  <input id="formGestionCodigo" className="form-input font-mono" placeholder="1/2025" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado inicial</label>
                  <select id="formGestionEstado" className="form-input form-select" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    <option>PLANIFICADO</option><option>ACTIVO</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre descriptivo *</label>
                <input id="formGestionNombre" className="form-input" placeholder="Primer Semestre 2025" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fecha de Inicio</label>
                  <input id="formGestionInicio" type="date" className="form-input" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha de Fin</label>
                  <input id="formGestionFin" type="date" className="form-input" value={form.fin} onChange={e => setForm({ ...form, fin: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button id="saveGestionBtn" className="btn btn-primary" onClick={handleSave} disabled={!form.codigo || !form.nombre}>Crear Gestión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
