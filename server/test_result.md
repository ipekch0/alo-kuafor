# Test Results

[2025-12-20T07:59:40.300Z] --- Starting AI Flow Test (MOCKED DB) ---

[2025-12-20T07:59:40.303Z] 
Step 1: User asks for availability

[2025-12-20T07:59:43.943Z] AI Response:
"Evet, 2025-12-20 tarihinde saat 10:59'da saç kesimi için yerimiz müsait. Randevunuzu oluşturmak için lütfen Adınızı, Soyadınızı ve E-posta adresinizi yazar mısınız?"

[2025-12-20T07:59:43.945Z] 
Step 2: User provides details

[2025-12-20T07:59:45.893Z] MOCK DB: Creating Customer
{
  "data": {
    "name": "Ahmet Yılmaz",
    "phone": "905551234567",
    "email": "ahmet@test.com"
  }
}

[2025-12-20T07:59:45.894Z] MOCK DB: Creating Appointment
{
  "data": {
    "salonId": 1,
    "customerId": 999,
    "serviceId": 1,
    "professionalId": 1,
    "dateTime": "2025-12-20T07:59:00.000Z",
    "totalPrice": 100,
    "status": "confirmed",
    "notes": "AI. Name: Ahmet Yılmaz Phone: 905551234567"
  }
}

[2025-12-20T07:59:47.984Z] AI Response 2:
"Randevunuz 2025-12-20 tarihinde saat 10:59'da oluşturuldu. Randevu numaranız 123. Herhangi bir değişiklik veya sorunuz olursa lütfen çekinmeyin."

[2025-12-20T07:59:47.986Z] 
FAILURE: AI did not create appointment or asked for more info.

