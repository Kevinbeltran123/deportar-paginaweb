package com.deportur.repository;

import com.deportur.model.PoliticaPrecio;
import com.deportur.model.enums.TipoPolitica;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PoliticaPrecioRepository extends JpaRepository<PoliticaPrecio, Long> {

    /**
     * Busca políticas activas por tipo
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    List<PoliticaPrecio> findByTipoPoliticaAndActivoTrue(TipoPolitica tipoPolitica);

    /**
     * Busca todas las políticas activas
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    List<PoliticaPrecio> findByActivoTrue();

    /**
     * Busca políticas activas aplicables en una fecha específica
     * Una política es aplicable si:
     * - Está activa
     * - La fecha está entre fecha_inicio y fecha_fin (o esos campos son NULL)
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND (p.fechaInicio IS NULL OR p.fechaInicio <= :fecha) " +
           "AND (p.fechaFin IS NULL OR p.fechaFin >= :fecha)")
    List<PoliticaPrecio> findPoliticasAplicablesEnFecha(@Param("fecha") LocalDate fecha);

    /**
     * Busca políticas activas de un tipo específico aplicables en una fecha
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND p.tipoPolitica = :tipo " +
           "AND (p.fechaInicio IS NULL OR p.fechaInicio <= :fecha) " +
           "AND (p.fechaFin IS NULL OR p.fechaFin >= :fecha)")
    List<PoliticaPrecio> findPoliticasPorTipoYFecha(
        @Param("tipo") TipoPolitica tipo,
        @Param("fecha") LocalDate fecha
    );

    /**
     * Busca políticas activas para un destino específico
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND (p.destino.idDestino = :destinoId OR p.destino IS NULL)")
    List<PoliticaPrecio> findPoliticasPorDestino(@Param("destinoId") Long destinoId);

    /**
     * Busca políticas activas para un tipo de equipo específico
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND (p.tipoEquipo.idTipo = :tipoEquipoId OR p.tipoEquipo IS NULL)")
    List<PoliticaPrecio> findPoliticasPorTipoEquipo(@Param("tipoEquipoId") Long tipoEquipoId);

    /**
     * Busca políticas activas para un equipo específico
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND (p.equipo.idEquipo = :equipoId OR p.equipo IS NULL)")
    List<PoliticaPrecio> findPoliticasPorEquipo(@Param("equipoId") Long equipoId);

    /**
     * Busca políticas aplicables con filtros combinados
     * Permite buscar por tipo, fecha, destino, tipo de equipo y equipo específico
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND (:tipo IS NULL OR p.tipoPolitica = :tipo) " +
           "AND (:fecha IS NULL OR (p.fechaInicio IS NULL OR p.fechaInicio <= :fecha)) " +
           "AND (:fecha IS NULL OR (p.fechaFin IS NULL OR p.fechaFin >= :fecha)) " +
           "AND (:destinoId IS NULL OR p.destino.idDestino = :destinoId OR p.destino IS NULL) " +
           "AND (:tipoEquipoId IS NULL OR p.tipoEquipo.idTipo = :tipoEquipoId OR p.tipoEquipo IS NULL) " +
           "AND (:equipoId IS NULL OR p.equipo.idEquipo = :equipoId OR p.equipo IS NULL)")
    List<PoliticaPrecio> findPoliticasAplicablesConFiltros(
        @Param("tipo") TipoPolitica tipo,
        @Param("fecha") LocalDate fecha,
        @Param("destinoId") Long destinoId,
        @Param("tipoEquipoId") Long tipoEquipoId,
        @Param("equipoId") Long equipoId
    );

    /**
     * Busca políticas vigentes en un rango de fechas
     */
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND ((p.fechaInicio IS NULL AND p.fechaFin IS NULL) " +
           "OR (p.fechaInicio IS NULL AND p.fechaFin >= :fechaInicio) " +
           "OR (p.fechaFin IS NULL AND p.fechaInicio <= :fechaFin) " +
           "OR (p.fechaInicio <= :fechaFin AND p.fechaFin >= :fechaInicio))")
    List<PoliticaPrecio> findPoliticasEnRangoFechas(
        @Param("fechaInicio") LocalDate fechaInicio,
        @Param("fechaFin") LocalDate fechaFin
    );

    @Override
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    List<PoliticaPrecio> findAll();

    @Override
    @EntityGraph(attributePaths = {"destino", "tipoEquipo", "equipo"})
    Optional<PoliticaPrecio> findById(Long id);
}
