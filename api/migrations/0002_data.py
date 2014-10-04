# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.auth.models import User
from django.core.management import call_command
from django.conf import settings
import os

def add_users(apps, schema_editor):
    su = User.objects.create_superuser('admin', 'admin@no.no', 'admin')
    su.save()
    test = User.objects.create_user('test', 'test@no.no', 'test')
    test.first_name = "Test"
    test.last_name = "User"
    test.save()
    
def add_fixtures(apps, schema_editor):
    #Well this is... perplexing
    if not getattr(settings, 'ON_PAAS', False):
        call_command('loaddata', 'api_data.json')
    else:
        call_command('loaddata', os.environ['OPENSHIFT_REPO_DIR'] + '/wsgi/openshift/api_data.json')

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        ('authtoken', '0001_initial')
    ]

    operations = [
        migrations.RunPython(add_users),
        migrations.RunPython(add_fixtures)
    ]
