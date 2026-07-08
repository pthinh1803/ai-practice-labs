#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// =====================================================
// FIREBASE PROJECT
// =====================================================
String baseURL = "https://doan1oit-default-rtdb.asia-southeast1.firebasedatabase.app";

// =====================================================
// WIFI
// =====================================================
#define WIFI_SSID     "Huong"
#define WIFI_PASSWORD "12345679"

// =====================================================
// PIN ESP32 WROOM-32 / DEVKIT V1
// =====================================================
#define DHTPIN        23
#define DHTTYPE       DHT11

// LDR dùng chân DO digital
#define LDR_PIN       34

// Độ ẩm đất dùng chân AO analog
#define SOIL_PIN      35

#define FAN_PIN       26
#define PUMP_PIN      27
#define LIGHT_PIN     17

#define SDA_PIN       21
#define SCL_PIN       22

#define LCD_ADDR      0x27
#define LCD_COLS      16
#define LCD_ROWS      2

// =====================================================
// CẤU HÌNH CẢM BIẾN
// =====================================================
// LDR digital:
// Theo log hiện tại của bạn: LDR = 0 thì Lux = 100000
// Nghĩa là LDR_DO = 0 đang được hiểu là sáng
// Nếu sau này bị ngược sáng/tối thì đổi HIGH thành LOW
#define LDR_DARK_LEVEL HIGH

// Soil analog:
// Bạn đo khi đưa vào nước: SoilADC khoảng 660 - 837
// Nên lấy 750 làm mốc ướt
// Khi để khô trước đó khoảng 1350 - 1800
// Nên lấy 1700 làm mốc khô
#define SOIL_DRY_ADC   1700
#define SOIL_WET_ADC   750

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

// =====================================================
// BIẾN HỆ THỐNG
// =====================================================
bool fanOn = false;
bool pumpOn = false;
bool lightOn = false;

bool fanAuto = true;
bool pumpAuto = true;
bool lightAuto = true;

float tempThreshold = 32.0;
int soilThreshold = 40;
int lightThreshold = 500;

float lastTemp = 0.0;
float lastHum = 0.0;

int lastLdr = 0;
int lastLux = 0;

int lastSoilADC = 0;
int lastSoilPercent = 0;

float lastPh = 7.0;

unsigned long lastSensor = 0;
unsigned long lastFbRead = 0;
unsigned long lastFbSend = 0;
unsigned long lastLcdSwitch = 0;

uint8_t lcdPage = 0;

const unsigned long SENSOR_MS = 2000;
const unsigned long FBREAD_MS = 1000;
const unsigned long FBSEND_MS = 3000;
const unsigned long LCD_SWITCH_MS = 4000;

// =====================================================
// FIREBASE HTTP
// =====================================================
String firebaseGET(String path) {
  if (WiFi.status() != WL_CONNECTED) return "";

  HTTPClient http;
  String url = baseURL + path + ".json";

  http.begin(url);
  int httpCode = http.GET();

  String payload = "";

  if (httpCode > 0) {
    payload = http.getString();
    payload.replace("\"", "");
  }

  http.end();
  return payload;
}

bool firebasePUT(String path, String data) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = baseURL + path + ".json";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.PUT(data);

  Serial.print("PUT ");
  Serial.print(path);
  Serial.print(" code: ");
  Serial.println(httpCode);

  http.end();

  return httpCode == 200;
}

// =====================================================
// HÀM HỖ TRỢ
// =====================================================
float getRandomPh() {
  float smallDelta = random(-12, 13) / 100.0f;
  float next = lastPh + smallDelta;

  if (random(0, 100) < 12) {
    float bigDelta = random(100, 181) / 100.0f;
    next = lastPh + (random(0, 2) == 0 ? -bigDelta : bigDelta);
  }

  return constrain(next, 6.0, 8.0);
}

void controlDevice(int pin, bool state) {
  digitalWrite(pin, state ? HIGH : LOW);
}

void lcdPrintRow(uint8_t row, const String &text) {
  lcd.setCursor(0, row);
  String padded = text;
  while (padded.length() < LCD_COLS) padded += ' ';
  lcd.print(padded.substring(0, LCD_COLS));
}

