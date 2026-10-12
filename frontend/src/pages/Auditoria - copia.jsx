import { Shield, CheckCircle, Edit2, Trash2, Eye, Hash, Clock, Filter } from 'lucide-react'

const ACTIONS = [
  { id: 1, accion: 'LOGIN', usuario: 'admin', rol: 'Administrador', ip: '192.168.1.10', entidad: 'AUTH', descripcion: 'Inicio de sesión exitoso', hash: 'a3f4e2b1...', fecha: '2024-05-27 08:15:23', tipo: 'INFO' },
  { id: 2, accion: 'CREATE', usuario: 'docente1', rol: 'Docente', ip: '192.168.1.25', entidad: 'CALIFICACION', descripcion: 'Registro de nota: Mamani J. - Cálculo I - 78 pts', hash: 'b7c9d1e5...', fecha: '2024-05-27 09:30:45', tipo: 'WRITE' },
  { id: 3, accion: 'BLOCKCHAIN_MINE', usuario: 'Sistema', rol: 'Sistema', ip: 'localhost', entidad: 'BLOCKCHAIN', descripcion: 'Bloque #4328 minado y añadido a la cadena', hash: 'c2a8f3b4...', fecha: '2024-05-27 09:31:02', tipo: 'CHAIN' },
  { id: 4, accion: 'VERIFY', usuario: 'admin', rol: 'Administrador', ip: '192.168.1.10', entidad: 'CERTIFICADO', descripcion: 'Verificación de certificado CERT-EMI-2024-0001', hash: 'd1e5b2c8...', fecha: '2024-05-27 10:45:00', tipo: 'READ' },
  { id: 5, accion: 'UPDATE', usuario: 'docente1', rol: 'Docente', ip: '192.168.1.25', entidad: 'CALIFICACION', descripcion: 'Actualización de nota: García R. - Física II', hash: 'e9f3a1b5...', fecha: '2024-05-27 11:20:15', tipo: 'WRITE' },
  { id: 6, accion: 'GENERATE', usuario: 'secretaria1', rol: 'Secretaría', ip: '192.168.1.30', entidad: 'CERTIFICADO', descripcion: 'Emisión de certificado: López M. - Historial académico', hash: 'f1b3c5d7...', fecha: '2024-05-27 11:55:30', tipo: 'WRITE' },
  { id: 7, accion: 'CHAIN_VERIFY', usuario: 'admin', rol: 'Administrador', ip: '192.168.1.10', entidad: 'BLOCKCHAIN', descripcion: 'Verificación de integridad completa de la cadena — 4328 bloques válidos', hash: 'g2d4f6a8...', fecha: '2024-05-27 12:00:00', tipo: 'CHAIN' },
]

const TIPO_COLORS = {
  INFO: 'badge-muted',
  WRITE: 'badge-gold',
  CHAIN: 'badge-chain',
  READ: 'badge-blue',
  ERROR: 'badge-danger',
}

const ACCION_ICONS = {
  LOGIN: '🔐',
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  BLOCKCHAIN_MINE: '⛓️',
  CHAIN_VERIFY: '🛡️',
  VERIFY: '🔍',
  GENERATE: '📄',
}

export default function Auditoria() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de Auditoría</h1>
          <p className="page-subtitle">Registro completo de operaciones del sistema con trazabilidad blockchain</p>
        </div>
        <div className="flex gap-2">
          <div className="chain-status-badge valid">
            <div className="blockchain-dot" />
            Auditoría Activa
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Operaciones hoy', value: '127', color: 'text-gold', icon: '📋' },
          { label: 'Escrituras', value: '48', color: 'text-chain', icon: '✏️' },
          { label: 'Txs Blockchain', value: '23', color: 'text-chain', icon: '⛓️' },
          { label: 'Alertas', value: '0', color: 'text-danger', icon: '🚨' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className={`font-display font-bold ${s.color}`} style={{ fontSize: 22 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <div className="table-header">
          <Shield size={16} className="text-gold" />
          <span className="table-title">Registro de Auditoría</span>
          <span className="badge badge-muted">{ACTIONS.length}</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Acción</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Entidad</th>
                <th>Descripción</th>
                <th>Hash</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {ACTIONS.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={10} className="text-muted" />
                      <span className="font-mono" style={{ fontSize: 10 }}>{log.fecha}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12 }}>
                      {ACCION_ICONS[log.accion] || '🔧'} {log.accion}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 500 }}>{log.usuario}</td>
                  <td>
                    <span className="badge badge-muted" style={{ fontSize: 10 }}>{log.rol}</span>
                  </td>
                  <td>
                    <span className={`badge ${log.tipo === 'CHAIN' ? 'badge-chain' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                      {log.entidad}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 280 }}>{log.descripcion}</td>
                  <td>
                    <div className="hash-verify valid">
                      <Hash size={10} />
                      <span className="hash-text">{log.hash}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${TIPO_COLORS[log.tipo] || 'badge-muted'}`}>{log.tipo}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
