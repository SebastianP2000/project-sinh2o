import serial
import json
from pymongo import MongoClient
from datetime import datetime, timezone

# Configuración del puerto serial
puerto_serial = 'COM3'
velocidad_baudios = 9600
ser = serial.Serial(puerto_serial, velocidad_baudios)

# Configuración de MongoDB
client = MongoClient('mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['test']
coleccion_sensores = db['sensores']  # Monitorización actual
coleccion_historial_sensores = db['Hsensores']  # Historial para sensores
coleccion_estanques = db['estanques']  # Datos de estanques
coleccion_historial_estanques = db['Hestanques']  # Historial para estanques
coleccion_cuadrantes = db['cuadrantes']  # Cuadrantes (sectores)
coleccion_historials = db['historials']  # Historial para eventos

# Definir las posiciones posibles en orden
posiciones = [f"{columna}{fila}" for columna in "ABCD" for fila in range(1, 6)]

# Función para formatear los datos del estanque
def formatear_datos_estanque(datos):
    return {
        "nombre": "Estanque 1",
        "capacidad_maxima": 14.5,  # Capacidad máxima fija
        "capacidad_actual": datos.get("capacidad_actual", 0),
        "estado_funcionamiento": True,  # Estado predeterminado
        "ultima_actualizacion": datetime.utcnow()
    }

# Función para obtener el sector correspondiente en la base de datos por nombre
def obtener_sector_por_nombre(nombre_sector):
    return coleccion_cuadrantes.find_one({"nombre": nombre_sector})

# Función para registrar eventos en el historial
def registrar_evento(tipo_evento, descripcion):
    # Formatear la fecha y hora al formato ISO 8601 con milisegundos y zona horaria
    fecha_evento = datetime.utcnow().isoformat() + "+00:00"
    
    evento = {
        "tipo_evento": tipo_evento,
        "descripcion": descripcion,
        "fecha_evento": fecha_evento
    }

    # Insertar el evento en la colección 'historials'
    coleccion_historials.insert_one(evento)
    print(f"Evento registrado en historial: {descripcion}")

try:
    while True:
        if ser.in_waiting > 0:
            linea = ser.readline().decode('utf-8').strip()
            print("Datos recibidos: ", linea)

            try:
                datos = json.loads(linea)

                # Verificar si el mensaje es un evento
                if 'tipo_evento' in datos:
                    tipo_evento = datos['tipo_evento']
                    descripcion = datos.get('descripcion', 'Descripción no disponible')
                    registrar_evento(tipo_evento, descripcion)
                else:
                    # Asignar un sensor_id por defecto si no está presente
                    if 'sensor_id' not in datos:
                        datos['sensor_id'] = 'sensor1'

                    # Obtener y asignar identificador del sector
                    sensor_existente = coleccion_sensores.find_one({'sensor_id': datos['sensor_id']})
                    if not sensor_existente:
                        nombre_sector = f"Sector {datos.get('identificador', 'A1')}"
                        sector = obtener_sector_por_nombre(nombre_sector)
                        if sector:
                            datos['identificador'] = nombre_sector
                            print(f"Sector asignado: {nombre_sector}")
                        else:
                            print(f"El sector {nombre_sector} no se encuentra.")
                            continue
                    else:
                        datos['identificador'] = sensor_existente['identificador']

                    # Preparar datos del sensor
                    datos['temperatura'] = float(datos['temperatura'])
                    datos['humedad'] = float(datos['humedad'])
                    datos['fecha_evento'] = datetime.now()

                    # Insertar o actualizar datos del sensor
                    coleccion_sensores.update_one(
                        {'sensor_id': datos['sensor_id']},
                        {'$set': datos},
                        upsert=True
                    )
                    print("Datos del sensor actualizados.")

                    # Guardar historial en `Hsensores`
                    historial_sensor = {
                        "temperatura": datos['temperatura'],
                        "humedad": datos['humedad'],
                        "sensor_id": datos['sensor_id'],
                        "identificador": datos['identificador'],
                        "fecha_evento": datos['fecha_evento']
                    }
                    coleccion_historial_sensores.insert_one(historial_sensor)
                    print("Historial del sensor actualizado.")

                    # Formatear datos para estanques
                    if 'capacidad_actual' in datos:
                        datos_estanque = formatear_datos_estanque(datos)
                        estanque_actual = coleccion_estanques.find_one({"nombre": datos_estanque["nombre"]})
                        if estanque_actual:
                            capacidad_anterior = estanque_actual.get("capacidad_actual", 0)
                            if capacidad_anterior != datos_estanque["capacidad_actual"]:
                                historial_estanque = {
                                    "nombre": estanque_actual['nombre'],
                                    "capacidad_maxima": estanque_actual['capacidad_maxima'],
                                    "capacidad_anterior": capacidad_anterior,
                                    "ultima_actualizacion": estanque_actual['ultima_actualizacion']
                                }
                                coleccion_historial_estanques.insert_one(historial_estanque)
                                coleccion_estanques.update_one(
                                    {'nombre': datos_estanque['nombre']},
                                    {'$set': datos_estanque},
                                    upsert=True
                                )
                                print(f"Capacidad del estanque actualizada: {datos_estanque['capacidad_actual']}.")
                        else:
                            coleccion_estanques.insert_one(datos_estanque)
                            print(f"Nuevo estanque registrado: {datos_estanque}.")
            except json.JSONDecodeError:
                print("Error al decodificar JSON.")
            except Exception as e:
                print("Error:", e)

except KeyboardInterrupt:
    print("Interrupción manual. Cerrando conexión.")
finally:
    ser.close()
    client.close()