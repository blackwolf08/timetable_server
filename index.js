const fetch = require('node-fetch');
const express = require('express');
var url = require('url');

const app = express();

PORT = process.env.PORT || 5001;

let json_data = {};

var mon = [];
var tue = [];
var wed = [];
var thu = [];
var fri = [];
var sat = [];
var final = [];
var subjectCode = [];
var subjectShort = [];
var times = [9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0];
const Struct = (...keys) => (...v) =>
  keys.reduce((o, k, i) => {
    o[k] = v[i];
    return o;
  }, {});
const Item = Struct('code', 'short_code', 'name');
var data = [];
async function preprocess(batch, subject, year, college) {
  await fetch('http://qseven.co.in/jiit/' + college + '-' + year + '.json')
    .then(response => response.json())
    .then(json => (data = json));
  var raw = data;
  mon = [];
  tue = [];
  wed = [];
  thu = [];
  fri = [];
  sat = [];
  final = [];
  if (college == '128') {
    times = [9.0, 9.55, 10.5, 11.45, 12.4, 13.35, 14.3, 15.25, 16.2];
  }
  var count = 0;
  for (var i = 2; i < data.length; i++) {
    var x = raw[i];
    if (x[0] != 'TUES') {
      var y = x.slice(1);
      mon.push(y);
    } else {
      count = i;
      break;
    }
  }
  for (var i = count; i < data.length; i++) {
    var x = raw[i];
    if (x[0] != 'WED') {
      var y = x.slice(1);
      tue.push(y);
    } else {
      count = i;
      break;
    }
  }
  for (var i = count; i < data.length; i++) {
    var x = raw[i];
    if (x[0] != 'THUR') {
      var y = x.slice(1);
      wed.push(y);
    } else {
      count = i;
      break;
    }
  }
  for (var i = count; i < data.length; i++) {
    var x = raw[i];
    if (x[0] != 'FRI') {
      var y = x.slice(1);
      thu.push(y);
    } else {
      count = i;
      break;
    }
  }
  for (var i = count; i < data.length; i++) {
    var x = raw[i];
    if (x[0] != 'SAT') {
      var y = x.slice(1);
      fri.push(y);
    } else {
      count = i;
      break;
    }
  }
  for (var i = count; i < data.length; i++) {
    var x = raw[i];
    var y = x.slice(1);
    sat.push(y);
  }
  main(batch, subject, year);
}
function generator(day) {
  var DAY = [];
  for (var i = 0; i < day.length; i++) {
    DAY.push(day[i]);
  }
  for (var i = 0; i < DAY.length; i++) {
    var column = DAY[i];
    for (var j = 0; j < column.length; j++) {
      row = column[j];
      if (row == null) {
        continue;
      }
      li = row.trim();
      if (li == 'LUNCH') {
        continue;
      }
      if (li[0] == 'L') {
        typ = 'Lecture';
      } else if (li[0] == 'T') {
        typ = 'Tutorial';
      } else {
        typ = 'Practical';
      }
      var temp1 = li.split('(');
      var temp2 = temp1[1].split(')');
      var temp3 = li.indexOf(')');
      var subject_code = temp2[0];
      var batches = temp1[0].substr(1);
      batches.trim();
      batches = batches.split(',');
      var all_batches = '';
      for (var k = 0; k < batches.length; k++) {
        b = batches[k];
        var dash = b.indexOf('-');
        if (dash == -1) {
          if (/\d/.test(b)) {
            all_batches += b + ' ';
          } else {
            if (b.indexOf('A') != -1) {
              for (var m = 1; m <= 14; m++) {
                all_batches += 'A' + m + ' ';
              }
            }
            if (b.indexOf('B') != -1) {
              for (var m = 1; m <= 14; m++) {
                all_batches += 'B' + m + ' ';
              }
            }
            if (b.indexOf('C') != -1) {
              for (var m = 1; m <= 3; m++) {
                all_batches += 'C' + m + ' ';
              }
            }
            if (b.indexOf('F') != -1) {
              for (var m = 1; m <= 8; m++) {
                all_batches += 'F' + m + ' ';
              }
            }
            if (b.indexOf('E') != -1) {
              for (var m = 1; m <= 8; m++) {
                all_batches += 'E' + m + ' ';
              }
            }
          }
        } else {
          var first = parseInt(b.slice(1, dash)); //
          var second = b.slice(dash + 1); //
          if (second.charAt(0) == b.charAt(0)) {
            second = second.slice(1); //
          }
          second = parseInt(second);
          for (var x = first; x < second + 1; x++) {
            all_batches += b[0] + x.toString() + ' ';
          }
        }
      }
      all_batches = all_batches.trim();
      var time = times[j];
      var classroom = '';
      var teachers = '';
      var x = row.split('/');
      if (x.length == 3) {
        classroom = x[1].trim();
        teachers = x[2].trim();
      } else {
        slash = li.indexOf('/');
        classroom = li.slice(temp3 + 1, slash).trim(); //
        teachers = li.slice(slash + 1).trim(); //
      }
      final.push([time, typ, all_batches, subject_code, classroom, teachers]);
    }
  }
}
mon_tt = [];
tue_tt = [];
wed_tt = [];
thu_tt = [];
fri_tt = [];
sat_tt = [];

