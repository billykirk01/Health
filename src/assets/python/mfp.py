import time
from datetime import datetime, date, timedelta
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

import myfitnesspal

client = myfitnesspal.Client('kbilly42','5pukgbam')
cred = credentials.Certificate('accountInfo.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def daterange(start_date, end_date):
    for n in range(int ((end_date - start_date).days)):
        yield start_date + timedelta(n)

start_date = date.today() - timedelta(days=4)
end_date = date.today() + timedelta(days=1)
recent_data = {
    'dates': [],
    'calories': [],
    'carbohydrates': [],
    'protein': [],
    'fat': []
}

for day in daterange(start_date, end_date):
    day_data = client.get_date(day)
    recent_data['dates'].append(day_data.date.strftime('%b %e'))
    recent_data['calories'].append(day_data.totals.get('calories', 0))
    recent_data['carbohydrates'].append(day_data.totals.get('carbohydrates', 0))
    recent_data['protein'].append(day_data.totals.get('protein', 0))
    recent_data['fat'].append(day_data.totals.get('fat', 0))
   

db.collection('recent').document('totals').set(recent_data)

today = client.get_date(date.today())

breakfastEntries = []

for entry in today.meals[0]:
    data = {
        'name': entry.name,
        'totals': entry.totals
    }
    breakfastEntries.append(data)

lunchEntries = []

for entry in today.meals[1]:
    data = {
        'name': entry.name,
        'totals': entry.totals
    }
    lunchEntries.append(data)

dinnerEntries = []

for entry in today.meals[2]:
    data = {
        'name': entry.name,
        'totals': entry.totals
    }
    dinnerEntries.append(data)


snackEntries = []

for entry in today.meals[3]:
    data = {
        'name': entry.name,
        'totals': entry.totals
    }
    snackEntries.append(data)

data = {
    'timestamp': datetime.combine(date.today(), datetime.min.time()),
    'date': date.today().strftime("%b %d"),
    'totals': today.totals,
    'breakfast': {
        'entries': breakfastEntries,
        'totals': today.meals[0].totals
    },
    'lunch': {
        'entries': lunchEntries,
        'totals': today.meals[1].totals
    },
    'dinner': {
        'entries': dinnerEntries,
        'totals': today.meals[2].totals
    },
    'snack': {
        'entries': snackEntries,
        'totals': today.meals[3].totals
    }
}

db.collection('nutrition').document(date.today().strftime("%B%d%Y")).set(data)