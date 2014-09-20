# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.auth.models import User
from django.core.management import call_command

def add_users(apps, schema_editor):
    su = User.objects.create_superuser('admin', 'admin@no.no', 'admin')
    su.save()
    test = User.objects.create('test', 'test@no.no', 'test')
    test.save()
    
def add_fixtures(apps, schema_editor):
    #Well this is... perplexing
    call_command('loaddata', 'api_data.json')

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_users),
        migrations.RunPython(add_fixtures)
    ]
