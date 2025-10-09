#!/bin/bash

# Script para iniciar el backend con las variables de entorno del archivo .env

# Cargar variables de entorno desde el archivo .env en el directorio padre
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | grep -v '^$' | xargs)
    echo "Variables de entorno cargadas desde ../.env"
else
    echo "ERROR: No se encontró el archivo .env"
    exit 1
fi

# Iniciar Spring Boot
echo "Iniciando backend de DeporTur..."
mvn spring-boot:run
