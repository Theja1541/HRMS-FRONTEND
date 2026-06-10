import os

filepath = r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\pages\CompanyUsers.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add role: 'HR' to form state
content = content.replace(
    '  const [form, setForm] = useState({\n    first_name: "",\n    last_name: "",',
    '  const [form, setForm] = useState({\n    role: "HR",\n    first_name: "",\n    last_name: "",'
)

# 2. Update formData role append
content = content.replace(
    'formData.append("role", "HR");',
    'formData.append("role", form.role);'
)

# 3. Update alert message
content = content.replace(
    'alert("HR user onboarded successfully. A temporary password has been emailed.");',
    'alert(`${ROLE_LABELS[form.role] || form.role} onboarded successfully. A temporary password has been emailed.`);'
)

# 4. Add Role select to wizardStep === 0
content = content.replace(
    '{wizardStep === 0 && (\n                  <div className="cu-form-grid">\n                    <div className="cu-form-field">\n                      <label>Employee ID *</label>',
    '{wizardStep === 0 && (\n                  <div className="cu-form-grid">\n                    <div className="cu-form-field">\n                      <label>User Role *</label>\n                      <select name="role" value={form.role} onChange={handleChange} required>\n                        <option value="HR">Company HR</option>\n                        <option value="ADMIN">Company Admin</option>\n                      </select>\n                    </div>\n                    <div className="cu-form-field">\n                      <label>Employee ID *</label>'
)

# 5. Remove subpages-list
subpage_block = '''                          <div className="subpages-list">
                            {mod.pages.map(p => (
                              <div key={p.key} className="subpage-item" onClick={() => togglePage(mod.key, p.key)}>
                                <div className={`custom-checkbox ${modObj[p.key] === true ? "checked" : ""}`} />
                                <span>{p.label}</span>
                              </div>
                            ))}
                          </div>'''
content = content.replace(subpage_block, '')

# 6. Change title
content = content.replace(
    '<h3 className="cu-card-title">✨ Onboard New HR User</h3>',
    '<h3 className="cu-card-title">✨ Onboard New Company User</h3>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
