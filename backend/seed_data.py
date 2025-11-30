# seed_data.py
# TO'LIQ TUZATILGAN VERSIYA - Professional poliklinika uchun
import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import models
from django.utils import timezone
from accounts.models import User
from doctors.models import Specialization, Hospital, Doctor
from medicines.models import Medicine, Pharmacy, Category, PharmacyPrice
from appointments.models import Appointment
from payments.models import Payment


def clear_all_data():
    """Barcha eski ma'lumotlarni o'chirish"""
    print("\n" + "=" * 60)
    print("🗑️  ESKI MA'LUMOTLARNI O'CHIRISH")
    print("=" * 60)

    # Payments
    try:
        count = Payment.objects.count()
        Payment.objects.all().delete()
        print(f"  ✅ Payments: {count} ta o'chirildi")
    except Exception as e:
        print(f"  ⚠️ Payments: {e}")

    # PharmacyPrice
    try:
        count = PharmacyPrice.objects.count()
        PharmacyPrice.objects.all().delete()
        print(f"  ✅ PharmacyPrice: {count} ta o'chirildi")
    except Exception as e:
        print(f"  ⚠️ PharmacyPrice: {e}")

    # Appointments
    count = Appointment.objects.count()
    Appointment.objects.all().delete()
    print(f"  ✅ Appointments: {count} ta o'chirildi")

    # Doctors
    count = Doctor.objects.count()
    Doctor.objects.all().delete()
    print(f"  ✅ Doctors: {count} ta o'chirildi")

    # Hospitals
    count = Hospital.objects.count()
    Hospital.objects.all().delete()
    print(f"  ✅ Hospitals: {count} ta o'chirildi")

    # Specializations
    count = Specialization.objects.count()
    Specialization.objects.all().delete()
    print(f"  ✅ Specializations: {count} ta o'chirildi")

    # Medicines
    count = Medicine.objects.count()
    Medicine.objects.all().delete()
    print(f"  ✅ Medicines: {count} ta o'chirildi")

    # Pharmacies
    count = Pharmacy.objects.count()
    Pharmacy.objects.all().delete()
    print(f"  ✅ Pharmacies: {count} ta o'chirildi")

    # Categories
    try:
        count = Category.objects.count()
        Category.objects.all().delete()
        print(f"  ✅ Categories: {count} ta o'chirildi")
    except:
        pass

    # Users (superuser dan tashqari)
    count = User.objects.filter(is_superuser=False).count()
    User.objects.filter(is_superuser=False).delete()
    print(f"  ✅ Users: {count} ta o'chirildi")

    print("  ✅ Barcha eski ma'lumotlar tozalandi!")


def create_admin():
    """Admin yaratish yoki yangilash"""
    print("\n" + "=" * 60)
    print("👤 ADMIN")
    print("=" * 60)

    try:
        admin = User.objects.filter(is_superuser=True).first()
        if admin:
            admin.username = 'admin'
            admin.email = 'admin@healthhub.uz'
            admin.set_password('admin123')
            admin.first_name = 'Admin'
            admin.last_name = 'HealthHub'
            admin.user_type = 'admin'
            admin.phone = '+998901234567'
            admin.save()
            print("  ✅ Admin yangilandi")
        else:
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@healthhub.uz',
                password='admin123'
            )
            admin.first_name = 'Admin'
            admin.last_name = 'HealthHub'
            admin.user_type = 'admin'
            admin.phone = '+998901234567'
            admin.save()
            print("  ✅ Admin yaratildi")
    except Exception as e:
        print(f"  ❌ Admin: {e}")


