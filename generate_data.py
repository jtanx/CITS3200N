import sys,os,re,random,json
try:
    import enchant
    d = enchant.Dict("en-AU")
except ImportError:
    d = None

def generate_mtds(number=1):
    for i in range(number):
        resp = []
        for i in range(1,23):
            resp.append({'number' : i, 'entry' : random.randint(1,5)})

        print(json.dumps(resp))

def generate_sleep(number=1):
    for i in range(number):
        resp = []
        resp.append({'number' : 1, 'entry' : random.randint(1, 20)})
        resp.append({'number' : 2, 'entry' : random.randint(1, 5)})
        print(json.dumps(resp))

def generate_training(number=1):
    for i in range(number):
        types = ['Cycle', 'Running', 'Swimming']
        resp = []
        resp.append({'number' : 1, 'entry' : types[random.randint(0, 2)]})
        resp.append({'number' : 2, 'entry' : random.randint(1, 23)})
        resp.append({'number' : 3, 'entry' : random.randint(1, 5)})
        print(json.dumps(resp))

def generate_meals(number=1):
    alt = ["Salad", "Turkey", "Ham", "Chicken", "Nuts", "Air", "Rocks"]
    
    for i in range(number):
        types = ['Breakfast', 'Lunch', 'Dinner', 'Other']
        resp = []
        resp.append({'number' : 1, 'entry' : types[random.randint(0, 3)]})
        #resp.append({'number' : 2, 'entry' : alt
