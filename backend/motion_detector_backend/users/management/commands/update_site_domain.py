from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.conf import settings

class Command(BaseCommand):
    help = 'Updates the Site domain to match the SITE_DOMAIN setting'

    def handle(self, *args, **options):
        site_domain = getattr(settings, 'SITE_DOMAIN', 'localhost:8000')
        site_name = 'Motion Detector'
        
        try:
            site = Site.objects.get(id=settings.SITE_ID)
            site.domain = site_domain
            site.name = site_name
            site.save()
            self.stdout.write(self.style.SUCCESS(f'Successfully updated Site domain to {site_domain}'))
        except Site.DoesNotExist:
            Site.objects.create(id=settings.SITE_ID, domain=site_domain, name=site_name)
            self.stdout.write(self.style.SUCCESS(f'Created new Site with domain {site_domain}'))
