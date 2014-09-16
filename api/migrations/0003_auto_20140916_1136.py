# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='surveyquestion',
            name='choices',
        ),
        migrations.AlterUniqueTogether(
            name='questionresponse',
            unique_together=set([('rid', 'qid')]),
        ),
    ]
