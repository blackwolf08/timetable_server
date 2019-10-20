from flask import Flask, request, jsonify
import requests 
import os
import xlrd 





def getTimeTable(batch,year,college,subs):
    subs = "15B11CI514,15B17CI574,17B1NMA531,15B11CI511,15B17CI571,15B17CI576,15B17CI575,15B1NHS434".split(",")
    batch = "B14"
    year = "3"
    loc = ""

    if year == "1":
        loc = ("B Tech I Sem.xlsx")
    elif year == "2":
        loc = ("B Tech III Sem.xlsx")
    elif year == "3":
        loc = ("B Tech V Sem.xlsx")
    elif year == "4":
        loc = ("B.TECH VII Sem.xlsx")
    else:
        loc = ("M TECH I Sem, DD.xlsx")


    wb = xlrd.open_workbook(loc) 
    sheet = wb.sheet_by_index(0) 



    for idx, sub in enumerate(subs):
        subs[idx] = sub[len(sub)-4:]


    key = {}
    key['MON'] = {}
    key['WED'] = {}
    key['THUR'] = {}
    key['FRI'] = {}
    key['TUES'] = {}
    key['SAT'] = {}
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['MON'][sheet.cell_value(1,i)] = []
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['TUES'][sheet.cell_value(1,i)] = []
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['WED'][sheet.cell_value(1,i)] = []
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['THUR'][sheet.cell_value(1,i)] = []
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['FRI'][sheet.cell_value(1,i)] = []
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['SAT'][sheet.cell_value(1,i)] = []
    if year == "3" or year == "1":
        del key['MON']['12 NOON-12.50 PM']
        del key['TUES']['12 NOON-12.50 PM']
        del key['WED']['12 NOON-12.50 PM']
        del key['THUR']['12 NOON-12.50 PM']
        del key['FRI']['12 NOON-12.50 PM']
        del key['SAT']['12 NOON-12.50 PM']

    if year == "2" or year == "4":
        del key['MON']['1- 1.50 PM']
        del key['TUES']['1- 1.50 PM']
        del key['WED']['1- 1.50 PM']
        del key['THUR']['1- 1.50 PM']
        del key['FRI']['1- 1.50 PM']
        del key['SAT']['1- 1.50 PM']

    for sub in subs:
        for i in range(sheet.ncols): 
            for j in range(85):
                if sheet.cell_value(j, i).find(sub) != -1 and (sheet.cell_value(j, i).find(f'-{batch[1:]}') != -1 or sheet.cell_value(j, i).find(batch) != -1 or sheet.cell_value(j, i).find("ABC") != -1):
                    row = j
                    while(row>0):
                        if sheet.cell_value(row,0) == "MON" or sheet.cell_value(row,0) == "TUES" or sheet.cell_value(row,0) == "WED" or sheet.cell_value(row,0) == "THUR" or sheet.cell_value(row,0) == "FRI" or sheet.cell_value(row,0) == "SAT":
                            day = sheet.cell_value(row,0)
                            break
                        row-=1
                    key[day][sheet.cell_value(1,i)].append(sheet.cell_value(j, i))
    return key

app = Flask(__name__) 


@app.route('/api/timetable', methods = ['POST'])
def TimeTable():
    batch = request.form["subject"]
    year = request.form["batch"]
    college = request.form["year"]
    subs = request.form["college"]
    timetable = getTimeTable(batch,year,college,subs)
    return jsonify(timetable)


if __name__ == '__main__':
    app.run()