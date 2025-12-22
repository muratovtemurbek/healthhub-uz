# run_tests.py - Full API Test Suite
import requests
import json

BASE_URL = 'http://localhost:8000'

def test_api():
    print('=== API ENDPOINT TESTS ===')
    print()

    tests = []
    token = None

    # Test 1: Health Check
    try:
        r = requests.get(f'{BASE_URL}/health/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Health Check', status))
        print(f'1. Health Check: {status}')
    except Exception as e:
        tests.append(('Health Check', 'ERROR'))
        print(f'1. Health Check: ERROR - {e}')

    # Test 2: Doctors List
    try:
        r = requests.get(f'{BASE_URL}/api/doctors/list/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Doctors List', status))
        print(f'2. Doctors List: {status}')
    except Exception as e:
        tests.append(('Doctors List', 'ERROR'))
        print(f'2. Doctors List: ERROR - {e}')

    # Test 3: Specializations
    try:
        r = requests.get(f'{BASE_URL}/api/doctors/specializations/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Specializations', status))
        print(f'3. Specializations: {status}')
    except Exception as e:
        tests.append(('Specializations', 'ERROR'))
        print(f'3. Specializations: ERROR - {e}')

    # Test 4: Medicines list
    try:
        r = requests.get(f'{BASE_URL}/api/medicines/medicines/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Medicines List', status))
        print(f'4. Medicines List: {status}')
    except Exception as e:
        tests.append(('Medicines List', 'ERROR'))
        print(f'4. Medicines List: ERROR - {e}')

    # Test 5: Categories
    try:
        r = requests.get(f'{BASE_URL}/api/medicines/categories/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Categories', status))
        print(f'5. Categories: {status}')
    except Exception as e:
        tests.append(('Categories', 'ERROR'))
        print(f'5. Categories: ERROR - {e}')

    # Test 6: Pharmacies
    try:
        r = requests.get(f'{BASE_URL}/api/medicines/pharmacies/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Pharmacies', status))
        print(f'6. Pharmacies: {status}')
    except Exception as e:
        tests.append(('Pharmacies', 'ERROR'))
        print(f'6. Pharmacies: ERROR - {e}')

    # Test 7: AI API
    try:
        r = requests.get(f'{BASE_URL}/api/ai/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('AI API', status))
        print(f'7. AI API: {status}')
    except Exception as e:
        tests.append(('AI API', 'ERROR'))
        print(f'7. AI API: ERROR - {e}')

    # Test 8: Air Quality
    try:
        r = requests.get(f'{BASE_URL}/api/air-quality/', timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Air Quality', status))
        print(f'8. Air Quality: {status}')
    except Exception as e:
        tests.append(('Air Quality', 'ERROR'))
        print(f'8. Air Quality: ERROR - {e}')

    # Test 9: Register new user
    try:
        r = requests.post(f'{BASE_URL}/api/auth/register/', json={
            'email': 'testuser_api_test@test.uz',
            'username': 'testuser_api_test',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }, timeout=5)
        status = 'OK' if r.status_code in [200, 201] else f'FAIL ({r.status_code})'
        tests.append(('Register', status))
        print(f'9. Register: {status}')
        if r.status_code not in [200, 201]:
            print(f'   Response: {r.text[:150]}')
    except Exception as e:
        tests.append(('Register', 'ERROR'))
        print(f'9. Register: ERROR - {e}')

    # Test 10: Login
    try:
        r = requests.post(f'{BASE_URL}/api/auth/login/', json={
            'email': 'testuser_api_test@test.uz',
            'password': 'TestPass123!'
        }, timeout=5)
        status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
        tests.append(('Login', status))
        print(f'10. Login: {status}')
        if r.status_code == 200:
            data = r.json()
            token = data.get('tokens', {}).get('access') or data.get('access')
        else:
            print(f'   Response: {r.text[:150]}')
    except Exception as e:
        tests.append(('Login', 'ERROR'))
        print(f'10. Login: ERROR - {e}')

    # Tests requiring authentication
    if token:
        headers = {'Authorization': f'Bearer {token}'}

        # Test 11: Current User
        try:
            r = requests.get(f'{BASE_URL}/api/auth/me/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Current User', status))
            print(f'11. Current User: {status}')
        except Exception as e:
            tests.append(('Current User', 'ERROR'))
            print(f'11. Current User: ERROR - {e}')

        # Test 12: Medical Card
        try:
            r = requests.get(f'{BASE_URL}/api/auth/medical-card/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Medical Card', status))
            print(f'12. Medical Card: {status}')
        except Exception as e:
            tests.append(('Medical Card', 'ERROR'))
            print(f'12. Medical Card: ERROR - {e}')

        # Test 13: Appointments
        try:
            r = requests.get(f'{BASE_URL}/api/appointments/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Appointments', status))
            print(f'13. Appointments: {status}')
        except Exception as e:
            tests.append(('Appointments', 'ERROR'))
            print(f'13. Appointments: ERROR - {e}')

        # Test 14: Notifications
        try:
            r = requests.get(f'{BASE_URL}/api/notifications/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Notifications', status))
            print(f'14. Notifications: {status}')
        except Exception as e:
            tests.append(('Notifications', 'ERROR'))
            print(f'14. Notifications: ERROR - {e}')

        # Test 15: Chat Rooms
        try:
            r = requests.get(f'{BASE_URL}/api/chat/rooms/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Chat Rooms', status))
            print(f'15. Chat Rooms: {status}')
        except Exception as e:
            tests.append(('Chat Rooms', 'ERROR'))
            print(f'15. Chat Rooms: ERROR - {e}')

        # Test 16: Family Members
        try:
            r = requests.get(f'{BASE_URL}/api/auth/family-members/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Family Members', status))
            print(f'16. Family Members: {status}')
        except Exception as e:
            tests.append(('Family Members', 'ERROR'))
            print(f'16. Family Members: ERROR - {e}')

        # Test 17: Emergency Contacts
        try:
            r = requests.get(f'{BASE_URL}/api/auth/emergency-contacts/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Emergency Contacts', status))
            print(f'17. Emergency Contacts: {status}')
        except Exception as e:
            tests.append(('Emergency Contacts', 'ERROR'))
            print(f'17. Emergency Contacts: ERROR - {e}')

        # Test 18: Health Alerts
        try:
            r = requests.get(f'{BASE_URL}/api/auth/health-alerts/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Health Alerts', status))
            print(f'18. Health Alerts: {status}')
        except Exception as e:
            tests.append(('Health Alerts', 'ERROR'))
            print(f'18. Health Alerts: ERROR - {e}')

        # Test 19: Profile
        try:
            r = requests.get(f'{BASE_URL}/api/auth/profile/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Profile', status))
            print(f'19. Profile: {status}')
        except Exception as e:
            tests.append(('Profile', 'ERROR'))
            print(f'19. Profile: ERROR - {e}')

        # Test 20: Dashboard Widgets
        try:
            r = requests.get(f'{BASE_URL}/api/auth/dashboard/widgets/', headers=headers, timeout=5)
            status = 'OK' if r.status_code == 200 else f'FAIL ({r.status_code})'
            tests.append(('Dashboard Widgets', status))
            print(f'20. Dashboard Widgets: {status}')
        except Exception as e:
            tests.append(('Dashboard Widgets', 'ERROR'))
            print(f'20. Dashboard Widgets: ERROR - {e}')

    # Summary
    print()
    print('=' * 50)
    print('=== SUMMARY ===')
    print('=' * 50)
    passed = sum(1 for _, s in tests if s == 'OK')
    total = len(tests)
    print(f'Passed: {passed}/{total}')
    print(f'Success Rate: {passed/total*100:.1f}%')

    failed = [(n, s) for n, s in tests if s != 'OK']
    if failed:
        print()
        print('Failed tests:')
        for n, s in failed:
            print(f'  - {n}: {s}')

    return passed, total

if __name__ == '__main__':
    test_api()
