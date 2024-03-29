from flask import Flask, request, jsonify
import requests 
import os
import xlrd 


def getTimeTable(batch,year,college,subs):
    currDir = os.path.dirname(__file__)
    if year == "1":
        loc = (os.path.join(currDir,"B Tech I Sem.xlsx"))
    elif year == "2":
        loc = (os.path.join(currDir,"B Tech III Sem.xlsx"))
    elif year == "3":
        loc = (os.path.join(currDir,"B Tech V Sem.xlsx"))
    elif year == "4":
        loc = (os.path.join(currDir,"B.TECH VII Sem.xlsx"))
    else:
        loc = (os.path.join(currDir,"M TECH I Sem, DD.xlsx"))
#     if year == "1":
#         loc = "B Tech I Sem.xlsx"
#     elif year == "2":
#         loc = "B Tech III Sem.xlsx"
#     elif year == "3":
#         loc = "B Tech V Sem.xlsx"
#     elif year == "4":
#         loc = "B.TECH VII Sem.xlsx"
#     else:
#         loc ="M TECH I Sem, DD.xlsx"


    wb = xlrd.open_workbook(loc) 
    sheet = wb.sheet_by_index(0) 

    subs = subs.split(',')

    for idx, sub in enumerate(subs):
        subs[idx] = sub[len(sub)-4:]
        if year == "1":
            range_year = 102
        if year == "2":
            range_year = 107
        if year == "3":
            range_year = 85
        if year == "4":
            range_year = 70


    key = {}
    key['MON'] = {}
    key['WED'] = {}
    key['THUR'] = {}
    key['FRI'] = {}
    key['TUES'] = {}
    key['SAT'] = {}
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['MON'][sheet.cell_value(1,i)] = ""
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['TUES'][sheet.cell_value(1,i)] = ""
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['WED'][sheet.cell_value(1,i)] = ""
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['THUR'][sheet.cell_value(1,i)] = ""
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['FRI'][sheet.cell_value(1,i)] = ""
    for i in range(sheet.ncols): 
        if sheet.cell_value(1,i) != "":
            key['SAT'][sheet.cell_value(1,i)] = ""
    try:
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
    except:
        print("--del key err")
        pass
    batch = batch.replace(" ","")
    batch = batch.replace("%20","")
    batch = batch.replace("-","")
    batch = batch.upper()
    for sub in subs:
        for i in range(sheet.ncols): 
            for j in range(range_year):
                if sheet.cell_value(j, i).find(sub) != -1 and (sheet.cell_value(j, i).split("(")[0].find(f'-{batch[1:]}') != -1 or sheet.cell_value(j, i).split("(")[0].find(batch) != -1 or sheet.cell_value(j, i).split("(")[0].find("ABC") != -1 or sheet.cell_value(j, i).split("(")[0].find(f',{batch[1:]},') != -1 or sheet.cell_value(j, i).split("(")[0].find(f'{batch[1:]}-') != -1) and sheet.cell_value(j, i).split("(")[0].find(f'{batch[0:1]}') != -1:
                    row = j
                    while(row>0):
                        if sheet.cell_value(row,0) == "MON" or sheet.cell_value(row,0) == "TUES" or sheet.cell_value(row,0) == "WED" or sheet.cell_value(row,0) == "THUR" or sheet.cell_value(row,0) == "FRI" or sheet.cell_value(row,0) == "SAT":
                            day = sheet.cell_value(row,0)
                            break
                        row-=1
                    if key[day][sheet.cell_value(1,i)] != "" and sheet.cell_value(j, i).split("(")[0].find(batch) != -1:
                        key[day][sheet.cell_value(1,i)] = sheet.cell_value(j, i)
                    else:
                        key[day][sheet.cell_value(1,i)] = sheet.cell_value(j, i)

                    
    res = key
    json_data = {}
    to_send = {}

    json_data['monday'] = []
    json_data['tuesday'] = []
    json_data['wednesday'] = []
    json_data['thursday'] = []
    json_data['friday'] = []
    json_data['saturday'] = []

    for key in res.keys():
        json_data_key=""
        if key == "MON":
            json_data_key = "monday"
        if key == "TUES":
            json_data_key = "tuesday"
        if key == "WED":
            json_data_key = "wednesday"
        if key == "THUR":
            json_data_key = "thursday"
        if key == "FRI":
            json_data_key = "friday"
        if key == "SAT":
            json_data_key = "saturday"
        json_data[json_data_key] = []

        for child_key in res[key].keys():
            if len(res[key][child_key]) >2:
                class_type = ""
                time = ""
                if child_key.find("9.50") != -1:
                    time = "9:00"
                if child_key.find("10.50") != -1:
                    time = "10:00"
                elif child_key.find("11.50") != -1:
                    time = "11:00"
                elif child_key.find("12.50") != -1:
                    time = "12:00"
                elif child_key.find("1.50") != -1:
                    time = "1:00"
                elif child_key.find("2.50") != -1:
                    time = "2:00"
                elif child_key.find("3.50") != -1:
                    time = "3:00"
                elif child_key.find("4.50") != -1:
                    time = "4:00"
                if res[key][child_key][0:1] == "P":
                    class_type = "Practical"
                elif res[key][child_key][0:1] == "L":
                    class_type = "Lecture"
                elif res[key][child_key][0:1] == "T":
                    class_type = "Tutorial"
                teachers = ""
                for currIndex in range(len(res[key][child_key])-1,0,-1):
                    if(res[key][child_key][currIndex]=="/"):
                        teachers = res[key][child_key][currIndex+1:]
                        break
                venue=""
                for currIndex in range(len(res[key][child_key])-1,0,-1):
                    if(res[key][child_key][currIndex]=="-"):
                        for char in range(currIndex,len(res[key][child_key])):
                            if res[key][child_key][char] == "/":
                                venue = res[key][child_key][currIndex:char]
                                break
                        break
                code=""
                for currIndex in range(len(res[key][child_key])-1,0,-1):
                    if(res[key][child_key][currIndex]=="("):
                        for char in range(currIndex,len(res[key][child_key])):
                            if res[key][child_key][char] == ")":
                                code = res[key][child_key][currIndex+1:char]
                                break
                        break

                json_data[json_data_key].append([time,class_type,"",code,venue,teachers])
                
    return json_data


app = Flask(__name__) 


@app.route('/api/timetable', methods = ['POST'])
def TimeTable():
    subs = request.args.get("subject")
    batch = request.args.get("batch")
    year = request.args.get("year")
    college = request.args.get("college")
    timetable = getTimeTable(batch,year,college,subs)
    return jsonify(timetable)


if __name__ == '__main__':
    app.config["JSON_SORT_KEYS"] = False
    app.run()
