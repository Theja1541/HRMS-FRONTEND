import os
import re

files_to_update = {
    r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\pages\employee-portal\MyLeaves.jsx': [
        ('<h2>My Leaves</h2>', '<h2 style={{ color: "white" }}>My Leaves</h2>'),
        ('<p>Track your leave requests</p>', '<p style={{ color: "white" }}>Track your leave requests</p>')
    ],
    r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\pages\employee-portal\MyLeaveBalance.jsx': [
        ('<h2>My Leave Balance</h2>', '<h2 style={{ color: "white" }}>My Leave Balance</h2>'),
        ('<p>Track your yearly leave usage</p>', '<p style={{ color: "white" }}>Track your yearly leave usage</p>')
    ],
    r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\pages\employee-portal\MyPayslips.jsx': [
        ('<h2>My Payslips Portal</h2>', '<h2 style={{ color: "white" }}>My Payslips Portal</h2>'),
        ('<p>View and download your monthly salary slips</p>', '<p style={{ color: "white" }}>View and download your monthly salary slips</p>')
    ],
    r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\pages\employee-portal\SalaryGrowthTimeline.jsx': [
        ('<h2>Compensation Career Pathway</h2>', '<h2 style={{ color: "white" }}>Compensation Career Pathway</h2>'),
        ('<p>Track your salary increments and promotions</p>', '<p style={{ color: "white" }}>Track your salary increments and promotions</p>')
    ],
    r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\modules\separation\pages\ResignationForm.jsx': [
        ('<h2>Submit Resignation</h2>', '<h2 style={{ color: "white" }}>Submit Resignation</h2>'),
        ('<p>Initiate your separation process</p>', '<p style={{ color: "white" }}>Initiate your separation process</p>')
    ]
}

for filepath, replacements in files_to_update.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {os.path.basename(filepath)}")
    else:
        print(f"File not found: {filepath}")

