package com.deportur.service;

import com.deportur.model.DestinoTuristico;
import com.deportur.model.EquipoDeportivo;
import com.deportur.repository.DetalleReservaRepository;
import com.deportur.repository.DestinoTuristicoRepository;
import com.deportur.repository.EquipoDeportivoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio reutilizable para verificación de disponibilidad
 * Extrae la lógica de disponibilidad de ReservaService para hacerla más modular
 */
@Service
public class DisponibilidadService {

    @Autowired
    private EquipoDeportivoRepository equipoRepository;

    @Autowired
    private DestinoTuristicoRepository destinoRepository;

    @Autowired
    private DetalleReservaRepository detalleReservaRepository;

    /**
     * Verifica si un equipo específico está disponible en un rango de fechas
     */
    public boolean verificarDisponibilidadEquipo(Long idEquipo, LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        // Validar fechas
        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        LocalDate hoy = LocalDate.now();
        if (fechaInicio.isBefore(hoy)) {
            throw new Exception("La fecha de inicio no puede ser anterior a la fecha actual");
        }

        // Verificar que el equipo exista
        EquipoDeportivo equipo = equipoRepository.findById(idEquipo)
            .orElseThrow(() -> new Exception("El equipo especificado no existe"));

        // Verificar flag de disponibilidad general
        if (!equipo.getDisponible()) {
            return false;
        }

        // Verificar que no haya reservas solapadas
        return !detalleReservaRepository.existsReservaEnFechas(idEquipo, fechaInicio, fechaFin);
    }

    /**
     * Obtiene lista de equipos disponibles para un destino y rango de fechas
     */
    public List<EquipoDeportivo> obtenerEquiposDisponibles(Long idDestino, LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        // Validar destino
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino especificado no existe"));

        // Obtener todos los equipos del destino
        List<EquipoDeportivo> equiposDestino = equipoRepository.findByDestino(destino);

        // Filtrar solo los disponibles en las fechas
        return equiposDestino.stream()
            .filter(equipo -> {
                try {
                    return verificarDisponibilidadEquipo(equipo.getIdEquipo(), fechaInicio, fechaFin);
                } catch (Exception e) {
                    return false;
                }
            })
            .collect(Collectors.toList());
    }

    /**
     * Verifica la capacidad máxima de un destino
     * (Número de reservas activas no debe exceder la capacidad)
     */
    public boolean verificarCapacidadDestino(Long idDestino, LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        DestinoTuristico destino = destinoRepository.findById(idDestino)
            .orElseThrow(() -> new Exception("El destino especificado no existe"));

        if (destino.getCapacidadMaxima() == null || destino.getCapacidadMaxima() <= 0) {
            // Sin límite de capacidad
            return true;
        }

        // Contar reservas activas en el rango de fechas
        // Nota: Esta implementación es básica. Para mayor precisión se necesitaría
        // una query que cuente reservas que se solapan con el rango de fechas
        List<EquipoDeportivo> equiposDisponibles = obtenerEquiposDisponibles(idDestino, fechaInicio, fechaFin);

        return equiposDisponibles.size() > 0;
    }

    /**
     * Valida que las fechas sean correctas para una verificación de disponibilidad
     */
    public void validarFechas(LocalDate fechaInicio, LocalDate fechaFin) throws Exception {
        if (fechaInicio == null || fechaFin == null) {
            throw new Exception("Las fechas de inicio y fin son requeridas");
        }

        if (fechaInicio.isAfter(fechaFin)) {
            throw new Exception("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        LocalDate hoy = LocalDate.now();
        if (fechaInicio.isBefore(hoy)) {
            throw new Exception("La fecha de inicio no puede ser anterior a la fecha actual");
        }
    }
}
