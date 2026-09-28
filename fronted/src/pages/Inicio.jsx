export default function Inicio() {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ height: '70vh' }}>
            <h1 className="fw-bold" style={{ color: '#111827', fontSize: '3rem' }}>👋 Bienvenido</h1>
            <p className="text-muted fs-5 mt-3" style={{ maxWidth: '600px' }}>
                Seleccione un módulo en el menú lateral para comenzar a registrar consumos, gestionar departamentos o visualizar los reportes.
            </p>
        </div>
    );
}