def create_patients():
    """Bemorlar yaratish - 20 ta"""
    print("\n" + "=" * 60)
    print("👥 BEMORLAR")
    print("=" * 60)

    patients_data = [
        ('ali_valiyev', 'patient1@test.uz', 'Ali', 'Valiyev', '+998901111111'),
        ('malika_karimova', 'patient2@test.uz', 'Malika', 'Karimova', '+998902222222'),
        ('jasur_toshmatov', 'patient3@test.uz', 'Jasur', 'Toshmatov', '+998903333333'),
        ('nilufar_rahimova', 'patient4@test.uz', 'Nilufar', 'Rahimova', '+998904444444'),
        ('sardor_aliyev', 'patient5@test.uz', 'Sardor', 'Aliyev', '+998905555555'),
        ('dilnoza_saidova', 'dilnoza@test.uz', 'Dilnoza', 'Saidova', '+998906666666'),
        ('bobur_yusupov', 'bobur@test.uz', 'Bobur', 'Yusupov', '+998907777777'),
        ('gulnora_azimova', 'gulnora@test.uz', 'Gulnora', 'Azimova', '+998908888888'),
        ('sherzod_normatov', 'sherzod@test.uz', 'Sherzod', 'Normatov', '+998909999999'),
        ('feruza_xolmatova', 'feruza@test.uz', 'Feruza', 'Xolmatova', '+998911111111'),
        ('otabek_qodirov', 'otabek@test.uz', 'Otabek', 'Qodirov', '+998912222222'),
        ('madina_rashidova', 'madina@test.uz', 'Madina', 'Rashidova', '+998913333333'),
        ('ulugbek_tursunov', 'ulugbek@test.uz', 'Ulugbek', 'Tursunov', '+998914444444'),
        ('shahlo_mirzayeva', 'shahlo@test.uz', 'Shahlo', 'Mirzayeva', '+998915555555'),
        ('davron_umarov', 'davron@test.uz', 'Davron', 'Umarov', '+998916666666'),
        ('zilola_nazarova', 'zilola@test.uz', 'Zilola', 'Nazarova', '+998917777777'),
        ('bahrom_salimov', 'bahrom@test.uz', 'Bahrom', 'Salimov', '+998918888888'),
        ('nodira_ismoilova', 'nodira_p@test.uz', 'Nodira', 'Ismoilova', '+998919999999'),
        ('jamshid_ergashev', 'jamshid@test.uz', 'Jamshid', 'Ergashev', '+998920000000'),
        ('saida_xaydarova', 'saida@test.uz', 'Saida', 'Xaydarova', '+998921111111'),
    ]

    for username, email, first, last, phone in patients_data:
        try:
            user = User.objects.create_user(username, email, 'patient123')
            user.first_name = first
            user.last_name = last
            user.user_type = 'patient'
            user.phone = phone
            user.is_verified = random.choice([True, True, True, False])
            user.save()
            print(f"  ✅ {first} {last}")
        except Exception as e:
            print(f"  ❌ {first}: {e}")

    print(f"  📊 Jami bemorlar: {User.objects.filter(user_type='patient').count()} ta")


def create_specializations():
    """Mutaxassisliklar yaratish - 15 ta"""
    print("\n" + "=" * 60)
    print("🏥 MUTAXASSISLIKLAR")
    print("=" * 60)

    specs_data = [
        ('General Practitioner', 'Terapevt', '👨‍⚕️', 'Umumiy amaliyot shifokori'),
        ('Cardiologist', 'Kardiolog', '❤️', 'Yurak-qon tomir kasalliklari'),
        ('Neurologist', 'Nevrolog', '🧠', 'Asab tizimi kasalliklari'),
        ('Pediatrician', 'Pediatr', '👶', 'Bolalar shifokori'),
        ('Dermatologist', 'Dermatolog', '🧴', 'Teri kasalliklari'),
        ('Otolaryngologist', 'LOR', '👂', 'Quloq-burun-tomoq'),
        ('Dentist', 'Stomatolog', '🦷', 'Tish shifokori'),
        ('Gynecologist', 'Ginekolog', '👩', 'Ayollar shifokori'),
        ('Ophthalmologist', 'Oftalmolog', '👁️', 'Ko\'z kasalliklari'),
        ('Urologist', 'Urolog', '🩺', 'Siydik yo\'llari'),
        ('Endocrinologist', 'Endokrinolog', '💉', 'Gormonlar tizimi'),
        ('Gastroenterologist', 'Gastroenterolog', '🍽️', 'Hazm qilish tizimi'),
        ('Pulmonologist', 'Pulmonolog', '🫁', 'O\'pka kasalliklari'),
        ('Orthopedist', 'Ortoped', '🦴', 'Suyak va bo\'g\'imlar'),
        ('Psychiatrist', 'Psixiatr', '🧘', 'Ruhiy salomatlik'),
    ]

    for name, name_uz, icon, desc in specs_data:
        try:
            Specialization.objects.create(
                name=name,
                name_uz=name_uz,
                icon=icon,
                description=desc
            )
            print(f"  ✅ {name_uz}")
        except Exception as e:
            print(f"  ❌ {name_uz}: {e}")

    print(f"  📊 Jami: {Specialization.objects.count()} ta")


