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

    breakfastEntries = []

    for entry in day_data.meals[0]:
        data = {
            'name': entry.name,
            'totals': entry.totals
        }
        breakfastEntries.append(data)

    lunchEntries = []

    for entry in day_data.meals[1]:
        data = {
            'name': entry.name,
            'totals': entry.totals
        }
        lunchEntries.append(data)

    dinnerEntries = []

    for entry in day_data.meals[2]:
        data = {
            'name': entry.name,
            'totals': entry.totals
        }
        dinnerEntries.append(data)


    snackEntries = []

    for entry in day_data.meals[3]:
        data = {
            'name': entry.name,
            'totals': entry.totals
        }
        snackEntries.append(data)

    data = {
        'timestamp': datetime.combine(day_data.date, datetime.min.time()),
        'date': day_data.date.strftime('%b %e'),
        'totals': day_data.totals,
        'breakfast': {
            'entries': breakfastEntries,
            'totals': day_data.meals[0].totals
        },
        'lunch': {
            'entries': lunchEntries,
            'totals': day_data.meals[1].totals
        },
        'dinner': {
            'entries': dinnerEntries,
            'totals': day_data.meals[2].totals
        },
        'snack': {
            'entries': snackEntries,
            'totals': day_data.meals[3].totals
        }
    }

    db.collection('nutrition').document(day_data.date.strftime('%b%e%y')).set(data)
   

db.collection('recent').document('totals').set(recent_data)


