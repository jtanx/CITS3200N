from api.models import *
from manager.utils import *
from django.http import HttpResponse
import tablib 
import tablib.packages.xlwt as xl
from datetime import datetime
from dateutil import tz

def export_survey(responses, format='csv'):
    '''responses: QuerySet of survey responses'''
    if not responses.exists():
        return None
        
    #Get the survey
    survey = responses[0].survey
    #Get the questions from the survey
    questions = survey.questions()
    
    #Initialise the output
    data = []
    book = []
    questnumber = []
    questdescription = []
    cohortdataset = {}
    to_zone = tz.tzlocal()

    #Append all the question details to list
    for q in questions:
        questnumber.append(q.number)
        questdescription.append(q.description)
    
    for response in responses:
        #Create NEW Dataset when id is present else append to current entry
        if response.creator.id not in cohortdataset:
            cohortdataset[response.creator.id] = entry = tablib.Dataset()
            
            entry.append_col(questnumber)
            entry.append_col(questdescription)
            ########STRUCTURE OF THE HEADER########
            entry.headers = ["Number", "Description"]
            ########NAME THE SHEET########
            entry.title = filenameify(response.creator.first_name + ' ' + 
                              response.creator.last_name)
        else:
            entry = cohortdataset[response.creator.id]
        
            
        qrs = response.responses(parsed=True)
        #Put response data in to temporary list
        tempres = []
        for qn in questnumber:
            if qn in qrs:
                ent = qrs[qn]
                if isinstance(ent, datetime):
                    ent = ent.astimezone(to_zone).replace(tzinfo=None)
                tempres.append(ent)
            else:
                tempres.append("")
        
        #Append to the column
        created = response.created
        created = created.astimezone(to_zone).replace(tzinfo=None).date()
        #created = ("=Date(%s, %s, %s)" % (created.year, created.month, created.day))
        entry.append_col(tempres, header=created)
        #entry.add_formatter(created
    
    #Initialize the Databook for export
    book = tablib.Databook()
    for k in cohortdataset:
        book.add_sheet(cohortdataset[k])
    return book
