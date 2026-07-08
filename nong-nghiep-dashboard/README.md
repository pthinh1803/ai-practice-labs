# Greenhouse Dashboard

Dashboard HTML/CSS/JavaScript cho ESP32 trong file firmware duoc cung cap.

## Chay nhanh

Mo terminal tai thu muc nay va chay:

```powershell
python -m http.server 8080
```

Sau do truy cap `http://localhost:8080`.

Dashboard mac dinh ket noi den Firebase:

`https://doan1oit-default-rtdb.asia-southeast1.firebasedatabase.app`

Co the thay doi URL va chu ky cap nhat trong muc **Cai dat**.

## Cau truc Firebase

- `/plant_iot/sensor`: du lieu cam bien hien tai
- `/plant_iot/status`: trang thai thuc te cua quat, bom, den
- `/plant_iot/mode`: che do tu dong/thu cong
- `/plant_iot/control`: lenh bat/tat thu cong

Firmware chi ghi de gia tri sensor hien tai, vi vay dashboard lay mau va luu toi da 2.000 ban ghi trong `localStorage` cua trinh duyet de ve bieu do va xuat CSV.

## Che do dieu khien

- Tu dong: ESP32 dieu khien theo cac gia tri trong `/plant_iot/threshold`.
- Thu cong: dashboard cap nhat dong thoi `mode/*_auto = false` va `control/*`; ESP32 chi doc lenh `control` va bo qua nguong.
- Nap file `firmware/esp32_greenhouse.ino` de ESP32 khong tu ghi de che do va nguong moi khi khoi dong lai.