function monday(batch, subjects) {
  generator(mon);
  mon_tt = [];
  for (var i = 0; i < final.length; i++) {
    li = final[i];
    for (var j = 0; j < subjects.length; j++) {
      sub = subjects[j];
      if (li[3] == sub) {
        li[3] = subjectCode[subjectShort.indexOf(sub)];
        var batches = li[2].split(' ');
        for (var k = 0; k < batches.length; k++) {
          b = batches[k];
          if (b == batch) {
            mon_tt.push(li);
          } else if (b == batch.slice(0, 1)) {
            mon_tt.push(li);
          }
        }
      }
    }
  }
  for (var i = 0; i < mon_tt.length; i++) {
    for (var j = 0; j < mon_tt.length - i - 1; j++) {
      if (mon_tt[j][0] > mon_tt[j + 1][0]) {
        var tmp = mon_tt[j]; //Temporary variable to hold the current number
        mon_tt[j] = mon_tt[j + 1]; //Replace current number with adjacent number
        mon_tt[j + 1] = tmp; //Replace adjacent number with current number
      }
    }
  }
  for (var i = 0; i < mon_tt.length; i++) {
    if (mon_tt[i][0] > 12) {
      mon_tt[i][0] -= 12;
    }
    mon_tt[i][0] = mon_tt[i][0] + '';
    if (mon_tt[i][0].indexOf('.') == -1) {
      mon_tt[i][0] = mon_tt[i][0] + ':00';
    } else {
      var temp = mon_tt[i][0].split(':');
      if (temp[i][0].length == 1) {
        mon_tt[i][0] = mon_tt[i][0].replace('.', ':');
        mon_tt[i][0] = mon_tt[i][0] + '0';
      }
    }
  }
  final = [];
}

function tuesday(batch, subjects) {
  generator(tue);
  tue_tt = [];
  for (var i = 0; i < final.length; i++) {
    li = final[i];
    for (var j = 0; j < subjects.length; j++) {
      sub = subjects[j];
      if (li[3] == sub) {
        li[3] = subjectCode[subjectShort.indexOf(sub)];
        var batches = li[2].split(' ');
        for (var k = 0; k < batches.length; k++) {
          b = batches[k];
          if (b == batch) {
            tue_tt.push(li);
          } else if (b == batch.slice(0, 1)) {
            tue_tt.push(li);
          }
        }
      }
    }
  }
  for (var i = 0; i < tue_tt.length; i++) {
    //Notice that j < (length - i)
    for (var j = 0; j < tue_tt.length - i - 1; j++) {
      //Compare the adjacent positions
      if (tue_tt[j][0] > tue_tt[j + 1][0]) {
        //Swap the numbers
        var tmp = tue_tt[j]; //Temporary variable to hold the current number
        tue_tt[j] = tue_tt[j + 1]; //Replace current number with adjacent number
        tue_tt[j + 1] = tmp; //Replace adjacent number with current number
      }
    }
  }
  for (var i = 0; i < tue_tt.length; i++) {
    if (tue_tt[i][0] > 12) {
      tue_tt[i][0] -= 12;
    }
    tue_tt[i][0] = tue_tt[i][0] + '';
    if (tue_tt[i][0].indexOf('.') == -1) {
      tue_tt[i][0] = tue_tt[i][0] + ':00';
    } else {
      var temp = tue_tt[i][0].split(':');
      if (temp[i][0].length == 1) {
        tue_tt[i][0] = tue_tt[i][0].replace('.', ':');
        tue_tt[i][0] = tue_tt[i][0] + '0';
      }
    }
  }
  final = [];
}