// Đọc trung bình ADC để giá trị đất ổn định hơn
int readSoilADC() {
  long sum = 0;
  const int samples = 20;

  for (int i = 0; i < samples; i++) {
    sum += analogRead(SOIL_PIN);
    delay(2);
  }

  return sum / samples;
}

// Quy đổi ADC đất sang phần trăm
// Cảm biến của bạn: ADC cao = khô, ADC thấp = ướt
int soilADCToPercent(int adc) {
  int percent = map(adc, SOIL_DRY_ADC, SOIL_WET_ADC, 0, 100);
  percent = constrain(percent, 0, 100);
  return percent;
}

void updateLCD() {
  if (lcdPage % 3 == 0) {
    lcdPrintRow(0, "T:" + String(lastTemp, 1) + "C H:" + String((int)lastHum) + "%");
    lcdPrintRow(1, "L:" + String(lastLux / 1000) + "k Soil:" + String(lastSoilPercent) + "%");
  }
  else if (lcdPage % 3 == 1) {
    lcdPrintRow(0, "LDR:" + String(lastLdr));
    lcdPrintRow(1, "ADC:" + String(lastSoilADC) + " pH:" + String(lastPh, 1));
  }
  else {
    lcdPrintRow(0, "F:" + String(fanOn ? "ON " : "OFF") +
                   " P:" + String(pumpOn ? "ON " : "OFF"));
    lcdPrintRow(1, "LIGHT:" + String(lightOn ? "ON " : "OFF"));
  }
}

// =====================================================
// ĐỌC FIREBASE: MODE, THRESHOLD, MANUAL
// =====================================================
void readFirebaseControl() {
  String val;

  val = firebaseGET("/plant_iot/mode/fan_auto");
  if (val == "true") fanAuto = true;
  else if (val == "false") fanAuto = false;

  val = firebaseGET("/plant_iot/mode/pump_auto");
  if (val == "true") pumpAuto = true;
  else if (val == "false") pumpAuto = false;

  val = firebaseGET("/plant_iot/mode/light_auto");
  if (val == "true") lightAuto = true;
  else if (val == "false") lightAuto = false;

  // Chi doc nguong khi thiet bi dang o che do tu dong. O che do thu cong,
  // trang thai chi phu thuoc vao /control va hoan toan khong xet nguong.
  if (fanAuto) {
    val = firebaseGET("/plant_iot/threshold/temp");
    if (val != "" && val != "null") tempThreshold = val.toFloat();
  }

  if (pumpAuto) {
    val = firebaseGET("/plant_iot/threshold/soil");
    if (val != "" && val != "null") soilThreshold = val.toInt();
  }

  if (lightAuto) {
    val = firebaseGET("/plant_iot/threshold/light");
    if (val != "" && val != "null") lightThreshold = val.toInt();
  }

  bool manualFan = fanOn;
  bool manualPump = pumpOn;
  bool manualLight = lightOn;

  val = firebaseGET("/plant_iot/control/fan");
  if (val == "true") manualFan = true;
  else if (val == "false") manualFan = false;

  val = firebaseGET("/plant_iot/control/pump");
  if (val == "true") manualPump = true;
  else if (val == "false") manualPump = false;

  val = firebaseGET("/plant_iot/control/light");
  if (val == "true") manualLight = true;
  else if (val == "false") manualLight = false;

  // =====================================================
  // AUTO CONTROL
  // =====================================================
  if (fanAuto) {
    fanOn = lastTemp >= tempThreshold;
  } else {
    fanOn = manualFan;
  }

  // Đất khô thì phần trăm thấp, dưới ngưỡng thì bật bơm
  if (pumpAuto) {
    pumpOn = lastSoilPercent <= soilThreshold;
  } else {
    pumpOn = manualPump;
  }

  // Trời tối thì Lux thấp, dưới ngưỡng thì bật đèn
  if (lightAuto) {
    lightOn = lastLux <= lightThreshold;
  } else {
    lightOn = manualLight;
  }

  controlDevice(FAN_PIN, fanOn);
  controlDevice(PUMP_PIN, pumpOn);
  controlDevice(LIGHT_PIN, lightOn);

  firebasePUT("/plant_iot/status/fan", fanOn ? "true" : "false");
  firebasePUT("/plant_iot/status/pump", pumpOn ? "true" : "false");
  firebasePUT("/plant_iot/status/light", lightOn ? "true" : "false");
}

