#include <DHT.h>  // Librería del sensor DHT
#include <Wire.h> // Librería para comunicación I2C si se usa RTC

// Configuración del sensor DHT
#define DHTPIN 2        // Pin digital conectado al DHT11
#define DHTTYPE DHT11   // Tipo de sensor DHT
DHT dht(DHTPIN, DHTTYPE);

// Configuración del sensor de ultrasonidos HC-SR04
const int TRIG_PIN = 9;  // Pin de disparo (Trigger)
const int ECHO_PIN = 10; // Pin de eco (Echo)

// Configuración del solenoide, bomba y sensor de flujo
const int SOLENOIDE_PIN = 8; // Pin de control del solenoide
const int BOMBA_PIN = 7;     // Pin de control de la bomba (Módulo 4 del relé)
const int FLUJO_PIN = 3;     // Pin de señal del sensor de flujo

// Constantes para el nivel del agua
const float ALTURA_ESTANQUE = 33; // Altura total del estanque en cm
const float NIVEL_BAJO = 15.3;    // Nivel bajo (51%)
const float NIVEL_ALTO = 25.5;    // Nivel alto (90%)

// Configuración de temporizadores para cada bucle
unsigned long ultimaLecturaDHT = 0;
unsigned long ultimaLecturaUltrasonido = 0;
const unsigned long intervaloDHT = 2000;          // Intervalo de 2 segundos para el DHT
const unsigned long intervaloUltrasonido = 1000;  // Intervalo de 1 segundo para el HC-SR04
const unsigned long intervaloFlujo = 500;         // Intervalo de 500 ms para verificar flujo

bool solenoideAbierto = false; // Estado del solenoide

// ID del sensor (puedes cambiarlo según sea necesario)
String sensor_id = "sensor3"; // Este es el identificador del sensor

void setup() {
  // Inicialización de la comunicación serial
  Serial.begin(9600);
  
  // Inicialización del sensor DHT
  dht.begin();
  
  // Configuración de los pines del HC-SR04, solenoide, bomba y sensor de flujo
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(SOLENOIDE_PIN, OUTPUT);
  pinMode(BOMBA_PIN, OUTPUT);
  pinMode(FLUJO_PIN, INPUT);

  // Asegurar que solenoide y bomba estén inicialmente apagados
  digitalWrite(SOLENOIDE_PIN, LOW);
  digitalWrite(BOMBA_PIN, LOW);
}

void loop() {
  unsigned long tiempoActual = millis();

  // Lectura del sensor DHT cada 2 segundos
  if (tiempoActual - ultimaLecturaDHT >= intervaloDHT) {
    ultimaLecturaDHT = tiempoActual;
    
    float humedad = dht.readHumidity();
    float temperatura = dht.readTemperature();
    
    if (isnan(humedad) || isnan(temperatura)) {
      Serial.println("Error al leer el sensor DHT11");
    } else {
      String data = "{\"sensor_id\": \"" + sensor_id + "\", \"temperatura\": " + String(temperatura) + ", \"humedad\": " + String(humedad);
      
      // Lectura del sensor HC-SR04 cada 1 segundo
      if (tiempoActual - ultimaLecturaUltrasonido >= intervaloUltrasonido) {
        ultimaLecturaUltrasonido = tiempoActual;
        
        float distancia = medirDistancia();
        float alturaAgua = ALTURA_ESTANQUE - distancia; // Calcula la altura del agua
        
        if (alturaAgua < 0) alturaAgua = 0; // Asegura que no haya valores negativos
        
        float litros = calcularLitros(alturaAgua); // Calcula los litros según la altura
        
        // Agregar el dato de cantidad de agua en litros
        data += ", \"capacidad_actual\": " + String(litros) + "}";
        
        // Imprimir los datos con sensor_id
        Serial.println(data);
        
        // Control del solenoide y la bomba según el nivel de agua (invertido)
        if (litros >= (NIVEL_ALTO / ALTURA_ESTANQUE * 14.74)) { // Nivel alto de agua
          abrirSolenoide();   // Abre el solenoide cuando el nivel es alto
        } else if (litros <= (NIVEL_BAJO / ALTURA_ESTANQUE * 14.74)) { // Nivel bajo de agua
          cerrarSolenoide();  // Cierra el solenoide cuando el nivel es bajo
        }
      }
    }
  }

  // Verificar flujo de agua cada 500 ms si el solenoide está abierto
  if (solenoideAbierto && tiempoActual % intervaloFlujo < 50) {
    verificarFlujo();
  }

  delay(10); // Pequeña pausa opcional (sin bloquear el bucle)
}

// Función para medir la distancia usando el sensor HC-SR04
float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duracion = pulseIn(ECHO_PIN, HIGH);
  float distancia = duracion * 0.034 / 2; // Convierte el tiempo en cm

  return distancia;
}

// Función para calcular los litros según la altura
float calcularLitros(float altura) {
  if (altura <= 0) return 0;
  if (altura >= 33) return 14.74;

  // Usa una interpolación lineal basada en la tabla de datos
  float litros[] = {0.40, 0.80, 1.25, 1.75, 2.33, 3.00, 3.43, 3.87, 4.30, 4.74,
                    5.17, 5.61, 6.04, 6.48, 6.91, 7.35, 7.78, 8.22, 8.65, 9.09,
                    9.52, 9.96, 10.39, 10.83, 11.26, 11.70, 12.13, 12.57, 13.00, 13.44,
                    13.87, 14.30, 14.74};
  
  int index = (int)altura; // Toma la parte entera de la altura como índice
  float fraccion = altura - index; // Parte decimal para interpolar
  return litros[index - 1] + (litros[index] - litros[index - 1]) * fraccion;
}

// Función para abrir el solenoide
void abrirSolenoide() {
  digitalWrite(SOLENOIDE_PIN, HIGH); // Abre el solenoide
  digitalWrite(BOMBA_PIN, LOW);     // Asegura que la bomba esté apagada
  solenoideAbierto = true;
}

// Función para cerrar el solenoide
void cerrarSolenoide() {
  digitalWrite(SOLENOIDE_PIN, LOW); // Cierra el solenoide
  digitalWrite(BOMBA_PIN, HIGH);    // Enciende la bomba cuando se cierra el solenoide
  solenoideAbierto = false;
}

unsigned long ultimoErrorEnviado = 0; // Variable global para rastrear el último mensaje de error
const unsigned long intervaloError = 60000; // Intervalo de 1 minuto en milisegundos

// Función para verificar el flujo de agua
void verificarFlujo() {
  int flujo = digitalRead(FLUJO_PIN); // Leer el estado del sensor de flujo
  
  if (solenoideAbierto && flujo == LOW) { 
    unsigned long tiempoActual = millis();
    if (tiempoActual - ultimoErrorEnviado >= intervaloError) {
      // Detecta fallo si el solenoide está abierto y no hay flujo
      registrarEvento("error", "Fallo en el sistema, no se detecta flujo con el solenoide abierto");
      ultimoErrorEnviado = tiempoActual; // Actualiza el tiempo del último mensaje
    }
  }
}

// Función para registrar un evento
void registrarEvento(String tipo, String descripcion) {
  String evento = "{\"sensor_id\": \"" + sensor_id + "\", \"tipo_evento\": \"" + tipo + "\", \"descripcion\": \"" + descripcion + "\", \"fecha_evento\": \"" + String(millis()) + "\"}";
  Serial.println(evento);
}