function wednesday(batch, subjects) {
  generator(wed);
  //if( subject matches search for batch
  wed_tt = [];
  for (var i = 0; i < final.length; i++) {
    li = final[i];
    for (var j = 0; j < subjects.length; j++) {
      sub = subjects[j];
      if (li[3] == sub) {
        li[3] = subjectCode[subjectShort.indexOf(sub)];
        var batches = li[2].split(' ');
        for (var k = 0; k < batches.length; k++) {
          b = batches[k];
          if (b == batch) {
            wed_tt.push(li);
          } else if (b == batch.slice(0, 1)) {
            wed_tt.push(li);
          }
        }
      }
    }
  }
  for (var i = 0; i < wed_tt.length; i++) {
    //Notice that j < (length - i)
    for (var j = 0; j < wed_tt.length - i - 1; j++) {
      //Compare the adjacent positions
      if (wed_tt[j][0] > wed_tt[j + 1][0]) {
        //Swap the numbers
        var tmp = wed_tt[j]; //Temporary variable to hold the current number
        wed_tt[j] = wed_tt[j + 1]; //Replace current number with adjacent number
        wed_tt[j + 1] = tmp; //Replace adjacent number with current number
      }
    }
  }
  for (var i = 0; i < wed_tt.length; i++) {
    if (wed_tt[i][0] > 12) {
      wed_tt[i][0] -= 12;
    }
    wed_tt[i][0] = wed_tt[i][0] + '';
    if (wed_tt[i][0].indexOf('.') == -1) {
      wed_tt[i][0] = wed_tt[i][0] + ':00';
    } else {
      var temp = wed_tt[i][0].split(':');
      if (temp[i][0].length == 1) {
        wed_tt[i][0] = wed_tt[i][0].replace('.', ':');
        wed_tt[i][0] = wed_tt[i][0] + '0';
      }
    }
  }
  final = [];
}

function thursday(batch, subjects) {
  generator(thu);
  //if( subject matches search for batch
  thu_tt = [];
  for (var i = 0; i < final.length; i++) {
    li = final[i];
    for (var j = 0; j < subjects.length; j++) {
      sub = subjects[j];
      if (li[3] == sub) {
        li[3] = subjectCode[subjectShort.indexOf(sub)];
        var batches = li[2].split(' ');
        for (var k = 0; k < batches.length; k++) {
          b = batches[k];
          if (b == batch) {
            thu_tt.push(li);
          } else if (b == batch.slice(0, 1)) {
            thu_tt.push(li);
          }
        }
      }
    }
  }
  for (var i = 0; i < thu_tt.length; i++) {
    //Notice that j < (length - i)
    for (var j = 0; j < thu_tt.length - i - 1; j++) {
      //Compare the adjacent positions
      if (thu_tt[j][0] > thu_tt[j + 1][0]) {
        //Swap the numbers
        var tmp = thu_tt[j]; //Temporary variable to hold the current number
        thu_tt[j] = thu_tt[j + 1]; //Replace current number with adjacent number
        thu_tt[j + 1] = tmp; //Replace adjacent number with current number
      }
    }
  }
  for (var i = 0; i < thu_tt.length; i++) {
    if (thu_tt[i][0] > 12) {
      thu_tt[i][0] -= 12;
    }
    thu_tt[i][0] = thu_tt[i][0] + '';
    if (thu_tt[i][0].indexOf('.') == -1) {
      thu_tt[i][0] = thu_tt[i][0] + ':00';
    } else {
      var temp = thu_tt[i][0].split(':');
      if (temp[i][0].length == 1) {
        thu_tt[i][0] = thu_tt[i][0].replace('.', ':');
        thu_tt[i][0] = thu_tt[i][0] + '0';
      }
    }
  }
  final = [];
}

function friday(batch, subjects) {
  generator(fri);
  //if( subject matches search for batch
  fri_tt = [];
  for (var i = 0; i < final.length; i++) {
    li = final[i];
    for (var j = 0; j < subjects.length; j++) {
      sub = subjects[j];
      if (li[3] == sub) {
        li[3] = subjectCode[subjectShort.indexOf(sub)];
        var batches = li[2].split(' ');
        for (var k = 0; k < batches.length; k++) {
          b = batches[k];
          if (b == batch) {
            fri_tt.push(li);
          } else if (b == batch.slice(0, 1)) {
            fri_tt.push(li);
          }
        }
      }
    }
  }
  for (var i = 0; i < fri_tt.length; i++) {
    //Notice that j < (length - i)
    for (var j = 0; j < fri_tt.length - i - 1; j++) {
      //Compare the adjacent positions
      if (fri_tt[j][0] > fri_tt[j + 1][0]) {
        //Swap the numbers
        var tmp = fri_tt[j]; //Temporary variable to hold the current number
        fri_tt[j] = fri_tt[j + 1]; //Replace current number with adjacent number
        fri_tt[j + 1] = tmp; //Replace adjacent number with current number
      }
    }
  }
  for (var i = 0; i < fri_tt.length; i++) {
    if (fri_tt[i][0] > 12) {
      fri_tt[i][0] -= 12;
    }
    fri_tt[i][0] = fri_tt[i][0] + '';
    if (fri_tt[i][0].indexOf('.') == -1) {
      fri_tt[i][0] = fri_tt[i][0] + ':00';
    } else {
      var temp = fri_tt[i][0].split(':');
      if (temp[i][0].length == 1) {
        fri_tt[i][0] = fri_tt[i][0].replace('.', ':');
        fri_tt[i][0] = fri_tt[i][0] + '0';
      }
    }
  }
  final = [];
}

