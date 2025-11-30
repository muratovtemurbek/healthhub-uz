import subprocess
import sys
import os
import time


def main():
    processes = []
    base_dir = os.path.dirname(os.path.abspath(__file__))

    try:
        print("🚀 Django server ishga tushmoqda...")
        django_proc = subprocess.Popen(
            [sys.executable, 'manage.py', 'runserver'],
            cwd=base_dir
        )
        processes.append(django_proc)
        time.sleep(3)

        print("🤖 Telegram bot ishga tushmoqda...")
        bot_proc = subprocess.Popen(
            [sys.executable, 'manage.py', 'runbot'],
            cwd=base_dir
        )
        processes.append(bot_proc)

        print("\n" + "=" * 50)
        print("✅ Django + Telegram Bot ishga tushdi!")
        print("=" * 50)
        print("🌐 Frontend: http://localhost:8000")
        print("📡 API: http://localhost:8000/api/")
        print("👨‍💼 Admin: http://localhost:8000/admin/")
        print("🤖 Telegram Bot: @healthubuz_bot")
        print("=" * 50)
        print("\nTo'xtatish uchun Ctrl+C bosing\n")

        for proc in processes:
            proc.wait()

    except KeyboardInterrupt:
        print("\n⏹️ To'xtatilmoqda...")
        for proc in processes:
            proc.terminate()
        print("👋 Xayr!")


if __name__ == '__main__':
    main()