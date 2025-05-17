from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from motion_detector_backend.sensors.models import Device

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up the ESP32_001 device with the correct owner and token'

    def handle(self, *args, **options):
        # Get the owner with the specific email
        try:
            owner = User.objects.get(email='oracle.tech.143@gmail.com')
            self.stdout.write(self.style.SUCCESS(f'Found owner: {owner}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Owner with email oracle.tech.143@gmail.com not found'))
            return

        # Get or create the device with the correct owner and token
        device, created = Device.objects.get_or_create(
            device_id='ESP32_001',
            defaults={
                'name': 'ESP32 Device ESP32_001',
                'location': 'Living Room',
                'owner': owner,
                'token': '54836780fc03bcdff737d0eadbe16156f461342f'
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created device: {device}'))
        else:
            # If the device exists but doesn't have the token set, update it
            if not device.token:
                device.token = '54836780fc03bcdff737d0eadbe16156f461342f'
                device.save(update_fields=['token'])
                self.stdout.write(self.style.SUCCESS(f'Updated device with token: {device}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Device already exists with token: {device}'))

        # Ensure the device has the correct owner
        if device.owner != owner:
            device.owner = owner
            device.save(update_fields=['owner'])
            self.stdout.write(self.style.SUCCESS(f'Updated device owner to: {owner}'))

        self.stdout.write(self.style.SUCCESS(f'Device: {device}, Owner: {device.owner}, Token: {device.token}'))
