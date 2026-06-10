import os

filepath = r'C:\Users\Teja Darling\OneDrive\Desktop\HRMS\hrms-frontend\src\pages\CompanyUsers.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

subpage_block = '''                          <div className="module-desc">{mod.description}</div>
                          <div className="subpages-list">
                            {mod.pages.map(p => (
                              <div key={p.key} className="subpage-item" onClick={() => togglePage(mod.key, p.key)}>
                                <div className={`custom-checkbox ${modObj[p.key] === true ? "checked" : ""}`} />
                                <span>{p.label}</span>
                              </div>
                            ))}
                          </div>'''

content = content.replace(
    '                          <div className="module-desc">{mod.description}</div>',
    subpage_block
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
