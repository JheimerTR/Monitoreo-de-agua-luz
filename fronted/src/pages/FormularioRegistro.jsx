import { useState } from 'react';

function FormularioRegistro() {
    const [servicio, setServicio] = useState('Agua');

    return (
        <form>
            <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
                <option value="Agua">Servicio de Agua</option>
                <option value="Luz">Servicio de Energía Eléctrica</option>
            </select>

            {/* El texto cambia automáticamente entre m³ y kWh */}
            <label>
                Ingrese la lectura en {servicio === 'Agua' ? 'Metros Cúbicos (m³)' : 'Kilovatios hora (kWh)'}:
            </label>
            <input type="number" placeholder={servicio === 'Agua' ? 'Ej: 14.5' : 'Ej: 150'} />
            
            <button type="submit">Guardar Registro</button>
        </form>
    );
}
export default FormularioRegistro;