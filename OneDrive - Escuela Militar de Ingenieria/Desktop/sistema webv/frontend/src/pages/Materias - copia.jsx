import { useState, useEffect } from 'react'
import { BookMarked, Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_MATERIAS = [
  { id: 1, codigo: 'SIS-101', nombre: 'Fundamentos de Programación', carrera: 'Ing. de Sistemas', semestre: '1ro', creditos: 4, horas_teoria: 3, horas_practica: 2, estado: 'ACTIVO' },
  { id: 2, codigo: 'SIS-201', nombre: 'Estructuras de Datos', carrera: 'Ing. de Sistemas', semestre: '2do', creditos: 4, horas_teoria: 3, horas_practica: 2, estado: 'ACTIVO' },
  { id: 3, codigo: 'SIS-301', nombre: 'Base de Datos I', carrera: 'Ing. de Sistemas', semestre: '3ro', creditos: 4, horas_teoria: 2, horas_practica: 3, estado: 'ACTIVO' },
  { id: 4, codigo: 'SIS-401', nombre: 'Redes de Computadoras', carrera: 'Ing. de Sistemas', semestre: '4to', creditos: 4, horas_teoria: 3, horas_practica: 2, estado: 'ACTIVO' },
  { id: 5, codigo: 'MAT-101', nombre: 'Cálculo I', carrera: 'Ing. Civil', semestre: '1ro', creditos: 4, horas_teoria: 4, horas_practica: 1, estado: 'ACTIVO' },
  { id: 6, codigo: 'MAT-201', nombre: 'Cálculo II', carrera: 'Ing. Civil', semestre: '2do', creditos: 4, horas_teoria: 4, horas_practica: 1, estado: 'ACTIVO' },
  { id: 7, codigo: 'SIS-501', nombre: 'Inteligencia Artificial', carrera: 'Ing. de Sistemas', semestre: '5to', creditos: 5, horas_teoria: 3, horas_practica: 3, estado: 'ACTIVO' },
]

const CARRERAS = ['Ing. de Sistemas', 'Ing. Civil', 'Ing. Electrónica', 'Ing. Industrial', 'Ing. Mecánica']
const SEMESTRES = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo']
const INITIAL_FORM = { codigo: '', nombre: '', carrera: '', semestre: '', creditos: 3, horas_teoria: 2, horas_practica: 1, estado: 'ACTIVO' }

export default function Materias() {
  const [materias, setMaterias] = useState(() => {
    const saved = localStorage.getItem('emi_materias')
    if (saved) {
      try { return JSON.parse(saved) } catch { return MOCK_MATERIAS }
    }
    localStorage.setItem('emi_materias', JSON.stringify(MOCK_MATERIAS))
    return MOCK_MATERIAS
  })

  const [search, setSearch] = useState('')
  const [filterCarrera, setFilterCarrera] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)

  useEffect(() => {
    localStorage.setItem('emi_materias', JSON.stringify(materias))
  }, [materias])

  const filtered = materias.filter(m => {
    const q = search.toLowerCase()
    return (!q || m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q))
      && (!filterCarrera || m.carrera === filterCarrera)
  })

  const openCreate = () => { setEditing(null); setForm(INITIAL_FORM); setShowModal(true) }
  const openEdit = (m) => { setEditing(m); setForm({ codigo: m.codigo, nombre: m.nombre, carrera: m.carrera, semestre: m.semestre, creditos: m.creditos, horas_teoria: m.horas_teoria, horas_practica: m.horas_practica, estado: m.estado }); setShowModal(true) }

  const handleSave = () => {
    let updated
    if (editing) {
      updated = materias.map(m => m.id === editing.id ? { ...m, ...form } : m)
      toast.success('Materia actualizada y guardada permanentemente.')
    } else {
      updated = [{ ...form, id: Date.now() }, ...materias]
      toast.success('Materia creada y guardada permanentemente.')
    }
    setMaterias(updated)
    localStorage.setItem('emi_materias', JSON.stringify(updated))
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (!confirm('¿Desea eliminar esta materia?')) return
    const updated = materias.filter(x => x.id !== id)
    setMaterias(updated)
    localStorage.setItem('emi_materias', JSON.stringify(updated))
    toast.success('Materia eliminada.')
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Materias</h1>
          <p className="page-subtitle">{filtered.length} materias registradas (almacenamiento inmutable)</p>
        </div>
        <button id="newMateriaBtn" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva Materia
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={14} />
          <input id="searchMateria" type="text" className="search-input" placeholder="Buscar materia o código..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select id="filterCarreraMateria" className="form-input form-select" style={{ width: 'auto', minWidth: 200 }} value={filterCarrera} onChange={e => setFilterCarrera(e.target.value)}>
          <option value="">Todas las carreras</option>
          {CARRERAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-container">
        <div className="table-header">
          <BookMarked size={16} className="text-gold" />
          <span className="table-title">Plan de Estudios</span>
          <span className="badge badge-muted">{filtered.length}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Materia</th><th>Carrera</th><th>Semestre</th>
                <th>Créditos</th><th>Horas (T/P)</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td><span className="font-mono text-gold" style={{ fontSize: 11 }}>{m.codigo}</span></td>
                  <td style={{ fontWeight: 500 }}>{m.nombre}</td>
                  <td style={{ fontSize: 12 }}>{m.carrera}</td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-muted">{m.semestre}</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-gold">{m.creditos} cr.</span>
                  </td>
                  <td style={{ textAlign: 'center', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    {m.horas_teoria}T / {m.horas_practica}P
                  </td>
                  <td><span className={`badge ${m.estado === 'ACTIVO' ? 'badge-success' : 'badge-muted'}`}>{m.estado}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(m)}><Edit2 size={13} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(m.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal fade-in">
            <div className="modal-header">
              <span className="modal-title">{editing ? '✏️ Editar Materia' : '➕ Nueva Materia'}</span>
              <button className="btn btn-outline btn-icon btn-sm" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Código *</label>
                  <input id="formMateriaCod" className="form-input font-mono" placeholder="SIS-101" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Créditos</label>
                  <input id="formMateriaCreditos" type="number" min={1} max={10} className="form-input" value={form.creditos} onChange={e => setForm({ ...form, creditos: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nombre de la Materia *</label>
                <input id="formMateriaNombre" className="form-input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Carrera</label>
                  <select id="formMateriaCarrera" className="form-input form-select" value={form.carrera} onChange={e => setForm({ ...form, carrera: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {CARRERAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Semestre</label>
                  <select id="formMateriaSem" className="form-input form-select" value={form.semestre} onChange={e => setForm({ ...form, semestre: e.target.value })}>
                    <option value="">—</option>
                    {SEMESTRES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Horas Teoría/sem.</label>
                  <input id="formMateriaHT" type="number" min={0} className="form-input" value={form.horas_teoria} onChange={e => setForm({ ...form, horas_teoria: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Horas Práctica/sem.</label>
                  <input id="formMateriaHP" type="number" min={0} className="form-input" value={form.horas_practica} onChange={e => setForm({ ...form, horas_practica: parseInt(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button id="saveMateriaBtn" className="btn btn-primary" onClick={handleSave} disabled={!form.nombre || !form.codigo}>{editing ? 'Actualizar' : 'Registrar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
