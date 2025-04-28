from api.reports import GenerateStudentReport  # Import your function

# Sample test data
student_id = 1
student_name = "John Doe"
student_grade = "11"
student_school = "Sehanacademy international school"
student_subjects = ["English A", "Math", "Chemistry", "Physics", "Biology", "Korean"]
abbr_subjects = ["Eng A", "Math", "Chem", "Phys", "Bio", "Kor"]
student_grades = [6, 7, 5, 7, 6, 3]
average_grades = [6.43, 6.5, 6.1, 6.5, 6.2, 5.5]
formatted_student_grades = [f"{grade}/7" for grade in student_grades]
formatted_average_grades = [f"{grade}/7" for grade in average_grades]
student_percentiles = [76, 84, 61, 84, 68, 40]
average_percentiles = [64, 70, 68, 70, 66, 58]
student_comments = [
    """이번주에는 오리엔테이션과 함께 Advertisement에 대한 진도로 시작을
        했습니다. 대중적인 광고에 대한 분석과 함께 일반적으로 어떤 부분들이 중요한지에
        대해서도 강의를 진행하였고 추가적으로 IB에서 실제로 나왔던 광고에 대한 에세이를
        진단평가로 제출했습니다. 2주차 월요일에는 이 진단평가에 대한 해설과 더불어 Political
        Cartoon에 대한 추가적인 강의를 진행할 예정입니다. 아직 첫 주이기 때문에 개별
        피드백보다는 전체적인 진도에 초점을 맞춘 피드백이라는 점 양해 부탁드립니다.
        다음주 부터는 개별적인 피드백도 나가도록 하겠습니다 감사합니다!
        """,
    """이번주는 Integration의 계산 방법(substitution, by parts)을 배웠습니다.
        다음주부터는 Integration을 활용한 Application 문제 유형들을 다룰 예정이니 이번주
        배운 Integration 계산 방법을 잘 숙지하고 오시기 바랍니다.
        Integration의 계산 방법과 공식을 잘 숙지하고 있으며, 상황에 맞게 적절한 공식을
        사용하여 Integration 계산을 할 수 있습니다. 답변 정리도 잘하시고 풀이 과정도 examiner
        입장에서 이해하기 편하게 잘 정리하셔서, 앞으로도 이대로 하시면 좋을 것 같습니다!
        한 주간 고생 많으셨습니다.
        """,
    """
        이번주 Pre IB 화학 수업은 전체적인 오리엔테이션과 함께 Atom 단원부터
        본격적으로 살펴보았습니다. 화학에서 기본이 되는 내용이라 어렵지는 않지만 복습이
        필수적인 단원입니다! 그 이후 Bonding과 Macromolecules 단원까지 진도를 나갔습니다.
        화학을 배운 학생이라면 쉽게 받아들이겠지만 화학을 처음 시작하는 친구들에게는 조금
        생소한 내용일 수 있습니다. 숙제에 나온 문제들을 전부 이해하고 넘어가야 다음주 이후의
        수업도 따라 오는데에 무리가 없을 것입니다. 세주 이번주에 제출하지 않은 과제가 있습니다!
        시간이 되면 숙제들을 제출하여 피드백을 받으면 진단평가 풀 때에도 수월할 것 같습니다.
        """,
    """
        다은이 항상 방긋방긋 웃으며, 함께 즐겁게 수업하고 있습니다. 공부 진짜
        열심히 합니다. 이번주에 배운 TARIFF 와 QUOTA 는 PAPER 2 에서 빈번히 나오는
        TOPICS 입니다. 개념도 개념이지만, 이 개념을 문제에 응용하는 연습을 지속적으로 해보면
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        파이널 시험대비에 도움일 될 것 같습니다.
        """,
]
notice_text = """
제 2회 세한아카데미 IB 학력평가 참석 감사드립니다. 아래 공지사항 참고 바랍니다.
1. 본 학력평가는 학년 별 상위 9명에게 장학금을 수여합니다.
2. 학력평가 학년별 상위 12명은 2025년 IB여름방학 Top Class 우선선발 대상자입니다.
3. 과목별 해설 강의(공개강의)가 3월 15일과 16일에 진행하니 시간표 참고하여 꼭 참석 바랍니다.
http://pf.kakao.com/_lqlBxd/108547617
4. 3월 12일부터 IB팀장님과 학습상담을 무료로 진행합니다. 상담을 희망하시면 카카오톡 채널로 연락 바랍니다.(상담 시간은 평일 13:00~17:00시(한국시간)입니다.
5. 6월 23일부터 진행하는 IB여름특강 3월 31일 까지 조기등록 진행하오니 많은 관심과 등록 부탁드립니다. https://blog.naver.com/sehanibmt/223759582563

* 장학금 및 TC 반대상자는3월25일 카카오톡으로 공지 예정입니다. 선발 대상자는 아래와 같은 방식으로 표기 합니다.
ex)김OO 아시아지역 국제학교 

※학력평가 채점 자료와 피드백 내용은 3월 19일 모두 삭제 되므로 파일이 필요한 경우 개인이 다운로드 받아주시기 바랍니다.. """

test_report_generator = GenerateStudentReport()

# Generate the PDF
pdf_path = test_report_generator.generate_pdf(
    student_id,
    student_name,
    student_grade,
    student_school,
    student_subjects,
    abbr_subjects,
    student_grades,
    average_grades,
    formatted_student_grades,
    formatted_average_grades,
    student_percentiles,
    average_percentiles,
    student_comments,
    notice_text
)
print(f"PDF generated at: {pdf_path}")
