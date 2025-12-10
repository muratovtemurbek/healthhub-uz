# accounts/management/commands/reset_db.py
from django.core.management.base import BaseCommand
from django.core.management import call_command
from accounts.models import User


class Command(BaseCommand):
    help = 'Reset database and create admin user'

    def handle(self, *args, **options):
        self.stdout.write('Bazani tozalash...')

        # Flush database
        call_command('flush', '--no-input')
        self.stdout.write(self.style.SUCCESS('Baza tozalandi!'))

        # Create admin
        self.stdout.write('Admin yaratish...')
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@healthhub.uz',
            password='admin123',
            first_name='Admin',
            last_name='User',
            user_type='admin'
        )
        self.stdout.write(self.style.SUCCESS(f'Admin yaratildi: {admin.username}'))

        self.stdout.write(self.style.SUCCESS('Tayyor!'))
