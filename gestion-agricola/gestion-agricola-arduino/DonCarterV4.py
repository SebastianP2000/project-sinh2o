import serial
import json
from pymongo import MongoClient
from datetime import datetime

puerto_serial = 'COM3'
velocidad_baudios = 9600
ser = serial.Serial(puerto_serial, velocidad_baudios)

# Configurar MongoDB
client = MongoClient('mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['test']
coleccion_sensores = db['sensores']  # Colección principal para la monitorización actual
coleccion_historial = db['Hsensores']  # Colección para guardar el historial

# Definir las posiciones posibles en orden
posiciones = [f"{columna}{fila}" for columna in "ABCD" for fila in range(1, 6)]

# Obtener la lista de posiciones ya ocupadas
posiciones_ocupadas = [sensor['identificador'] for sensor in coleccion_sensores.find({}, {'identificador': 1})]

# Función para obtener la siguiente posición disponible
def obtener_siguiente_posicion():
    for posicion in posiciones:
        if posicion not in posiciones_ocupadas:
            return posicion
    return None  # Devuelve None si no hay posiciones disponibles

try:
    while True:
        if ser.in_waiting > 0:
            linea = ser.readline().decode('utf-8').strip()
            print("Datos recibidos: ", linea)

            try:
                datos = json.loads(linea)

                # Asignar un sensor_id por defecto si no está presente
                if 'sensor_id' not in datos:
                    datos['sensor_id'] = 'sensor1'

                # Verificar si el sensor ya existe en la base de datos
                sensor_existente = coleccion_sensores.find_one({'sensor_id': datos['sensor_id']})

                if not sensor_existente:
                    nueva_posicion = obtener_siguiente_posicion()
                    if nueva_posicion:
                        datos['identificador'] = nueva_posicion
                        posiciones_ocupadas.append(nueva_posicion)
                        print(f"Asignada la posición {nueva_posicion} al nuevo sensor.")
                    else:
                        print("No hay posiciones disponibles.")
                        continue
                else:
                    datos['identificador'] = sensor_existente['identificador']

                    # Verificar si hay cambios en la temperatura o la humedad
                    ultima_temperatura = sensor_existente.get('temperatura')
                    ultima_humedad = sensor_existente.get('humedad')

                    if (datos['temperatura'] == ultima_temperatura) and (datos['humedad'] == ultima_humedad):
                        print("No hay cambios en los datos. No se actualiza el historial.")
                        continue  # No se guarda en `Hsensores`

                datos['temperatura'] = float(datos['temperatura'])
                datos['humedad'] = float(datos['humedad'])
                datos['fecha_evento'] = datetime.now()

                # Insertar o actualizar el sensor en la base de datos
                coleccion_sensores.update_one(
                    {'sensor_id': datos['sensor_id']},
                    {'$set': datos},
                    upsert=True
                )
                print("Datos insertados/actualizados en MongoDB.")

                # Guardar el cambio en la colección de historial solo si hubo un cambio
                coleccion_historial.insert_one(datos)
                print("Historial actualizado con nuevo cambio.")

            except json.JSONDecodeError:
                print("Error al decodificar JSON:", linea)
            except ValueError:
                print("Error al convertir a número:", linea)

except KeyboardInterrupt:
    print("Interrupción manual, cerrando conexión.")

finally:
    ser.close()
    client.close()
