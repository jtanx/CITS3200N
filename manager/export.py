from api.models import *
import tablib 
import tablib.packages.xlwt as xl

def export_all():
    pass
    
def export_for_user():
    pass

def export_survey(responses=None, format='csv'):
    '''responses: QuerySet of survey responses'''
    if not responses.exists():
        return None
        
    #Get the survey
    survey = responses[0].survey
    #Get the questions from the survey
    questions = survey.questions()
    
    #Structure the output
    headers = ["Number", "Description"]
    data = []
    expmap = {}
    for q in questions:
        ent = [q.number, q.description]
        data.append(ent)
        expmap[q.number] = ent 
        
    
    for response in responses:
        qrs = response.responses()
        #Append the response to the table
        # headers.append("=Date(%s, %s, %s)" % (dt.year, dt.month, dt.day))
        headers.append(response.created.date())
        
        #For each question responded to
        for q in qrs:
            if q.qid.number in expmap:
                expmap[q.qid.number].append(q.entry)
    
    data = tablib.Dataset(*data, headers=headers)
    with open('test.xlsx', 'wb') as fp:
        fp.write(data.xlsx)
    print(data.csv)
