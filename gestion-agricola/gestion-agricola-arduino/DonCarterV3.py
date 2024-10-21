import serial
import json
from pymongo import MongoClient
from datetime import datetime

puerto_serial = 'COM3'
velocidad_baudios = 9600
ser = serial.Serial(puerto_serial, velocidad_baudios)


client = MongoClient('mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['test']
coleccion_sensores = db['sensores'] 
coleccion_historial = db['Hsensores']


ultimo_registro = coleccion_sensores.find_one(sort=[('_id', -1)])
if ultimo_registro:
    ultima_temperatura = ultimo_registro.get('temperatura', None)
    ultima_humedad = ultimo_registro.get('humedad', None)
    ultimo_id = ultimo_registro['_id']
else:
    ultima_temperatura = None
    ultima_humedad = None
    ultimo_id = None

try:
    while True:
        if ser.in_waiting > 0:
            linea = ser.readline().decode('utf-8').strip()
            print("Datos recibidos: ", linea)
            
            try:
                datos = json.loads(linea)
                datos['temperatura'] = float(datos['temperatura'])
                datos['humedad'] = float(datos['humedad'])
                datos['fecha_evento'] = datetime.now() 

                if (datos['temperatura'] != ultima_temperatura) or (datos['humedad'] != ultima_humedad):
                    if ultimo_id:
                        coleccion_sensores.update_one({'_id': ultimo_id}, {'$set': datos})
                        print("Datos actualizados en MongoDB con el ID:", ultimo_id)
                    else:
                        resultado = coleccion_sensores.insert_one(datos)
                        ultimo_id = resultado.inserted_id
                        print("Primeros datos enviados a MongoDB con el ID:", ultimo_id)

                    coleccion_historial.insert_one(datos)
                    print("Historial actualizado con nuevo cambio.")

                    ultima_temperatura = datos['temperatura']
                    ultima_humedad = datos['humedad']
                else:
                    print("No hay cambios en la temperatura o humedad. Datos no actualizados.")

            except json.JSONDecodeError:
                print("Error al decodificar JSON:", linea)
            except ValueError:
                print("Error al convertir a número:", linea)

except KeyboardInterrupt:
    print("Interrupción manual, cerrando conexión.")

finally:
    ser.close()
    client.close()
