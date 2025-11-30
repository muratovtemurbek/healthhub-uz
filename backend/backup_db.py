# backup_db.py
"""
Database backup utility
Ishlatish: python backup_db.py
"""
import os
import shutil
from datetime import datetime
from pathlib import Path


def backup_database():
    """SQLite database'ni backup qilish"""

    # Database fayl
    db_file = Path('db.sqlite3')

    if not db_file.exists():
        print("❌ Database fayli topilmadi!")
        print(f"   Qidirilgan joy: {db_file.absolute()}")
        return False

    # Backup papkasini yaratish
    backup_dir = Path('backups')
    backup_dir.mkdir(exist_ok=True)

    # Backup fayl nomi (timestamp bilan)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = backup_dir / f"db_backup_{timestamp}.sqlite3"

    try:
        # Backup yaratish
        shutil.copy2(db_file, backup_file)
        file_size = backup_file.stat().st_size / 1024  # KB

        print(f"✅ Database backup muvaffaqiyatli yaratildi!")
        print(f"   📁 Fayl: {backup_file}")
        print(f"   📊 Hajm: {file_size:.2f} KB")

        # Eski backup'larni o'chirish (5 tadan ortiq bo'lsa)
        cleanup_old_backups(backup_dir)

        return True

    except Exception as e:
        print(f"❌ Backup yaratishda xato: {str(e)}")
        return False


def cleanup_old_backups(backup_dir, keep_last=5):
    """Eski backup'larni o'chirish"""

    backups = sorted([
        f for f in backup_dir.glob('db_backup_*.sqlite3')
    ], key=lambda x: x.stat().st_mtime)

    if len(backups) > keep_last:
        old_backups = backups[:-keep_last]

        print(f"\n🗑️  Eski backup'larni tozalash...")
        for old_backup in old_backups:
            try:
                old_backup.unlink()
                print(f"   ✅ O'chirildi: {old_backup.name}")
            except Exception as e:
                print(f"   ❌ O'chirib bo'lmadi {old_backup.name}: {str(e)}")


def list_backups():
    """Mavjud backup'lar ro'yxati"""
    backup_dir = Path('backups')

    if not backup_dir.exists():
        print("❌ Backups papkasi topilmadi")
        return

    backups = sorted(
        backup_dir.glob('db_backup_*.sqlite3'),
        key=lambda x: x.stat().st_mtime,
        reverse=True
    )

    if not backups:
        print("📦 Hech qanday backup topilmadi")
        return

    print(f"\n📦 Mavjud backup'lar ({len(backups)} ta):\n")
    for i, backup in enumerate(backups, 1):
        size = backup.stat().st_size / 1024
        mtime = datetime.fromtimestamp(backup.stat().st_mtime)
        print(f"   {i}. {backup.name}")
        print(f"      Hajm: {size:.2f} KB")
        print(f"      Sana: {mtime.strftime('%Y-%m-%d %H:%M:%S')}\n")


def restore_backup(backup_file):
    """Backup'dan restore qilish"""
    backup_path = Path('backups') / backup_file

    if not backup_path.exists():
        print(f"❌ Backup topilmadi: {backup_file}")
        return False

    db_file = Path('db.sqlite3')

    # Joriy database'ni backup qilish
    if db_file.exists():
        safety_backup = Path('backups') / f"before_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sqlite3"
        shutil.copy2(db_file, safety_backup)
        print(f"🛡️  Xavfsizlik backup yaratildi: {safety_backup.name}")

    try:
        # Restore qilish
        shutil.copy2(backup_path, db_file)
        print(f"✅ Database muvaffaqiyatli restore qilindi!")
        print(f"   📁 Manba: {backup_file}")
        return True
    except Exception as e:
        print(f"❌ Restore qilishda xato: {str(e)}")
        return False


if __name__ == '__main__':
    import sys

    print("=" * 60)
    print("🏥 HealthHub UZ - Database Backup Utility")
    print("=" * 60)

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'list':
            list_backups()
        elif command == 'restore' and len(sys.argv) > 2:
            restore_backup(sys.argv[2])
        else:
            print("Noto'g'ri buyruq!")
            print("\nIshlatish:")
            print("  python backup_db.py           - Backup yaratish")
            print("  python backup_db.py list      - Backup'lar ro'yxati")
            print("  python backup_db.py restore <filename>  - Restore qilish")
    else:
        backup_database()

    print("=" * 60)