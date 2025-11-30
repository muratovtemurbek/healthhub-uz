# test_api.py - HealthHub UZ API Test Suite
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"


def print_separator(char="=", length=70):
    print(char * length)


def test_endpoint(name, url, method="GET", data=None, headers=None):
    """Test single endpoint"""
    print_separator()
    print(f"🔍 {name}")

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)

        print(f"Status: {response.status_code}")
        print(f"URL: {url}")

        try:
            response_json = response.json()
            print(f"\n{json.dumps(response_json, indent=2, ensure_ascii=False)[:800]}")
        except:
            print(f"\nResponse: {response.text[:300]}")

        print_separator()

        if 200 <= response.status_code < 300:
            print(f"✅ {name} - PASSED")
            return True, response
        else:
            print(f"❌ {name} - FAILED")
            return False, response

    except Exception as e:
        print(f"Error: {e}")
        print_separator()
        print(f"❌ {name} - FAILED (Connection Error)")
        return False, None


def main():
    print("\n" + "=" * 70)
    print("🚀 HealthHub UZ - FULL API TEST SUITE")
    print(f"⏰ Vaqt: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70 + "\n")

    results = []
    token = None
    headers = None

    # ==================== BASIC ENDPOINTS ====================
    print("\n" + "=" * 70)
    print("📌 BASIC ENDPOINTS")
    print("=" * 70)

    # 1. Health Check
    passed, _ = test_endpoint("Health Check", f"{BASE_URL}/health/")
    results.append(("Health Check", passed))

    # 2. API Info
    passed, _ = test_endpoint("API Info", f"{BASE_URL}/api/")
    results.append(("API Info", passed))

    # ==================== DOCTORS API ====================
    print("\n" + "=" * 70)
    print("👨‍⚕️ DOCTORS API")
    print("=" * 70)

    # 3. Doctors Root
    passed, _ = test_endpoint("Doctors API Root", f"{BASE_URL}/api/doctors/")
    results.append(("Doctors API Root", passed))

    # 4. Specializations
    passed, _ = test_endpoint("Specializations List", f"{BASE_URL}/api/doctors/specializations/")
    results.append(("Specializations List", passed))

    # 5. Hospitals
    passed, _ = test_endpoint("Hospitals List", f"{BASE_URL}/api/doctors/hospitals/")
    results.append(("Hospitals List", passed))

    # 6. Doctors List
    passed, response = test_endpoint("Doctors List", f"{BASE_URL}/api/doctors/doctors/")
    results.append(("Doctors List", passed))

    # Get first doctor ID for detail test
    doctor_id = None
    if passed and response:
        try:
            doctors = response.json()
            if doctors and len(doctors) > 0:
                doctor_id = doctors[0].get('id')
        except:
            pass

    # 7. Doctor Detail
    if doctor_id:
        passed, _ = test_endpoint("Doctor Detail", f"{BASE_URL}/api/doctors/doctors/{doctor_id}/")
        results.append(("Doctor Detail", passed))

    # ==================== MEDICINES API ====================
    print("\n" + "=" * 70)
    print("💊 MEDICINES API")
    print("=" * 70)

    # 8. Medicines List
    passed, _ = test_endpoint("Medicines List", f"{BASE_URL}/api/medicines/")
    results.append(("Medicines List", passed))

    # 9. Categories
    passed, _ = test_endpoint("Categories List", f"{BASE_URL}/api/medicines/categories/")
    results.append(("Categories List", passed))

    # 10. Pharmacies
    passed, _ = test_endpoint("Pharmacies List", f"{BASE_URL}/api/medicines/pharmacies/")
    results.append(("Pharmacies List", passed))

    # ==================== AUTH API ====================
    print("\n" + "=" * 70)
    print("🔐 AUTHENTICATION API")
    print("=" * 70)

    # 11. Login with EMAIL
    passed, response = test_endpoint(
        "Login (email)",
        f"{BASE_URL}/api/auth/login/",
        method="POST",
        data={"email": "patient@test.uz", "password": "patient123"}
    )
    results.append(("Login (email)", passed))

    if passed and response:
        try:
            token = response.json().get('tokens', {}).get('access')
            headers = {"Authorization": f"Bearer {token}"}
        except:
            pass

    # 12. Login with USERNAME
    passed, response = test_endpoint(
        "Login (username)",
        f"{BASE_URL}/api/auth/login/",
        method="POST",
        data={"username": "patient", "password": "patient123"}
    )
    results.append(("Login (username)", passed))

    if passed and response and not token:
        try:
            token = response.json().get('tokens', {}).get('access')
            headers = {"Authorization": f"Bearer {token}"}
        except:
            pass

    # 13. Users List
    passed, _ = test_endpoint("Users List", f"{BASE_URL}/api/auth/users/", headers=headers)
    results.append(("Users List", passed))

    # 14. Current User (Profile)
    if headers:
        passed, _ = test_endpoint("Current User", f"{BASE_URL}/api/auth/me/", headers=headers)
        results.append(("Current User", passed))

    # ==================== AI API ====================
    print("\n" + "=" * 70)
    print("🤖 AI SERVICE API")
    print("=" * 70)

    # 15. AI Root
    passed, _ = test_endpoint("AI API Root", f"{BASE_URL}/api/ai/")
    results.append(("AI API Root", passed))

    # 16. AI Analyze
    passed, _ = test_endpoint(
        "AI Symptom Analysis",
        f"{BASE_URL}/api/ai/consultations/analyze/",
        method="POST",
        data={"symptoms": "boshim og'riyapti, haroratim 38.5, tomoqim og'riyapti"}
    )
    results.append(("AI Symptom Analysis", passed))

    # 17. AI Consultations List
    passed, _ = test_endpoint("AI Consultations", f"{BASE_URL}/api/ai/consultations/", headers=headers)
    results.append(("AI Consultations", passed))

    # ==================== APPOINTMENTS API ====================
    print("\n" + "=" * 70)
    print("📅 APPOINTMENTS API")
    print("=" * 70)

    # 18. Appointments List
    passed, _ = test_endpoint("Appointments List", f"{BASE_URL}/api/appointments/", headers=headers)
    results.append(("Appointments List", passed))

    # ==================== CRUD TESTS ====================
    print("\n" + "=" * 70)
    print("🔄 CRUD OPERATIONS TEST")
    print("=" * 70)

    # 19. Create Hospital
    passed, response = test_endpoint(
        "Create Hospital",
        f"{BASE_URL}/api/doctors/hospitals/",
        method="POST",
        data={
            "name": "Test Shifoxona",
            "address": "Test manzil",
            "city": "Toshkent",
            "phone": "+998901234567",
            "type": "private",
            "is_24_7": True,
            "has_emergency": False
        }
    )
    results.append(("Create Hospital", passed))

    new_hospital_id = None
    if passed and response:
        try:
            new_hospital_id = response.json().get('id')
        except:
            pass

    # 20. Delete Hospital (cleanup)
    if new_hospital_id:
        passed, _ = test_endpoint(
            "Delete Hospital",
            f"{BASE_URL}/api/doctors/hospitals/{new_hospital_id}/",
            method="DELETE"
        )
        results.append(("Delete Hospital", passed))

    # 21. Create Medicine
    passed, response = test_endpoint(
        "Create Medicine",
        f"{BASE_URL}/api/medicines/",
        method="POST",
        data={
            "name": "Test Dori",
            "generic_name": "Test Generic",
            "manufacturer": "Test Manufacturer",
            "price": 15000,
            "description": "Test description",
            "requires_prescription": False,
            "in_stock": True
        }
    )
    results.append(("Create Medicine", passed))

    new_medicine_id = None
    if passed and response:
        try:
            new_medicine_id = response.json().get('id')
        except:
            pass

    # 22. Delete Medicine (cleanup)
    if new_medicine_id:
        passed, _ = test_endpoint(
            "Delete Medicine",
            f"{BASE_URL}/api/medicines/{new_medicine_id}/",
            method="DELETE"
        )
        results.append(("Delete Medicine", passed))

    # ==================== SUMMARY ====================
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70 + "\n")

    total = len(results)
    passed_count = sum(1 for _, p in results if p)
    failed_count = total - passed_count

    print(f"📋 Total Tests: {total}")
    print(f"✅ Passed: {passed_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"\n📈 Success Rate: {passed_count / total * 100:.1f}%")

    if failed_count > 0:
        print("\n❌ Failed Tests:")
        for name, passed in results:
            if not passed:
                print(f"   - {name}")

    print("\n" + "=" * 70)
    if passed_count == total:
        print("🎉 BARCHA TESTLAR MUVAFFAQIYATLI O'TDI!")
    elif passed_count >= total * 0.9:
        print("✅ Deyarli barcha testlar muvaffaqiyatli!")
    elif passed_count >= total * 0.7:
        print("⚠️ Ko'pchilik testlar muvaffaqiyatli!")
    else:
        print("❌ Ko'p testlar muvaffaqiyatsiz!")
    print("=" * 70 + "\n")

    # Return exit code
    return 0 if failed_count == 0 else 1


if __name__ == "__main__":
    exit(main())