// =====================================================
// GỬI SENSOR LÊN FIREBASE
// =====================================================
void sendSensorToFirebase() {
  String jsonData = "{";
  jsonData += "\"temp\":" + String(lastTemp, 1) + ",";
  jsonData += "\"hum\":" + String(lastHum, 0) + ",";

  jsonData += "\"ldr\":" + String(lastLdr) + ",";
  jsonData += "\"lux\":" + String(lastLux) + ",";

  jsonData += "\"soil_adc\":" + String(lastSoilADC) + ",";
  jsonData += "\"soil_percent\":" + String(lastSoilPercent) + ",";

  jsonData += "\"ph\":" + String(lastPh, 2);
  jsonData += "}";

  firebasePUT("/plant_iot/sensor", jsonData);
}

// =====================================================
// SETUP
// =====================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n--- ESP32 IoT Nong Nghiep HTTP DHT11 ---");

  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);

  pinMode(LDR_PIN, INPUT);
  pinMode(SOIL_PIN, INPUT);

  // Cấu hình ADC ESP32
  analogReadResolution(12);
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);

  controlDevice(FAN_PIN, false);
  controlDevice(PUMP_PIN, false);
  controlDevice(LIGHT_PIN, false);

  randomSeed(esp_random());

  dht.begin();

  Wire.begin(SDA_PIN, SCL_PIN);
  lcd.init();
  lcd.backlight();

  lcdPrintRow(0, "ESP32 IoT");
  lcdPrintRow(1, "Starting...");

  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    lcdPrintRow(0, "WiFi connecting");
  }

  Serial.println();
  Serial.println("WiFi OK");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcdPrintRow(0, "WiFi OK");
  lcdPrintRow(1, "Firebase HTTP");
  delay(1500);

  // Khong ghi lai mode va threshold o day. Cac gia tri tren Firebase phai
  // duoc giu nguyen sau khi ESP32 khoi dong lai de che do thu cong doc lap.
}

// =====================================================
// LOOP
// =====================================================
void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED) {
    lcdPrintRow(0, "WiFi lost");
    lcdPrintRow(1, "Reconnecting...");
    WiFi.reconnect();
    delay(1000);
    return;
  }

  if (now - lastSensor >= SENSOR_MS) {
    lastSensor = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // =====================================================
    // ĐỌC LDR DIGITAL
    // =====================================================
    int ldrDO = digitalRead(LDR_PIN);
    bool isDark = (ldrDO == LDR_DARK_LEVEL);

    // Tối = 0 lux, sáng = 100000 lux giả lập
    int lux = isDark ? 0 : 100000;

    // =====================================================
    // ĐỌC ĐỘ ẨM ĐẤT ANALOG
    // =====================================================
    int soilADC = readSoilADC();
    int soilPercent = soilADCToPercent(soilADC);

    if (!isnan(t) && !isnan(h)) {
      lastTemp = t;
      lastHum = h;

      lastLdr = ldrDO;
      lastLux = lux;

      lastSoilADC = soilADC;
      lastSoilPercent = soilPercent;

      lastPh = getRandomPh();

      Serial.printf("T: %.1f C | H: %.0f %% | LDR:%d | Lux:%d | SoilADC:%d | Soil:%d%% | pH:%.2f\n",
                    lastTemp,
                    lastHum,
                    lastLdr,
                    lastLux,
                    lastSoilADC,
                    lastSoilPercent,
                    lastPh);
    } else {
      Serial.println("DHT11 Read Error!");
      lcdPrintRow(0, "DHT11 Error!");
      lcdPrintRow(1, "Check GPIO23");
    }
  }

  if (now - lastFbRead >= FBREAD_MS) {
    lastFbRead = now;
    readFirebaseControl();
  }

  if (now - lastFbSend >= FBSEND_MS) {
    lastFbSend = now;
    sendSensorToFirebase();
  }

  if (now - lastLcdSwitch >= LCD_SWITCH_MS) {
    lastLcdSwitch = now;
    lcdPage++;
    updateLCD();
  }
}
