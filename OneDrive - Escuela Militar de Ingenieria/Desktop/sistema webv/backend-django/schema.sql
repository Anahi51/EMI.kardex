-- ================================================================
-- SCRIPT SQL - Sistema Kardex Digital EMI con Blockchain
-- Base de datos: PostgreSQL
-- Password pgAdmin4: 12345
-- ================================================================

-- Crear base de datos (ejecutar como superusuario)
-- CREATE DATABASE emi_kardex_db;

-- ================================================================
-- EXTENSIONES
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABLA: Usuarios del Sistema
-- ================================================================
CREATE TABLE IF NOT EXISTS auth_usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(254),
    nombre VARCHAR(200) NOT NULL,
    password VARCHAR(128) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'ESTUDIANTE'
        CHECK (rol IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE', 'SECRETARIA', 'AUDITOR')),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
);

-- ================================================================
-- TABLA: Carreras EMI
-- ================================================================
CREATE TABLE IF NOT EXISTS carreras (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    duracion_semestres INTEGER DEFAULT 10,
    activa BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- TABLA: Estudiantes
-- ================================================================
CREATE TABLE IF NOT EXISTS estudiantes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES auth_usuarios(id) ON DELETE SET NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    ci VARCHAR(20) UNIQUE,
    carrera_id BIGINT NOT NULL REFERENCES carreras(id),
    semestre_actual VARCHAR(10),
    grado VARCHAR(20) DEFAULT 'CADETE'
        CHECK (grado IN ('CADETE', 'SUBTENIENTE', 'TENIENTE', 'CAPITAN')),
    email VARCHAR(254),
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'ACTIVO'
        CHECK (estado IN ('ACTIVO', 'BAJA', 'EGRESADO', 'SUSPENDIDO')),
    fecha_ingreso DATE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- TABLA: Docentes
-- ================================================================
CREATE TABLE IF NOT EXISTS docentes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES auth_usuarios(id) ON DELETE SET NULL,
    ci VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    especialidad VARCHAR(200),
    grado_academico VARCHAR(50),
    email VARCHAR(254),
    activo BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- TABLA: Materias
-- ================================================================
CREATE TABLE IF NOT EXISTS materias (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    carrera_id BIGINT NOT NULL REFERENCES carreras(id),
    semestre VARCHAR(10),
    creditos INTEGER DEFAULT 3,
    horas_teoria INTEGER DEFAULT 2,
    horas_practica INTEGER DEFAULT 1,
    activa BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- TABLA: Gestiones Académicas (Semestres)
-- ================================================================
CREATE TABLE IF NOT EXISTS gestiones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PLANIFICADO'
        CHECK (estado IN ('PLANIFICADO', 'ACTIVO', 'CERRADO'))
);

-- ================================================================
-- TABLA: Calificaciones (Kardex) - CON HASH BLOCKCHAIN
-- ================================================================
CREATE TABLE IF NOT EXISTS calificaciones (
    id BIGSERIAL PRIMARY KEY,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    materia_id BIGINT NOT NULL REFERENCES materias(id),
    gestion_id BIGINT NOT NULL REFERENCES gestiones(id),
    docente_id BIGINT REFERENCES docentes(id) ON DELETE SET NULL,

    -- Notas
    nota_parcial1 FLOAT CHECK (nota_parcial1 >= 0 AND nota_parcial1 <= 100),
    nota_parcial2 FLOAT CHECK (nota_parcial2 >= 0 AND nota_parcial2 <= 100),
    nota_examen_final FLOAT CHECK (nota_examen_final >= 0 AND nota_examen_final <= 100),
    nota_recuperacion FLOAT CHECK (nota_recuperacion >= 0 AND nota_recuperacion <= 100),
    nota_final FLOAT CHECK (nota_final >= 0 AND nota_final <= 100),

    estado VARCHAR(20) DEFAULT 'PENDIENTE'
        CHECK (estado IN ('APROBADO', 'REPROBADO', 'PENDIENTE')),

    -- Blockchain
    hash_blockchain VARCHAR(64),
    bloque_index INTEGER,
    timestamp_blockchain TIMESTAMP WITH TIME ZONE,

    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (estudiante_id, materia_id, gestion_id)
);

-- ================================================================
-- TABLA: Bloques Blockchain
-- ================================================================
CREATE TABLE IF NOT EXISTS bloques_blockchain (
    id BIGSERIAL PRIMARY KEY,
    index INTEGER UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB NOT NULL,
    hash_previo VARCHAR(64) NOT NULL,
    hash_actual VARCHAR(64) UNIQUE NOT NULL,
    nonce INTEGER DEFAULT 0,
    calificacion_id BIGINT REFERENCES calificaciones(id) ON DELETE SET NULL
);

-- ================================================================
-- TABLA: Certificados Digitales
-- ================================================================
CREATE TABLE IF NOT EXISTS certificados (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    estudiante_id BIGINT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('HISTORIAL_ACADEMICO', 'NOTA_ESPECIFICA', 'EGRESO', 'APROBACION')),
    emitido_por VARCHAR(200) DEFAULT 'Secretaría EMI',
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hash_blockchain VARCHAR(64),
    qr_code VARCHAR(200),
    archivo_pdf VARCHAR(200),
    vigente BOOLEAN DEFAULT TRUE
);

