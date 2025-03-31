from flask_restx import Namespace, Resource
from db import DBHelper
from flask import send_file, Response
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate,
    BaseDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    Frame,
    PageTemplate,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.platypus import Flowable
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.widgets.markers import makeMarker
from reportlab.lib import colors
from reportlab.lib.colors import black, red
import os
from zipfile import ZipFile
from io import BytesIO
from time import sleep

# import alimtalk send
from utils.utils import send_mock_exam_report

reports_ns = Namespace("reports", description="Student report operations")

db_helper = DBHelper()
REPORTS_DIR = "reports"  # Directory to store generated reports

# Ensure the directory exists
os.makedirs(REPORTS_DIR, exist_ok=True)


class ChartWithLineAndBars(Flowable):
    def __init__(
        self,
        width,
        height,
        student_scores,
        average_scores,
        student_percentiles,
        average_percentiles,
        categories,
    ):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.student_scores = student_scores
        self.average_scores = average_scores
        self.categories = categories
        self.student_percentiles = student_percentiles
        self.average_percentiles = average_percentiles

    def draw(self):
        # Create a drawing object to hold both charts
        drawing = Drawing(self.width, self.height)

        # **Line Chart (Top)**
        line_chart = LinePlot()
        line_chart.x = 50
        line_chart.y = self.height - 120  # Position it at the top
        line_chart.width = 500
        line_chart.height = 100
        line_chart.data = [
            list(enumerate(self.student_percentiles)),
            list(enumerate(self.average_percentiles)),
        ]
        line_chart.lines[0].symbol = makeMarker("Circle")
        line_chart.lines[1].symbol = makeMarker("FilledCircle")
        line_chart.lines[0].strokeColor = colors.HexColor(
            "#000000"
        )  # Student scores line color
        line_chart.lines[1].strokeColor = colors.HexColor(
            "#A9D18E"
        )  # Average scores line color
        line_chart.lines[0].strokeWidth = 2
        line_chart.lines[1].strokeWidth = 2
        line_chart.yValueAxis.valueMin = 0
        line_chart.yValueAxis.valueMax = 100
        line_chart.yValueAxis.valueStep = 20
        line_chart.xValueAxis.visible = 0
        drawing.add(line_chart)

        # **Bar Chart (Bottom)**
        bar_chart = VerticalBarChart()
        bar_chart.x = 50
        bar_chart.y = 50  # Position below the line chart
        bar_chart.height = 100
        bar_chart.width = 500
        bar_chart.data = [self.student_scores, self.average_scores]
        bar_chart.categoryAxis.categoryNames = self.categories
        bar_chart.barSpacing = 0
        bar_chart.groupSpacing = 30
        bar_chart.bars[0].fillColor = colors.HexColor("#000000")  # Student score bars
        bar_chart.bars[1].fillColor = colors.HexColor("#A9D18E")  # Average score bars
        bar_chart.valueAxis.valueMin = 0
        bar_chart.valueAxis.valueMax = 7
        bar_chart.valueAxis.valueStep = 1
        bar_chart.categoryAxis.labels.fontName = "Pretendard-Bold"
        drawing.add(bar_chart)

        # Draw the chart on the canvas
        drawing.drawOn(self.canv, 0, 0)


class TwoSquaresWithText(Flowable):
    def __init__(self, width, height, gap, text1, text2, page_width, page_height):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.gap = gap
        self.text1 = text1
        self.text2 = text2
        self.page_width = page_width
        self.page_height = page_height

    def draw(self):
        total_width = self.width * 2 + self.gap  # Total width of the two squares
        x_position = (self.page_width - total_width) / 2  # Center horizontally
        y_position = (self.page_height - self.height) / 2  # Center vertically

        d = Drawing(self.width * 2 + self.gap, self.height)
        d.add(
            Rect(
                0,
                0,
                self.width,
                self.height,
                fillColor="#000000",
                strokeColor="#000000",
            )
        )
        d.add(
            Rect(
                self.width + self.gap,
                0,
                self.width,
                self.height,
                fillColor="#A9D18E",
                strokeColor="#A9D18E",
            )
        )
        d.add(
            String(
                self.width / 2,
                self.height / 2 - 2,
                self.text1,
                fontName="Pretendard-Bold",
                fillColor="#FFFFFF",
                textAnchor="middle",
            )
        )
        d.add(
            String(
                self.width + self.gap + self.width / 2,
                self.height / 2 - 2,
                self.text2,
                fontName="Pretendard-Bold",
                textAnchor="middle",
            )
        )
        d.drawOn(self.canv, (self.page_width / 2 - 70), 0)


