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
    'date': date.today().strftime("%B %d"),
    'time': time.strftime('%l:%M %p'),
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

db.collection('nutrition').document(date.today().strftime("July102018")).set(data)