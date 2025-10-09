package com.deportur.repository;

import com.deportur.model.PoliticaPrecio;
import com.deportur.model.enums.TipoPolitica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PoliticaPrecioRepository extends JpaRepository<PoliticaPrecio, Long> {

    /**
     * Busca políticas activas por tipo
     */
    List<PoliticaPrecio> findByTipoPoliticaAndActivoTrue(TipoPolitica tipoPolitica);

    /**
     * Busca todas las políticas activas
     */
    List<PoliticaPrecio> findByActivoTrue();

    /**
     * Busca políticas activas aplicables en una fecha específica
     * Una política es aplicable si:
     * - Está activa
     * - La fecha está entre fecha_inicio y fecha_fin (o esos campos son NULL)
     */
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND (p.fechaInicio IS NULL OR p.fechaInicio <= :fecha) " +
           "AND (p.fechaFin IS NULL OR p.fechaFin >= :fecha)")
    List<PoliticaPrecio> findPoliticasAplicablesEnFecha(@Param("fecha") LocalDate fecha);

    /**
     * Busca políticas activas de un tipo específico aplicables en una fecha
     */
    @Query("SELECT p FROM PoliticaPrecio p WHERE p.activo = true " +
           "AND p.tipoPolitica = :tipo " +
           "AND (p.fechaInicio IS NULL OR p.fechaInicio <= :fecha) " +
           "AND (p.fechaFin IS NULL OR p.fechaFin >= :fecha)")
    List<PoliticaPrecio> findPoliticasPorTipoYFecha(
        @Param("tipo") TipoPolitica tipo,
        @Param("fecha") LocalDate fecha
    );
}
