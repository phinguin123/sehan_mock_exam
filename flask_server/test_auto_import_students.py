from db import DBHelper
from utils.utils import get_grade_id, get_subject_id
import re


def clean_name(name):
    match = re.match(r"^[가-힣]+", name)
    if match:
        return match.group()
    return name


db_helper = DBHelper()


def test_auto_import_students(name, school, email, phone_number, grade_name, subjects):
    sql = """
        SELECT 1 FROM students 
        WHERE 
        email = %s
    """
    existing_email = db_helper.fetch_one(sql, (email))
    if existing_email:
        print("student already exists:", name)
        return {"message": "Email or name already exists"}, 400

    # Get grade_id from the database using helper function
    grade_id = get_grade_id(db_helper, grade_name)
    if not grade_id:
        return {"message": f"Grade '{grade_name}' not found"}, 400

    # Check if name already exists
    sql = """
        SELECT COUNT(*) FROM students
        WHERE
        name = %s
    """
    existing_name = db_helper.fetch_one(sql, (name))

    # if name already exists, append a number to the name
    # to make it unique
    if existing_name["COUNT(*)"] > 0:
        name = name + str(existing_name["COUNT(*)"] + 1)

    # Insert student data into the students table and get the student ID
    sql = "INSERT INTO students (name, school, email, phone_number, grade_id) VALUES (%s, %s, %s, %s, %s)"
    student_id = db_helper.execute(sql, (name, school, email, phone_number, grade_id))

    print("student_id value", student_id)

    # Insert subjects into student_subjects table with validation
    for subject in subjects:
        subject_name = subject

        subject_id = get_subject_id(db_helper, subject_name)
        if not subject_id:
            print(f"Subject '{subject_name}' not found")
            return

        sql_insert_student_subject = (
            "INSERT INTO student_subjects (student_id, subject_id) VALUES (%s, %s)"
        )
        db_helper.execute(sql_insert_student_subject, (student_id, subject_id))