-- ================================================================
-- TABLA: Audit Log
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES auth_usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(50) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id VARCHAR(50),
    descripcion TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'INFO'
        CHECK (tipo IN ('INFO', 'WRITE', 'READ', 'CHAIN', 'ERROR', 'AUTH')),
    ip_address INET,
    hash_registro VARCHAR(64),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    datos_extra JSONB
);

-- ================================================================
-- ÍNDICES para rendimiento
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_calificaciones_estudiante ON calificaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_gestion ON calificaciones(gestion_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_hash ON calificaciones(hash_blockchain);
CREATE INDEX IF NOT EXISTS idx_bloques_hash ON bloques_blockchain(hash_actual);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(codigo);
CREATE INDEX IF NOT EXISTS idx_audit_fecha ON audit_log(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id);

-- ================================================================
-- DATOS INICIALES - EMI
-- ================================================================

-- Carreras de la EMI
INSERT INTO carreras (nombre, codigo, duracion_semestres) VALUES
    ('Ingeniería de Sistemas', 'IS', 10),
    ('Ingeniería Civil', 'IC', 10),
    ('Ingeniería Electrónica', 'IE', 10),
    ('Ingeniería Industrial', 'IND', 10),
    ('Ingeniería Mecánica', 'IM', 10)
ON CONFLICT (codigo) DO NOTHING;

-- Gestiones académicas
INSERT INTO gestiones (codigo, nombre, fecha_inicio, fecha_fin, estado) VALUES
    ('1/2024', 'Primer Semestre 2024', '2024-02-01', '2024-06-30', 'ACTIVO'),
    ('2/2023', 'Segundo Semestre 2023', '2023-08-01', '2023-12-15', 'CERRADO'),
    ('1/2023', 'Primer Semestre 2023', '2023-02-01', '2023-06-30', 'CERRADO')
ON CONFLICT (codigo) DO NOTHING;

-- Usuarios del sistema (contraseñas se deben hashear con Django)
-- Usuario admin: admin12 / 1234567
-- Usuario docente: docente1 / doc123
-- Usuario estudiante: estudiante1 / est123

COMMENT ON TABLE calificaciones IS 'Kardex Digital - Cada registro está vinculado a un bloque blockchain';
COMMENT ON TABLE bloques_blockchain IS 'Cadena de bloques SHA-256 para inmutabilidad de registros';
COMMENT ON COLUMN calificaciones.hash_blockchain IS 'Hash SHA-256 del registro de calificación';

-- ================================================================
-- VISTA: Kardex por estudiante
-- ================================================================
CREATE OR REPLACE VIEW vista_kardex AS
SELECT
    e.codigo AS codigo_estudiante,
    e.nombre AS estudiante,
    c_n.nombre AS carrera,
    g.codigo AS gestion,
    m.codigo AS codigo_materia,
    m.nombre AS materia,
    m.creditos,
    cal.nota_parcial1 AS p1,
    cal.nota_parcial2 AS p2,
    cal.nota_examen_final AS examen,
    cal.nota_final AS final,
    cal.estado,
    d.nombre AS docente,
    cal.hash_blockchain AS hash
FROM calificaciones cal
JOIN estudiantes e ON cal.estudiante_id = e.id
JOIN carreras c_n ON e.carrera_id = c_n.id
JOIN gestiones g ON cal.gestion_id = g.id
JOIN materias m ON cal.materia_id = m.id
LEFT JOIN docentes d ON cal.docente_id = d.id
ORDER BY e.codigo, g.codigo, m.codigo;
