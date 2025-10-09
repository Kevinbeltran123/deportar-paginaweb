package com.deportur.dto.response;

import java.util.Map;

/**
 * Response para endpoint de métricas del dashboard (solo ADMIN)
 */
public class DashboardMetricasResponse {

    private Long totalClientes;
    private Long totalReservas;
    private Long totalEquipos;
    private Long totalDestinos;
    private Long reservasPendientes;
    private Long reservasConfirmadas;
    private Long reservasEnProgreso;
    private Long reservasFinalizadas;
    private Long reservasCanceladas;
    private Map<String, Long> reservasPorDestino;
    private Map<String, Long> clientesPorNivelFidelizacion;

    public DashboardMetricasResponse() {
    }

    // Getters y Setters
    public Long getTotalClientes() {
        return totalClientes;
    }

    public void setTotalClientes(Long totalClientes) {
        this.totalClientes = totalClientes;
    }

    public Long getTotalReservas() {
        return totalReservas;
    }

    public void setTotalReservas(Long totalReservas) {
        this.totalReservas = totalReservas;
    }

    public Long getTotalEquipos() {
        return totalEquipos;
    }

    public void setTotalEquipos(Long totalEquipos) {
        this.totalEquipos = totalEquipos;
    }

    public Long getTotalDestinos() {
        return totalDestinos;
    }

    public void setTotalDestinos(Long totalDestinos) {
        this.totalDestinos = totalDestinos;
    }

    public Long getReservasPendientes() {
        return reservasPendientes;
    }

    public void setReservasPendientes(Long reservasPendientes) {
        this.reservasPendientes = reservasPendientes;
    }

    public Long getReservasConfirmadas() {
        return reservasConfirmadas;
    }

    public void setReservasConfirmadas(Long reservasConfirmadas) {
        this.reservasConfirmadas = reservasConfirmadas;
    }

    public Long getReservasEnProgreso() {
        return reservasEnProgreso;
    }

    public void setReservasEnProgreso(Long reservasEnProgreso) {
        this.reservasEnProgreso = reservasEnProgreso;
    }

    public Long getReservasFinalizadas() {
        return reservasFinalizadas;
    }

    public void setReservasFinalizadas(Long reservasFinalizadas) {
        this.reservasFinalizadas = reservasFinalizadas;
    }

    public Long getReservasCanceladas() {
        return reservasCanceladas;
    }

    public void setReservasCanceladas(Long reservasCanceladas) {
        this.reservasCanceladas = reservasCanceladas;
    }

    public Map<String, Long> getReservasPorDestino() {
        return reservasPorDestino;
    }

    public void setReservasPorDestino(Map<String, Long> reservasPorDestino) {
        this.reservasPorDestino = reservasPorDestino;
    }

    public Map<String, Long> getClientesPorNivelFidelizacion() {
        return clientesPorNivelFidelizacion;
    }

    public void setClientesPorNivelFidelizacion(Map<String, Long> clientesPorNivelFidelizacion) {
        this.clientesPorNivelFidelizacion = clientesPorNivelFidelizacion;
    }
}