class SquareWithText(Flowable):
    def __init__(self, width, height, text, page_width, sqaureColor, textColor):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.text = text
        self.page_width = page_width
        self.sqaureColor = sqaureColor
        self.textColor = textColor

    def draw(self):
        # Create a drawing object
        d = Drawing(self.width * 2, self.height)
        # Add the rectangle (square)
        d.add(
            Rect(
                0,
                0,
                self.width,
                self.height,
                fillColor=self.sqaureColor,
                strokeColor=self.sqaureColor,
            )
        )
        # Add the text inside the rectangle (centered)
        d.add(
            String(
                self.width / 2,
                self.height / 2 - 2,
                self.text,
                fontName="Pretendard-Bold",
                fillColor=self.textColor,
                textAnchor="middle",
            )
        )
        # Draw the objects on the canvas at the calculated position
        d.drawOn(self.canv, 40, 0)


def filter_numeric(values):
    return [float(v) for v in values if isinstance(v, (int, float))]


@reports_ns.route("/")
class GenerateStudentReport(Resource):
    def get(self):
        """Download all student reports"""
        # Get the list of all reports
        reports = os.listdir(REPORTS_DIR)

        # Create a zip file containing all reports
        zip_path = os.path.join(REPORTS_DIR, "reports.zip")

        if os.path.exists(zip_path):
            os.remove(zip_path)

        with ZipFile(zip_path, "w") as zipf:
            for report in reports:
                zipf.write(os.path.join(REPORTS_DIR, report), report)

        return {
            "message": "Report zip file created successfully",
            "zip_path": zip_path,
        }, 200

    def post(self):
        """Generate PDF reports."""
        students_list = db_helper.fetch_all("SELECT id FROM students")

        # calculate average grades
        sql = """
            SELECT 
                g.grade_name,
                sub.subject_name,
                AVG(es.score) AS average_score,
                AVG(es.total_score) AS average_percentile
            FROM exam_submissions es
            JOIN exams e ON es.exam_id = e.id
            JOIN subjects sub ON e.subject_id = sub.id
            JOIN students s ON es.student_id = s.id
            JOIN grades g ON s.grade_id = g.id
            GROUP BY g.id, sub.id
            ORDER BY g.grade_name, sub.subject_name;
        """

        subject_average_results = db_helper.fetch_all(sql)
        # print(subject_average_results)

        for student in students_list:
            # db_helper.execute("SET SESSIONS group_concat_max_len = 1000000;")

            sql = """
                SELECT 
                    s.id, 
                    s.name, 
                    s.phone_number,
                    s.school, 
                    g.grade_name AS grade,
                    GROUP_CONCAT(DISTINCT sub.subject_name ORDER BY sub.subject_name) AS subjects,
                    GROUP_CONCAT(DISTINCT sub.abbr_name ORDER BY sub.abbr_name) AS abbr_subjects,
                    GROUP_CONCAT(COALESCE(es.score, 0) ORDER BY sub.subject_name) AS student_grades,
                    GROUP_CONCAT(COALESCE(es.total_score, 0) ORDER BY sub.subject_name) AS student_percentiles,
                    GROUP_CONCAT(COALESCE(es.comment, '') ORDER BY sub.subject_name SEPARATOR ' @@ ') AS student_comments
                FROM students s
                JOIN grades g ON s.grade_id = g.id
                JOIN student_subjects ss ON ss.student_id = s.id
                JOIN subjects sub ON sub.id = ss.subject_id
                LEFT JOIN (
                    SELECT 
                        e.subject_id, 
                        es.student_id, 
                        MAX(es.score) AS score, 
                        MAX(es.total_score) AS total_score, 
                        MAX(es.comment) AS comment
                    FROM exams e
                    LEFT JOIN exam_submissions es ON es.exam_id = e.id
                    GROUP BY es.student_id, e.subject_id
                ) es ON es.student_id = s.id AND es.subject_id = sub.id
                WHERE s.id = %s
                GROUP BY s.id;
            """

            result = db_helper.fetch_one(sql, (student["id"],))
            student_id = result["id"]
            student_name = result["name"]
            phone_number = result["phone_number"]
            student_school = result["school"]
            student_grade = result["grade"]
            student_subjects = result["subjects"].split(",")
            abbr_subjects = result["abbr_subjects"].split(",")
            student_grades = (
                [int(grade) for grade in result["student_grades"].split(",")]
                if result["student_grades"]
                else []
            )
            student_percentiles = (
                [
                    int(percentile)
                    for percentile in result["student_percentiles"].split(",")
                ]
                if result["student_percentiles"]
                else []
            )

            # if student_id == 25:
            #     print(result["student_comments"])


            # Fetch comments separately because group concat max len can't be changed in aws rds
            sql = """
            select coalesce(es.comment, '') as comment, sub.subject_name
            from exam_submissions es
            join exams e on es.exam_id = e.id
            join subjects sub on e.subject_id = sub.id
            where student_id = %s
            order by sub.subject_name;
            """
            
            result = db_helper.fetch_all(sql, (student["id"],))
            
            comment_dict = {row["subject_name"]: row["comment"] for row in result}
            
            student_comments = [comment_dict.get(subject, "") for subject in student_subjects]
            
            # student_comments = []
            
            # for row in result:
            #     subject_name = row["subject_name"]
            #     comment = row["comment"]
                
            #     if subject_name in 
            #     student_comments.append(row["comment"])

            # student_comments = (
            #     result["student_comments"].split(" @@ ")
            #     if result["student_comments"]
            #     else []
            # )

            # Dictionary to store subject averages grouped by grade
            subject_avg_dict = {}

            for entry in subject_average_results:
                grade = entry["grade_name"]
                subject = entry["subject_name"]

                if grade not in subject_avg_dict:
                    subject_avg_dict[grade] = {}

                subject_avg_dict[grade][subject] = {
                    "average_score": round(float(entry["average_score"]), 2) if entry["average_score"] is not None else 0.00,
                    "average_percentile": round(float(entry["average_percentile"]), 2) if entry["average_percentile"] is not None else 0.00,
                }


            # Initialize empty lists for student's average scores and percentiles
            average_grades = []
            average_percentiles = []

            # Fetch the average scores for the student's grade
            student_grade_averages = subject_avg_dict.get(student_grade, {})

            # Iterate over the subjects and fetch corresponding values
            for subject in student_subjects:
                avg_entry = student_grade_averages.get(subject, {"average_score": 0.00, "average_percentile": 0.00})
                
                average_grades.append(avg_entry["average_score"])
                average_percentiles.append(avg_entry["average_percentile"])


            sql = """
                SELECT notice_text from settings
            """
            
            result = db_helper.fetch_one(sql)
            #print("before notice text", result)
            notice_text = result['notice_text']
            
            #print("I got notice text",notice_text)

            # # Initialize empty lists for scores and percentiles
            # average_grades = []
            # average_percentiles = []

            # # Create a dictionary for quick lookup by subject_name
            # data_dict = {
            #     entry["subject_name"]: entry for entry in subject_average_results
            # }

            # Iterate over the subjects and fetch the corresponding values
            # for subject in student_subjects:
            #     entry = data_dict.get(subject)
            #     if (
            #         entry
            #         and entry["average_score"] != None
            #         and entry["average_percentile"] != None
            #     ):
            #         average_grades.append(round(float(entry["average_score"]), 2))
            #         average_percentiles.append(
            #             round(float(entry["average_percentile"]), 2)
            #         )
            #     else:
            #         # If no entry found for subject, append None or any default value
            #         # ALSO IF GRADE NOT GIVEN AND IS NULL
            #         average_grades.append(0.00)
            #         average_percentiles.append(0.00)

            formatted_student_grades = [f"{grade}/7" for grade in student_grades]
            formatted_average_grades = [f"{grade}/7" for grade in average_grades]

            student_report_file_name = self.generate_pdf(
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

        # After generating all reports, make zip file
        # Create a zip file containing all reports
        zip_path = os.path.join(REPORTS_DIR, "reports.zip")

        if os.path.exists(zip_path):
            os.remove(zip_path)
            sleep(0.5)
            if os.path.exists(zip_path):  # Verify if it's gone
                print("Error: reports.zip was not removed!")
            else:
                print("reports.zip successfully removed!")

        # Get the list of all reports
        # NEED TO GET IT AFTER DELETING ZIP FILE
        # OTHERWISE ZIP FILE WILL BE INCLUDED IN REPORTS LIST
        reports = os.listdir(REPORTS_DIR)

        with ZipFile(zip_path, "w") as zipf:
            for report in reports:
                print("inside zipfile")
                zipf.write(os.path.join(REPORTS_DIR, report), report)
        # scores = db_helper.fetch_all(
        #     "SELECT subject, score FROM exam_scores WHERE student_id = %s",
        #     (student_id,),
        # )

        # if not scores:
        #     reports_ns.abort(404, "No scores found for this student")

        # # Generate the PDF report
        # report_path = os.path.join(REPORTS_DIR, f"report_{student_id}.pdf")
        # self.generate_pdf(student["name"], scores, report_path)

        # # Store path in the database
        # db_helper.execute(
        #     "UPDATE students SET report_path = %s WHERE id = %s",
        #     (report_path, student_id),
        # )

        print("generated reports")

        return {"message": "Report generated"}, 201

    def generate_pdf(
        self,
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
    ):
        """Generate and save a PDF report for a student."""
        pdf_filename = os.path.join(
            REPORTS_DIR, f"{student_name}_{student_id}_report.pdf"
        )

        # Set Korean font
        pdfmetrics.registerFont(
            TTFont("Pretendard-Regular", "../src/assets/fonts/Pretendard-Regular.ttf")
        )
        pdfmetrics.registerFont(
            TTFont("Pretendard-Bold", "../src/assets/fonts/Pretendard-Bold.ttf")
        )

        doc = BaseDocTemplate(
            pdf_filename,
            pagesize=A4,
            topMargin=0,
            bottomMargin=0,
            leftMargin=0,
            rightMargin=0,
            showBoundary=1,
        )
        doc_width, doc_height = A4  # Letter size: 8.5 x 11 inches
        # print("doc_width, doc_height", doc_width, doc_height)
        frame = Frame(0, 0, doc_width, doc_height, id="full_page")

        # Attach the PageTemplate
        doc.addPageTemplates([PageTemplate(id="main", frames=[frame])])
        elements = []

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Title"],
            fontName="Pretendard-Bold",
            fontSize=20,
            alignment=1,  # Center alignment
            leading=24,  # Adjust the line height for more space between lines
            textColor="#FFFFFF",
        )

        text_style = ParagraphStyle(
            "TextStyle",
            parent=styles["Normal"],
            fontName="Helvetica",  # Adjust this to your preferred font
            fontSize=10,
            leading=14,  # Adjust line spacing
            leftIndent=50,
        )

        date_style = ParagraphStyle(
            "DateStyle",
            fontName="Pretendard-Bold",
            fontSize=14,
            alignment=2,  # Right alignment
            textColor="#FFFFFF",
        )

        # Component 1: logo
        sehan_logo_path = "../src/assets/images/logo.png"
        sehan_logo = Image(sehan_logo_path, width=2.2 * 50, height=0.5 * 50)

        # Component 2: date
        date_text = Paragraph("2025.05", date_style)

        # Component 3: title
        title_text = "SEHAN ACADEMY IB<br/>제 2회 전 세계 모의고사"
        title_paragraph = Paragraph(title_text, title_style)

        # Create the title table with the Paragraph as content
        title_data = [
            [sehan_logo, title_paragraph, date_text]
        ]  # Place the Paragraph inside the table cell

        # Define table with necessary styles
        title_table = Table(
            title_data, colWidths=[60, doc_width - 120, 70], rowHeights=[70]
        )
        title_table.setStyle(
            TableStyle(
                [
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, -1),
                        "#FFFFFF",
                    ),  # Set text color to white
                    ("BACKGROUND", (0, 0), (-1, -1), "#2F5597"),  # Background color
                    ("FONTNAME", (0, 0), (-1, -1), "Pretendard-Bold"),  # Set font
                    ("FONTSIZE", (0, 0), (-1, -1), 16),  # Font size
                ]
            )
        )

        # Add table to elements
        elements.append(title_table)

        # Student Info Table within a bordered box
        student_info_data = [
            ["Name", student_name, "School", student_school, "Grade", student_grade],
            ["Subject", ", ".join(student_subjects)],
        ]

        col_ratio = [0.3, 0.4, 0.3, 1.8, 0.3, 0.4]
        col_widths = [doc_width * ratio / sum(col_ratio) for ratio in col_ratio]
        student_info_table = Table(
            student_info_data, colWidths=col_widths, rowHeights=[30, 30]
        )
        student_info_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), "#DEEBF7"),
                    ("BACKGROUND", (2, 0), (2, 0), "#DEEBF7"),
                    ("BACKGROUND", (4, 0), (4, 0), "#DEEBF7"),
                    ("TEXTCOLOR", (0, 0), (-1, 0), "000000"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("FONTNAME", (0, 0), (-1, -1), "Pretendard-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 11),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, "000000"),
                    ("BOX", (0, 0), (-1, -1), 0.5, "000000"),
                    ("SPAN", (1, 1), (5, 1)),
                ]
            )
        )
        # student_info_table.hAlign = 'RIGHT'
        elements.append(student_info_table)
        elements.append(Spacer(1, 20))  # Space after title

        # Student Grades Table
        # Minimum of 4 subjects, maximum of 6
        min_subjects = 4
        max_subjects = 6

        # Fill up subjects if fewer than min_subjects
        num_subjects = len(student_subjects)
        if num_subjects < min_subjects:
            student_subjects += ["-"] * (min_subjects - num_subjects)
        elif num_subjects > max_subjects:
            student_subjects = student_subjects[:max_subjects]

        # Abbreviate subject names if more than 4 subjects
        if num_subjects > 4:
            column_student_subjects = abbr_subjects
        else:
            column_student_subjects = student_subjects

        # Adjust grades and percentiles accordingly
        num_subjects = len(student_subjects)  # Update after adjustments
        formatted_student_grades = formatted_student_grades[:num_subjects] + ["-"] * (
            num_subjects - len(formatted_student_grades)
        )
        student_percentiles = student_percentiles[:num_subjects] + ["-"] * (
            num_subjects - len(student_percentiles)
        )

        # Ensure averages match the final number of subjects
        formatted_average_grades = formatted_average_grades[:num_subjects] + ["-"] * (
            num_subjects - len(formatted_average_grades)
        )
        average_percentiles = average_percentiles[:num_subjects] + ["-"] * (
            num_subjects - len(average_percentiles)
        )

        student_grade_data = [
            ["Score", "학생성적"] + [""] * (num_subjects - 1) + ["전체평균"],
            [""] + column_student_subjects + column_student_subjects,
            ["원 점수"] + formatted_student_grades + formatted_average_grades,
            ["백분율"] + student_percentiles + average_percentiles,
        ]

        # Dynamic column ratio (ensuring 2 sets of subjects + score column)
        total_columns = 2 * num_subjects + 1
        col_ratio = [1] * total_columns
        col_widths = [doc_width * ratio / sum(col_ratio) for ratio in col_ratio]

        student_grades_table = Table(
            student_grade_data, colWidths=col_widths, rowHeights=[30, 30, 30, 30]
        )
        student_grades_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (0, -1), "#2F5597"),
                    ("BACKGROUND", (1, 0), (num_subjects, -1), "#FFF2CC"),
                    ("BACKGROUND", (num_subjects + 1, 0), (-1, -1), "#E2F0D9"),
                    ("TEXTCOLOR", (0, 0), (0, -1), "#FFFFFF"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("FONTNAME", (0, 0), (-1, -1), "Pretendard-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 11),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, "000000"),
                    ("BOX", (0, 0), (-1, -1), 0.5, "000000"),
                    ("SPAN", (1, 0), (num_subjects, 0)),
                    ("SPAN", (num_subjects + 1, 0), (num_subjects * 2, 0)),
                    ("SPAN", (0, 0), (0, 1)),
                ]
            )
        )
        # student_info_table.hAlign = 'RIGHT'
        elements.append(student_grades_table)
        elements.append(Spacer(1, 20))

        elements.append(
            TwoSquaresWithText(
                50, 20, 10, "학생성적", "전체평균", doc_width, doc_height
            )
        )
        elements.append(Spacer(1, 20))

        # subjects = ["Math", "Physics", "Biology", "Chemistry"]
        # student_grades = [6, 7, 5, 4]  # Student scores
        # average_grades = [6.43, 6.5, 6.1, 5.8]  # Average scores

        # print("grades")
        # print(student_grades)
        # print(average_grades)

        # Filter only numeric values
        filtered_student_grades = filter_numeric(student_grades)
        filtered_average_grades = filter_numeric(average_grades)
        filtered_student_percentiles = filter_numeric(student_percentiles)
        filtered_average_percentiles = filter_numeric(average_percentiles)

        elements.append(
            ChartWithLineAndBars(
                800,
                300,
                filtered_student_grades,
                filtered_average_grades,
                filtered_student_percentiles,
                filtered_average_percentiles,
                student_subjects,
            )
        )

        # Grade bounary
        elements.append(
            SquareWithText(100, 20, "Grade Boundary", doc_width, "#2F5597", "#FFFFFF")
        )
        elements.append(Spacer(1, 12))

        grade_boundaries = ""

        for subject in student_subjects:
            if subject != "-":
                grade_boundaries += f"<b>{subject}</b> : <b>7</b>(100~80) / <b>6</b>(79~70) / <b>5</b>(69~50) / <b>4</b>(49~40) / <b>3</b>(39~30) / <b>2</b>(29~20) / <b>1</b>(19~0)<br/>"

        grade_boundary_paragraph = Paragraph(grade_boundaries, text_style)
        elements.append(grade_boundary_paragraph)
        elements.append(Spacer(1, 40))

        test_style2 = ParagraphStyle(
            "TextStyle2",
            parent=styles["Normal"],
            fontName="Pretendard-Regular",  # Adjust this to your preferred font
            fontSize=10,
            leading=14,  # Adjust line spacing
            alignment=1,
        )

        footer = """
            과목 별 코멘트는 다음페이지에 있습니다.
        """

        elements.append(Paragraph(footer, test_style2))
        elements.append(PageBreak())

        # comments
        elements.append(Spacer(1, 30))
        elements.append(
            SquareWithText(100, 20, "Comments", doc_width, "#A9D18E", "#000000")
        )
        elements.append(Spacer(1, 10))

        comment_style = ParagraphStyle(
            "CommentStyle",
            parent=styles["Normal"],
            fontName="Pretendard-Regular",
            fontSize=12,
            leading=16,
            borderColor="#A9D18E",
            borderWidth=2,
            leftIndent=50,
            rightIndent=50,
            borderPadding=(10, 10, 10, 10),
            width=100,
        )

        comment_text = ""

        for subject, comment in zip(student_subjects, student_comments):
            comment_text += f"<b>{subject}</b> : {comment.replace('\n', '<br/>')}<br /><br />"
        elements.append(Paragraph(comment_text, comment_style))
        elements.append(Spacer(1, 40))

        # 공지사항
        notice_style = ParagraphStyle(
            "NoticeStyle",
            parent=styles["Normal"],
            fontName="Pretendard-Regular",
            fontSize=12,
            leading=20,
            leftIndent=40,
        )
        # notice_text = """
        # 제 2회 세한아카데미 IB 학력평가 참석 감사드립니다. 아래 공지사항 참고 바랍니다.<br />
        # 1. 본 학력평가는 학년 별 상위 9명에게 장학금을 수여합니다.<br />
        # 2. 학력평가 학년별 상위 12명은 2025년 IB여름방학 Top Class 우선선발 대상자입니다.<br />
        # 3. 과목별 해설 강의(공개강의)가 3월 15일과 16일에 진행하니 시간표 참고하여 꼭 참석 바랍니다.<br />
        # http://pf.kakao.com/_lqlBxd/108547617<br />
        # 4. 3월 12일부터 IB팀장님과 학습상담을 무료로 진행합니다. 상담을 희망하시면 카카오톡 채널로 연락 바랍니다.(상담 시간은 평일 13:00~17:00시(한국시간)입니다.<br />
        # 5. 6월 23일부터 진행하는 IB여름특강 3월 31일 까지 조기등록 진행하오니 많은 관심과 등록 부탁드립니다.<br />
        # https://blog.naver.com/sehanibmt/223759582563<br />
        # <br />
        # * 장학금 및 TC 반대상자는3월25일 카카오톡으로 공지 예정입니다. 선발 대상자는 아래와 같은 방식으로 표기 합니다.<br />
        # ex)김OO 아시아지역 국제학교 <br />
        # ※학력평가 채점 자료와 피드백 내용은 3월 19일 모두 삭제 되므로 파일이 필요한 경우 개인이 다운로드 받아주시기 바랍니다.
        # """
        
        notice_text = notice_text.replace('\n', '<br />')
        # if student_id == 25:
        #     print("notice text", notice_text.replace('\n', '<br />'))
        elements.append(Paragraph(notice_text, notice_style))

        # Create a frame that starts exactly at the top of the document
        frame = Frame(
            doc.leftMargin,
            doc.bottomMargin,
            doc_width - doc.leftMargin - doc.rightMargin,
            doc_height,
            id="top_frame",
        )
        # Build the PDF document
        doc.build(
            elements,
        )

        # Store the PDF path in the database
        db_helper.execute(
            "UPDATE students SET report_path = %s WHERE id = %s",
            (pdf_filename, student_id),
        )

        return pdf_filename


@reports_ns.route("/send")
class SendMockExamReport(Resource):
    def post(self):
        """Send mock exam report to students"""
        students_list = db_helper.fetch_all(
            "SELECT name, phone_number, report_path FROM students"
        )

        for student in students_list:
            name = student["name"]
            phone_number = student["phone_number"]
            report_path = student["report_path"]
            report_link = f"https://www.sehanibexam.com/api/files/{report_path}"

            # send alimtalk
            send_mock_exam_report(name, phone_number, report_link)


@reports_ns.route("/<int:student_id>")
class StudentReport(Resource):
    def get(self, student_id):
        """Return the pre-generated PDF report for a student."""
        student = db_helper.fetch_one(
            "SELECT report_path FROM students WHERE id = %s", (student_id,)
        )

        if (
            not student
            or not student["report_path"]
            or not os.path.exists(student["report_path"])
        ):
            reports_ns.abort(404, "Report not found")

        return send_file(student["report_path"], mimetype="application/pdf")
