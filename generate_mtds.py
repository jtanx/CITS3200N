import sys,os,re,random,json

def generate_mtds(number=1):
    for i in range(number):
        resp = []
        for i in range(1,23):
            resp.append({'qid' : i, 'entry' : random.randint(1,5)})

        print(json.dumps(resp))
        
