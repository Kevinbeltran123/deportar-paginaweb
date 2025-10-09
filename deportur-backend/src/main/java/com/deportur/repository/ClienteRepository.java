package com.deportur.repository;

import com.deportur.model.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Migrado de ClienteDAO.buscarPorDocumento()
    @EntityGraph(attributePaths = "destinoPreferido")
    Optional<Cliente> findByDocumento(String documento);

    // Migrado de ClienteDAO.buscarPorNombreOApellido()
    @EntityGraph(attributePaths = "destinoPreferido")
    List<Cliente> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);

    @Override
    @EntityGraph(attributePaths = "destinoPreferido")
    List<Cliente> findAll();

    @Override
    @EntityGraph(attributePaths = "destinoPreferido")
    Optional<Cliente> findById(Long id);
}