def create_hospitals():
    """Shifoxonalar yaratish - 10 ta"""
    print("\n" + "=" * 60)
    print("🏢 SHIFOXONALAR")
    print("=" * 60)

    hospitals_data = [
        ('Respublika Kardiologiya Markazi', 'Toshkent', 'Osiyo ko\'chasi 4', '+998712345678', True, True, 4.8),
        ('Toshkent Tibbiyot Akademiyasi', 'Toshkent', 'Farobiy ko\'chasi 2', '+998712345679', True, True, 4.9),
        ('Grandmed Klinikalari', 'Toshkent', 'Amir Temur 107A', '+998712345680', True, False, 4.7),
        ('MedLife Clinic', 'Toshkent', 'Chilonzor 10-mavze', '+998712345681', False, False, 4.5),
        ('Farg\'ona Viloyat Shifoxonasi', 'Farg\'ona', 'Mustaqillik 15', '+998732345682', True, True, 4.6),
        ('Samarqand Tibbiyot Markazi', 'Samarqand', 'Registon 25', '+998662345683', True, True, 4.7),
        ('Buxoro Shifoxonasi', 'Buxoro', 'Navoiy ko\'chasi 10', '+998652345684', True, True, 4.4),
        ('Namangan Klinikasi', 'Namangan', 'Uychi tumani', '+998692345685', False, True, 4.3),
        ('HealthHub Premium', 'Toshkent', 'Shayxontohur tumani', '+998712345686', True, True, 4.9),
        ('Oilaviy Poliklinika #1', 'Toshkent', 'Yunusobod tumani', '+998712345687', False, False, 4.2),
    ]

    for name, city, address, phone, is_24_7, has_emergency, rating in hospitals_data:
        try:
            Hospital.objects.create(
                name=name,
                city=city,
                address=address,
                phone=phone,
                is_24_7=is_24_7,
                has_emergency=has_emergency,
                rating=rating
            )
            print(f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")

    print(f"  📊 Jami: {Hospital.objects.count()} ta")


def create_doctors():
    """Shifokorlar yaratish - 15 ta"""
    print("\n" + "=" * 60)
    print("👨‍⚕️ SHIFOKORLAR")
    print("=" * 60)

    specs = list(Specialization.objects.all())
    hospitals = list(Hospital.objects.all())

    if not specs:
        print("  ❌ Mutaxassisliklar yo'q!")
        return
    if not hospitals:
        print("  ❌ Shifoxonalar yo'q!")
        return

    doctors_data = [
        ('dr_jasur', 'jasur@healthhub.uz', 'Jasur', 'Karimov', '+998901001001', 0, 0, 15, 150000, 4.8,
         "Yurak kasalliklari bo'yicha 15 yillik tajriba. 1000+ muvaffaqiyatli operatsiya."),
        ('dr_sardor', 'sardor@healthhub.uz', 'Sardor', 'Rahimov', '+998901002002', 1, 1, 12, 250000, 4.9,
         "Kardiolog, PhD. Xalqaro konferensiyalar ishtirokchisi."),
        ('dr_nodira', 'nodira@healthhub.uz', 'Nodira', 'Azimova', '+998901003003', 2, 2, 8, 180000, 4.7,
         "Nevrolog mutaxassisi. Bolalar nevrologiyasi."),
        ('dr_aziz', 'aziz@healthhub.uz', 'Aziz', 'Toshmatov', '+998901004004', 3, 0, 20, 120000, 4.6,
         "Pediatr. 20 yillik tajriba. 5000+ bemor."),
        ('dr_malika', 'malika@healthhub.uz', 'Malika', 'Saidova', '+998901005005', 4, 1, 6, 140000, 4.5,
         "Dermatolog. Teri kasalliklari mutaxassisi."),
        ('dr_bekzod', 'bekzod@healthhub.uz', 'Bekzod', 'Yusupov', '+998901006006', 5, 3, 10, 130000, 4.7,
         "LOR shifokori. Zamonaviy usullar."),
        ('dr_dilnoza', 'dilnoza@healthhub.uz', 'Dilnoza', 'Xolmatova', '+998901007007', 6, 2, 7, 100000, 4.8,
         "Stomatolog. Implantatsiya mutaxassisi."),
        ('dr_rustam', 'rustam@healthhub.uz', 'Rustam', 'Aliyev', '+998901008008', 7, 0, 18, 200000, 4.9,
         "Ginekolog, professor. 3000+ muvaffaqiyatli tug'ruq."),
        ('dr_shoxrux', 'shoxrux@healthhub.uz', 'Shoxrux', 'Qodirov', '+998901009009', 8, 4, 11, 170000, 4.6,
         "Oftalmolog. Laser ko'rish tuzatish."),
        ('dr_kamola', 'kamola@healthhub.uz', 'Kamola', 'Nazarova', '+998901010010', 9, 5, 9, 160000, 4.7,
         "Urolog mutaxassisi."),
        ('dr_anvar', 'anvar@healthhub.uz', 'Anvar', 'Ibragimov', '+998901011011', 10, 6, 14, 190000, 4.8,
         "Endokrinolog. Diabet mutaxassisi."),
        ('dr_gulshan', 'gulshan@healthhub.uz', 'Gulshan', 'Mahmudova', '+998901012012', 11, 7, 5, 130000, 4.4,
         "Gastroenterolog. Oshqozon kasalliklari."),
        ('dr_farhod', 'farhod@healthhub.uz', 'Farhod', 'Sultonov', '+998901013013', 12, 8, 16, 220000, 4.9,
         "Pulmonolog. O'pka kasalliklari bo'yicha ekspert."),
        ('dr_sevara', 'sevara@healthhub.uz', 'Sevara', 'Tojiyeva', '+998901014014', 13, 9, 8, 150000, 4.5,
         "Ortoped. Sport jarohatlanishlari."),
        ('dr_javlon', 'javlon@healthhub.uz', 'Javlon', 'Raxmatullayev', '+998901015015', 14, 0, 12, 180000, 4.7,
         "Psixiatr. Stress va depressiya davolash."),
    ]

    for username, email, first, last, phone, spec_idx, hosp_idx, exp, price, rating, bio in doctors_data:
        try:
            user = User.objects.create_user(username, email, 'doctor123')
            user.first_name = first
            user.last_name = last
            user.user_type = 'doctor'
            user.phone = phone
            user.is_verified = True
            user.save()

            Doctor.objects.create(
                user=user,
                specialization=specs[spec_idx % len(specs)],
                hospital=hospitals[hosp_idx % len(hospitals)],
                experience_years=exp,
                consultation_price=price,
                bio=bio,
                is_available=True,
                rating=rating,
                license_number=f'UZ-DOC-{random.randint(10000, 99999)}'
            )
            print(f"  ✅ Dr. {first} {last} - {specs[spec_idx % len(specs)].name_uz}")
        except Exception as e:
            print(f"  ❌ {first} {last}: {e}")

    print(f"  📊 Jami: {Doctor.objects.count()} ta")


def create_categories():
    """Dori kategoriyalari - 10 ta"""
    print("\n" + "=" * 60)
    print("📂 KATEGORIYALAR")
    print("=" * 60)

    categories_data = [
        ('Antibiotiklar', 'Infeksiyalarga qarshi dorilar', '💊'),
        ('Og\'riq qoldiruvchi', 'Og\'riq va isitma kamaytiradigan dorilar', '💉'),
        ('Vitaminlar', 'Vitaminlar va minerallar', '🍊'),
        ('Yurak dorilari', 'Yurak-qon tomir tizimi dorilari', '❤️'),
        ('Allergiya', 'Allergiyaga qarshi dorilar', '🤧'),
        ('Oshqozon', 'Hazm qilish tizimi dorilari', '🍽️'),
        ('Shamollash', 'Gripp va shamollashga qarshi', '🤒'),
        ('Teri', 'Teri kasalliklari dorilari', '🧴'),
        ('Asab tizimi', 'Tinchlantiruvchi va uyqu dorilari', '🧠'),
        ('Bolalar', 'Bolalar uchun dorilar', '👶'),
    ]

    for name, desc, icon in categories_data:
        try:
            Category.objects.create(name=name, description=desc, icon=icon)
            print(f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")

    print(f"  📊 Jami: {Category.objects.count()} ta")


def create_pharmacies():
    """Dorixonalar yaratish - 10 ta (rating YO'Q!)"""
    print("\n" + "=" * 60)
    print("🏪 DORIXONALAR")
    print("=" * 60)

    pharmacies_data = [
        ('Dori-Darmon', 'Toshkent, Chilonzor tumani, 7-mavze', '+998711111111', True),
        ('Apteka.uz', 'Toshkent, Yunusobod tumani', '+998712222222', True),
        ('Tabletka', 'Toshkent, Mirzo Ulug\'bek tumani', '+998713333333', False),
        ('Farmatsiya Plus', 'Toshkent, Sergeli tumani', '+998714444444', True),
        ('Salomatlik', 'Toshkent, Yakkasaroy tumani', '+998715555555', False),
        ('Shifo Aptekasi', 'Farg\'ona shahar markazi', '+998736666666', True),
        ('Darmon', 'Samarqand, Registon', '+998667777777', True),
        ('MedPharm', 'Toshkent, Shayxontohur', '+998718888888', True),
        ('Vita Plus', 'Namangan shahar', '+998699999999', False),
        ('GrandPharma', 'Toshkent, Bektemir', '+998710000000', True),
    ]

    for name, address, phone, is_24_7 in pharmacies_data:
        try:
            Pharmacy.objects.create(
                name=name,
                address=address,
                phone=phone,
                is_24_7=is_24_7
            )
            print(f"  ✅ {name}")
        except Exception as e:
            print(f"  ❌ {name}: {e}")

    print(f"  📊 Jami: {Pharmacy.objects.count()} ta")


def create_medicines_with_prices():
    """Dorilar va narxlar yaratish - 30 ta"""
    print("\n" + "=" * 60)
    print("💊 DORILAR VA NARXLAR")
    print("=" * 60)

    categories = {c.name: c for c in Category.objects.all()}
    pharmacies = list(Pharmacy.objects.all())

    medicines_data = [
        ('Paracetamol 500mg', 'Paracetamol', 'Jurabek Labs', 15000, 'Og\'riq qoldiruvchi', False, 'Og\'riq va isitmaga qarshi'),
        ('Ibuprofen 400mg', 'Ibuprofen', 'Sun Pharma', 25000, 'Og\'riq qoldiruvchi', False, 'Yallig\'lanishga qarshi'),
        ('Analgin 500mg', 'Metamizole', 'Darnitsa', 12000, 'Og\'riq qoldiruvchi', False, 'Kuchli og\'riqqa qarshi'),
        ('Ketanov 10mg', 'Ketorolac', 'Ranbaxy', 35000, 'Og\'riq qoldiruvchi', True, 'Kuchli og\'riq qoldiruvchi'),
        ('Amoxicillin 500mg', 'Amoxicillin', 'Gufic', 35000, 'Antibiotiklar', True, 'Keng spektrli antibiotik'),
        ('Azithromycin 500mg', 'Azithromycin', 'Pfizer', 55000, 'Antibiotiklar', True, 'Makrolid antibiotik'),
        ('Ciprofloxacin 500mg', 'Ciprofloxacin', 'Bayer', 42000, 'Antibiotiklar', True, 'Ftorxinolon antibiotik'),
        ('Ceftriaxone 1g', 'Ceftriaxone', 'Roche', 28000, 'Antibiotiklar', True, 'Sefalosporin antibiotik'),
        ('Vitamin C 1000mg', 'Ascorbic Acid', 'Evalar', 28000, 'Vitaminlar', False, 'Immunitetni mustahkamlaydi'),
        ('Vitamin D3 5000IU', 'Cholecalciferol', 'NOW Foods', 65000, 'Vitaminlar', False, 'Suyaklar uchun'),
        ('Omega-3 1000mg', 'Fish Oil', 'Nordic', 95000, 'Vitaminlar', False, 'Yurak uchun foydali'),
        ('Multivitamin', 'Complex', 'Centrum', 85000, 'Vitaminlar', False, 'Kompleks vitamin'),
        ('Vitamin B12', 'Cyanocobalamin', 'Solgar', 45000, 'Vitaminlar', False, 'Asab tizimi uchun'),
        ('Aspirin Cardio 100mg', 'Acetylsalicylic', 'Bayer', 32000, 'Yurak dorilari', False, 'Qon suyultiruvchi'),
        ('Enalapril 10mg', 'Enalapril', 'Krka', 28000, 'Yurak dorilari', True, 'Qon bosimini tushiradi'),
        ('Amlodipine 5mg', 'Amlodipine', 'Pfizer', 38000, 'Yurak dorilari', True, 'Gipertoniya uchun'),
        ('Loratadine 10mg', 'Loratadine', 'Claritin', 22000, 'Allergiya', False, 'Allergiyaga qarshi'),
        ('Cetirizine 10mg', 'Cetirizine', 'Zyrtec', 18000, 'Allergiya', False, 'Antihistamin'),
        ('Suprastin 25mg', 'Chloropyramine', 'Egis', 15000, 'Allergiya', False, 'Tez ta\'sir qiladi'),
        ('Omeprazole 20mg', 'Omeprazole', 'AstraZeneca', 35000, 'Oshqozon', False, 'Oshqozon yarasi uchun'),
        ('Ranitidine 150mg', 'Ranitidine', 'GSK', 20000, 'Oshqozon', False, 'Kislotalilikni kamaytiradi'),
        ('Motilium 10mg', 'Domperidone', 'Janssen', 42000, 'Oshqozon', False, 'Ko\'ngil aynishga qarshi'),
        ('Fervex', 'Paracetamol+C', 'Upsa', 45000, 'Shamollash', False, 'Shamollash belgilari'),
        ('Coldrex', 'Paracetamol', 'GSK', 48000, 'Shamollash', False, 'Gripp va shamollash'),
        ('TeraFlu', 'Paracetamol', 'Novartis', 52000, 'Shamollash', False, 'Issiq ichimlik'),
        ('Strepsils', 'Amylmetacresol', 'Reckitt', 25000, 'Shamollash', False, 'Tomoq og\'rig\'i uchun'),
        ('Hydrocortisone 1%', 'Hydrocortisone', 'Pfizer', 38000, 'Teri', False, 'Teri yallig\'lanishi'),
        ('Clotrimazole 1%', 'Clotrimazole', 'Bayer', 22000, 'Teri', False, 'Zamburug\'ga qarshi'),
        ('Glycine 100mg', 'Glycine', 'Biotiki', 15000, 'Asab tizimi', False, 'Tinchlantiruvchi'),
        ('Nootropil 800mg', 'Piracetam', 'UCB', 65000, 'Asab tizimi', True, 'Xotira yaxshilaydi'),
    ]

    medicine_count = 0
    price_count = 0

    for name, generic, manufacturer, base_price, cat_name, prescription, desc in medicines_data:
        try:
            category = categories.get(cat_name)
            medicine = Medicine.objects.create(
                name=name,
                generic_name=generic,
                manufacturer=manufacturer,
                price=base_price,
                category=category,
                requires_prescription=prescription,
                in_stock=True,
                description=desc
            )
            medicine_count += 1
            print(f"  ✅ {name}: {base_price:,} so'm")

            # Har bir dorixona uchun narx
            if pharmacies:
                for pharmacy in pharmacies:
                    variation = random.uniform(-0.15, 0.25)
                    price = int(base_price * (1 + variation))
                    price = round(price / 1000) * 1000
                    in_stock = random.random() > 0.1

                    PharmacyPrice.objects.create(
                        medicine=medicine,
                        pharmacy=pharmacy,
                        price=price,
                        in_stock=in_stock,
                        quantity=random.randint(0, 100) if in_stock else 0
                    )
                    price_count += 1

        except Exception as e:
            print(f"  ❌ {name}: {e}")

    print(f"  📊 Jami dorilar: {medicine_count} ta")
    print(f"  📊 Jami narxlar: {price_count} ta")


def create_appointments():
    """Navbatlar yaratish - 150+ ta"""
    print("\n" + "=" * 60)
    print("📅 NAVBATLAR")
    print("=" * 60)

    doctors = list(Doctor.objects.all())
    patients = list(User.objects.filter(user_type='patient'))

    if not doctors or not patients:
        print("  ❌ Doctor yoki patient yo'q!")
        return

    symptoms_list = [
        'Bosh og\'rig\'i va bosh aylanishi',
        'Ko\'krak qafasida og\'riq',
        'Yuqori qon bosimi',
        'Umumiy holsizlik va charchoq',
        'Yo\'tal va nafas qisilishi',
        'Oshqozon og\'rig\'i',
        'Bo\'g\'imlar og\'rig\'i',
        'Uyqu buzilishi',
        'Tana harorati ko\'tarilishi',
        'Allergik reaksiya',
        'Teri toshmalari',
        'Ko\'z qizarishi',
        'Quloq og\'rig\'i',
        'Tish og\'rig\'i',
        'Stress va bezovtalik',
    ]

    times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
             '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

    today = date.today()
    count = 0

    # O'tgan 30 kun
    for day_offset in range(-30, 0):
        apt_date = today + timedelta(days=day_offset)

        for _ in range(random.randint(4, 8)):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            apt_time = random.choice(times)

            if Appointment.objects.filter(doctor=doctor, date=apt_date, time=apt_time).exists():
                continue

            status = random.choice(['completed', 'completed', 'completed', 'cancelled', 'no_show'])

            try:
                Appointment.objects.create(
                    doctor=doctor,
                    patient=patient,
                    date=apt_date,
                    time=apt_time,
                    status=status,
                    symptoms=random.choice(symptoms_list),
                    notes=f'Qabul #{count + 1}'
                )
                count += 1
            except:
                pass

    # Bugun
    for _ in range(random.randint(8, 15)):
        doctor = random.choice(doctors)
        patient = random.choice(patients)
        apt_time = random.choice(times)

        if Appointment.objects.filter(doctor=doctor, date=today, time=apt_time).exists():
            continue

        status = random.choice(['scheduled', 'confirmed', 'confirmed'])

        try:
            Appointment.objects.create(
                doctor=doctor,
                patient=patient,
                date=today,
                time=apt_time,
                status=status,
                symptoms=random.choice(symptoms_list),
                notes=f'Bugungi qabul #{count + 1}'
            )
            count += 1
        except:
            pass

    # Kelasi 14 kun
    for day_offset in range(1, 15):
        apt_date = today + timedelta(days=day_offset)

        for _ in range(random.randint(3, 6)):
            doctor = random.choice(doctors)
            patient = random.choice(patients)
            apt_time = random.choice(times)

            if Appointment.objects.filter(doctor=doctor, date=apt_date, time=apt_time).exists():
                continue

            status = random.choice(['scheduled', 'scheduled', 'confirmed'])

            try:
                Appointment.objects.create(
                    doctor=doctor,
                    patient=patient,
                    date=apt_date,
                    time=apt_time,
                    status=status,
                    symptoms=random.choice(symptoms_list),
                    notes=f'Kelgusi qabul #{count + 1}'
                )
                count += 1
            except:
                pass

    print(f"  ✅ {count} ta navbat yaratildi")
    print(f"  📊 Jami: {Appointment.objects.count()} ta")


def create_payments():
    """To'lovlar yaratish (timezone bilan!)"""
    print("\n" + "=" * 60)
    print("💳 TO'LOVLAR")
    print("=" * 60)

    appointments = list(Appointment.objects.filter(status__in=['completed', 'confirmed', 'scheduled']))

    if not appointments:
        print("  ❌ Navbatlar yo'q!")
        return

    providers = ['payme', 'click']
    payment_types = ['appointment', 'consultation']

    count = 0
    completed_count = 0
    pending_count = 0
    total_amount = 0

    for apt in appointments:
        if random.random() < 0.85 and apt.patient:
            doctor_price = apt.doctor.consultation_price if apt.doctor else 150000

            if apt.status == 'completed':
                status = 'completed'
                days_ago = (date.today() - apt.date).days
                paid_at = timezone.now() - timedelta(days=max(0, days_ago))
            elif apt.status == 'confirmed':
                status = random.choice(['completed', 'completed', 'pending'])
                if status == 'completed':
                    paid_at = timezone.now() - timedelta(days=random.randint(0, 3))
                else:
                    paid_at = None
            else:
                status = random.choice(['pending', 'pending', 'completed'])
                paid_at = timezone.now() if status == 'completed' else None

            try:
                Payment.objects.create(
                    user=apt.patient,
                    appointment=apt,
                    amount=doctor_price,
                    provider=random.choice(providers),
                    status=status,
                    payment_type=random.choice(payment_types),
                    paid_at=paid_at,
                    description=f"Dr. {apt.doctor.user.first_name} - {apt.doctor.specialization.name_uz if apt.doctor.specialization else 'Konsultatsiya'}"
                )
                count += 1

                if status == 'completed':
                    completed_count += 1
                    total_amount += doctor_price
                else:
                    pending_count += 1

            except Exception as e:
                print(f"  ❌ To'lov xatosi: {e}")

    print(f"  ✅ {count} ta to'lov yaratildi")
    print(f"  📊 To'langan: {completed_count} ta")
    print(f"  📊 Kutilmoqda: {pending_count} ta")
    print(f"  📊 Jami daromad: {total_amount:,} so'm")


def print_summary():
    """Yakuniy natija"""
    print("\n" + "=" * 60)
    print("📊 YAKUNIY NATIJA")
    print("=" * 60)

    print(f"  👤 Admin:          1 ta")
    print(f"  👥 Bemorlar:       {User.objects.filter(user_type='patient').count()} ta")
    print(f"  👨‍⚕️ Shifokorlar:    {User.objects.filter(user_type='doctor').count()} ta")
    print(f"  🏥 Mutaxassislik:  {Specialization.objects.count()} ta")
    print(f"  🏢 Shifoxonalar:   {Hospital.objects.count()} ta")
    print(f"  📂 Kategoriyalar:  {Category.objects.count()} ta")
    print(f"  💊 Dorilar:        {Medicine.objects.count()} ta")
    print(f"  🏪 Dorixonalar:    {Pharmacy.objects.count()} ta")
    print(f"  📅 Navbatlar:      {Appointment.objects.count()} ta")
    print(f"  💳 To'lovlar:      {Payment.objects.count()} ta")
    print(f"  💰 Narxlar:        {PharmacyPrice.objects.count()} ta")

    # Statistika
    print("\n" + "-" * 40)
    print("📈 STATISTIKA")
    print("-" * 40)

    completed_payments = Payment.objects.filter(status='completed')
    total_revenue = completed_payments.aggregate(total=models.Sum('amount'))['total'] or 0
    print(f"  💵 Jami daromad:   {int(total_revenue):,} so'm")

    completed_apts = Appointment.objects.filter(status='completed').count()
    pending_apts = Appointment.objects.filter(status__in=['scheduled', 'confirmed']).count()
    print(f"  ✅ Yakunlangan:    {completed_apts} ta qabul")
    print(f"  ⏳ Kutilmoqda:     {pending_apts} ta qabul")


def main():
    print("\n" + "=" * 60)
    print("🚀 HEALTHHUB UZ - TO'LIQ TEST MA'LUMOTLAR")
    print("=" * 60)
    print("  Professional poliklinika tizimi uchun")
    print("=" * 60)

    clear_all_data()
    create_admin()
    create_patients()
    create_specializations()
    create_hospitals()
    create_doctors()
    create_categories()
    create_pharmacies()
    create_medicines_with_prices()
    create_appointments()
    create_payments()
    print_summary()

    print("\n" + "=" * 60)
    print("📝 LOGIN MA'LUMOTLARI")
    print("=" * 60)
    print("  🔑 Admin:    admin@healthhub.uz / admin123")
    print("  🔑 Patient:  patient1@test.uz / patient123")
    print("  🔑 Doctor:   jasur@healthhub.uz / doctor123")
    print("=" * 60)
    print("✅ BARCHA MA'LUMOTLAR TAYYOR!")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    main()