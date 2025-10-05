package com.deportur.repository;

import com.deportur.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Migrado de ClienteDAO.buscarPorDocumento()
    Optional<Cliente> findByDocumento(String documento);

    // Migrado de ClienteDAO.buscarPorNombreOApellido()
    List<Cliente> findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase(String nombre, String apellido);
}
