from django.contrib import admin
from api.models import *

# Register your models here.
admin.site.register(Survey)
admin.site.register(SurveyQuestion)
admin.site.register(QuestionResponse)
admin.site.register(SurveyResponse)
