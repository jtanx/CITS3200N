# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Changeset',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('revision', models.IntegerField(default=0)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL, unique=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='QuestionResponse',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('entry', models.CharField(max_length=255)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Survey',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=255)),
                ('description', models.CharField(max_length=255, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SurveyQuestion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('number', models.IntegerField()),
                ('description', models.CharField(max_length=255)),
                ('qtype', models.CharField(default=b'TXT', max_length=3, choices=[(b'INT', b'Integer'), (b'INS', b'Integer scale'), (b'DTM', b'Date-Time'), (b'TXT', b'Text'), (b'CHC', b'Single choice')])),
                ('required', models.BooleanField(default=True)),
                ('choices', models.TextField(null=True, blank=True)),
                ('parent', models.ForeignKey(to='api.Survey')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SurveyResponse',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField()),
                ('submitted', models.DateTimeField(default=django.utils.timezone.now)),
                ('creator', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('survey', models.ForeignKey(to='api.Survey')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='surveyquestion',
            unique_together=set([('parent', 'number')]),
        ),
        migrations.AddField(
            model_name='questionresponse',
            name='qid',
            field=models.ForeignKey(to='api.SurveyQuestion'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='questionresponse',
            name='rid',
            field=models.ForeignKey(to='api.SurveyResponse', blank=True),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='questionresponse',
            unique_together=set([('rid', 'qid')]),
        ),
    ]