data = """
1,,양현준,태국,American school of Bombay,10,yangh4@asbindia.org,821099790522,영어,수학,화학,,
2,,구성운,인도,Wellington College International School Pune,10,7777777neon@gmail.com,821047610941,영어,수학,화학,,물리
3,,구민준,인도,Wellington College International School Pune,9,happyleogu@gmail.com,821047610941,영어,수학,,,물리
4,,김건우,중국,Changchun American International School,9, ytla21@naver.com,821085769737,영어,수학,화학,생물,
5,,김동하,싱가포르,ACS International,9,evank0909@gmail.com,6590964262,영어,수학,화학,생물,물리
6,,정유찬,싱가포르,One World International School,10,Yuchan.chung123@gmail.com,82038130366,영어,수하,화학,생물,
7,,한승헌,캅보디아,International school of Phnom Penh,9,hanslulu78@gmail.com,85512773901,영어,수학,화학,생물,
8,,강민건,인도,Wellington College International Pune,10,Miguelkang0902@gmail.com,918484940837,영어,수학,화학,생물,물리
9,,이지아,인도,Pathway International School,10,jia.lee@pathways.in,821047560274,영어,수학,화학,,물리
10,,김연지D,인도,Mahindra International School,10,rivermt07@gmail.com,919345003626,영어,수학,화학,생물,
11,,박은수,인도네시아,Jakarta Intercultural School,10,68005@jisedu.or.id,6281119621171,영어,수학,화학,,
12,,최승온,중국,American International School of Guangzhou,9,alyssa26@gmail.com,821082575527,영어,수학,화학,생물,물리
13,,김성백,인도,Harrow international school Bangaluru,10,jubaa111@gmail.com,919972602746,영어,수학,화학,,물리
14,,이주현X,중국,Nanjing International School,10, juhyunlee@nanjing-school.com,8613382059814,영어,수학,,,물리
15,,차유진,싱가포르,Canadian international school,10,jenny0809@gmail.com,6589383005,영어,수학,화학,생물,
16,,이혜랑,인도,Wellington College International Pune,9,eric740523@gmail.com,821036824823,영어,수학,화학,생물,
17,,서지은,브라질,Sabis internatioal school,9,eunhyo0105@gmail.com,821080818785,영어,수학,화학,,
18,,서지효,브라질,Sabis internatioal school,10,jihyoportugues@gmail.com,821080818785,영어,수학,화학,생물,
19,,임형원,사우디아라비아,This is a British International School in Jeddah,10,imhengyuan@gmail.com,9660565672051,영어,수학,화학,생물,물리
20,,홍민서,중국,Suzhou Singapore international school,10,gaul.lisa.h@gmail.com,821035059323,영어,수학,,,물리
21,,이재현,중국,International School of Beijing,9,happygim@gmail.com,821034686819,영어,수학,화학,생물,물리
22,,안상현,인도,Lancers International School,9,ansangyee1011@gmail.com,821071363486,영어,수학,,생물,물리
23,,성승우,인도,Wellington College International Pune,10,sseungwoo2024@gmail.com,821050496998,영어,수학,화학,생물,물리
24,,김지빈,체코,International School of Prague,9,105003@isp.cz,420733589773,영어,수학,화학,생물,물리
25,,서정빈,체코,International School of Prague,9,104887@isp.cz,420724614520,영어,수학,화학,생물,물리
26,,강민서,인도,Canadian International School,9,coolwalkerms9@gmail.com,821062665902,영어,수학,,생물,
27,,오수연,중국,Shanghai American School,10,jjangceo0512@gmail.com,채널로발송,영어,수학,,,물리
28,,김송이,베트남,Reigate Grammar School Vietnam,10,speanut2002@naver.com,840977162300,영어,수학,화학,생물,물리
29,,박주하,인도,Wellington College International Pune,10,aqua1525@gmail.com,821088023728,영어,수학,화학,생물,물리
30,,김소은,인도,Wellington College International Pune,10,soeunlove0924@gmail.com,821072515123,,수학,화학,생물,
31,,김연준,중국,International School of Beijing,10,Aaron.kim@student.isb.bj.edu.cn,8613509637121,,수학,,,물리
32,,이수민,인도,American Embassy School,10,nerokim0329@gmail.com,821096139499,영어,수학,,생물,
33,,김태희,말레이시아,Mont'Kiara International School,10,taeheekimesther@gmail.com,60108973966,영어,수학,화학,,
34,,지현서,중국,남경 NIS,9,cherryblossomok@naver.com,821020277907,영어,수학,화학,,
35,,김학영,네덜란드,American school of the Hague,10,hakim@ash.nl,821073110323,영어,수학,,,물리
36,,손지유,중국,British school of Beijing,10,jiyoo_son@britishschool.org.cn,821089714289,영어,수학,화학,생물,물리
37,,함윤슬,미국,Auburn Junior High School,10,viviham22457@gmail.com,13347581999,영어,수학,화학,,
38,,이대경,인도,Lancers International School,9,748547zzz@naver.com,010-5247-7972,영어,수학,화학,생물,물리
39,,배병현,체코,Riverside International School,10,choijinhee93@gmail.com,420605957930,영어,수학,,생물,
40,,박수진,홍콩,ESF International Schools in Hong Kong,9,parks36@gmail.com,821073359894,영어,수학,,생물,
41,,황영신,인도,Mahindra International School,9,yeongsin2010@gmail.com,821085581011,영어,수학,화학,생물,
42,,서예원,인도,wellington college international school in Pune,10,syewon09@gmail.com,821048433606,영어,수학,화학,생물,물리
43,,정다은,싱가포르,Australian international school,9,lovedaeun7@gmail.com,821092901700,영어,수학,화학,,
44,,민동규,독일,International School Frankfurt,10,,4915123738303,,,,,
45,,이지율D,말레이시아,The British School of Kuala Lumpur,9,jiyul_lee@britishschool.edu.my,600177268772,영어,수학,화학,생물,물리
46,,김서윤,중국,American International School of Guangzhou,10,rashulia120@gmail.com,821026446374,영어,수학,화학,생물,물리
47,,김동준L,폴란드,The British school of Warsaw,10,shong1977@naver.com,821020570905,영어,수학,화학,생물,물리
48,,민동규,독일,International school of Frankfurt,10,dgjustin.minn@gmail.com,15123738303,영어,수학,,생물,
49,,나찬우,이집트,Berlin Brandenburg international school,10,chanu.ra2812@gmail.com,821087602812,영어,수학,화학,생물,
50,,안재희,인도,American Embassy School,10,callas0202@gmail.com,821066689526,영어,수학,,생물,
51,,위다겸,영국,Acs international school cobham,10,dakyumwi@gmail.com,821076106741,영어,수학,화학,생물,물리
52,,이상민,중국,Utahloy International School Guangzhou,10,luvwzrd@gmail.com,821066446068,영어,수학,,,
54,,박채영,중국,QSI international school,10,,821073742104,,,,,
55,,김도연,인도,Mahindra International School,10,doyeonk2028@misp.org,821092750201,,수학,화학,,물리
"""

subject_translation = {
    "영어A": "English A",
    "영어 A": "English A",
    "영어B": "English B",
    "수학": "Math AA",
    "한국어": "Korean Lit",
    "화학": "Chemistry",
    "생물": "Biology",
    "물리": "Physics",
    "경제": "Economics",
    "경영": "Business",
}

preib_subject_translation = {
    "영어": "English",
    "수학": "Math",
    "화학": "Chemistry",
    "생물": "Biology",
    "물리": "Physics",
}

students = []

# Split into lines
for line in data.strip().splitlines():
    fields = line.split(",")

    raw_subjects = [subject for subject in fields[8:] if subject]

    translated_subjects = [
        preib_subject_translation.get(subject, subject)  # If no match, keep original
        for subject in raw_subjects
    ]

    test_auto_import_students(
        clean_name(fields[2]),
        fields[4],
        fields[6],
        fields[7],
        "pre-IB",  # grade_name
        translated_subjects,
    )
#     student = {
#         "name": fields[2],
#         "school": fields[4],
#         "grade": fields[5],
#         "email": fields[6],
#         "phone_number": fields[7],
#         "subjects": translated_subjects,  # From index 10 onwards are subjects
#     }

#     students.append(student)

# # Print the extracted students
# for student in students:
#     print(student)