function saturday(batch, subjects) {
  generator(sat);
  //if( subject matches search for batch
  sat_tt = [];
  for (var i = 0; i < final.length; i++) {
    li = final[i];
    for (var j = 0; j < subjects.length; j++) {
      sub = subjects[j];
      if (li[3] == sub) {
        li[3] = subjectCode[subjectShort.indexOf(sub)];
        var batches = li[2].split(' ');
        for (var k = 0; k < batches.length; k++) {
          b = batches[k];
          if (b == batch) {
            sat_tt.push(li);
          } else if (b == batch.slice(0, 1)) {
            sat_tt.push(li);
          }
        }
      }
    }
  }
  for (var i = 0; i < sat_tt.length; i++) {
    //Notice that j < (length - i)
    for (var j = 0; j < sat_tt.length - i - 1; j++) {
      //Compare the adjacent positions
      if (sat_tt[j][0] > sat_tt[j + 1][0]) {
        //Swap the numbers
        var tmp = sat_tt[j]; //Temporary variable to hold the current number
        sat_tt[j] = sat_tt[j + 1]; //Replace current number with adjacent number
        sat_tt[j + 1] = tmp; //Replace adjacent number with current number
      }
    }
  }
  for (var i = 0; i < sat_tt.length; i++) {
    if (sat_tt[i][0] > 12) {
      sat_tt[i][0] -= 12;
    }
    sat_tt[i][0] = sat_tt[i][0] + '';
    if (sat_tt[i][0].indexOf('.') == -1) {
      sat_tt[i][0] = sat_tt[i][0] + ':00';
    } else {
      var temp = sat_tt[i][0].split(':');
      if (temp[i][0].length == 1) {
        sat_tt[i][0] = sat_tt[i][0].replace('.', ':');
        sat_tt[i][0] = sat_tt[i][0] + '0';
      }
    }
  }
  final = [];
  return sat_tt;
}
async function collectData(batch, subject, year, college) {
  var sub = [];
  await fetch('http://qseven.co.in/jiit/' + college + '-' + year + 'sub.json')
    .then(response => response.json())
    .then(json => (sub = json));
  var myItem = [];
  for (var i = 0; i < sub.length; i++) {
    var row = sub[i];
    for (var j = 0; j < row.length; j++) {
      if (row[j] != null) {
        myItem.push(Item(row[j + 1].trim(), row[j].trim(), row[j + 2]));
        j += 2;
      }
    }
  }
  for (var i = 0; i < myItem.length; i++) {
    if (subject.indexOf(myItem[i].code) != -1) {
      subjectCode.push(subject[subject.indexOf(myItem[i].code)]);
      subjectShort.push(myItem[i].short_code);
      subject[subject.indexOf(myItem[i].code)] = myItem[i].short_code;
    }
  }
  let json_data = preprocess(batch, subject, year, college);
  return json_data;
}

function main(batch, subjects, year) {
  monday(batch, subjects);
  tuesday(batch, subjects);
  wednesday(batch, subjects);
  thursday(batch, subjects);
  friday(batch, subjects);
  saturday(batch, subjects);
  json_data['monday'] = mon_tt;
  json_data['tuesday'] = tue_tt;
  json_data['wednesday'] = wed_tt;
  json_data['thursday'] = thu_tt;
  json_data['friday'] = fri_tt;
  json_data['saturday'] = sat_tt;
  //   console.log(json_data);
  return json_data;
}

app.get('/', async (req, res) => {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var batch = query['batch'];
  var subject = query['subject'].split(',');
  if (subject[subject.length - 1] == '') {
    subject.pop();
  }
  var year = query['year'];
  var college = query['college'];
  console.log(subject, year, college, batch);
  await collectData(batch, subject, year, college);
  res.json(json_data);
});

app.listen(PORT, () => {
  console.log('App started!');
});
