from django.contrib import admin
from api.models import *

# Register your models here.
admin.site.register(DiaryType)
admin.site.register(Diary)
admin.site.register(Survey)
admin.site.register(SurveyQuestion)
