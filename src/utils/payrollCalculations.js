export function round2(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

export function toAmount(value) {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
}

export function yearlyAmount(value) {
  return round2(toAmount(value) * 12);
}

export function calculatePayroll(salary = {}) {
  const basic = round2(toAmount(salary.basic));
  const da = round2(toAmount(salary.da));
  const hra = round2(toAmount(salary.hra));
  const conveyance = round2(toAmount(salary.conveyance));
  const medical = round2(toAmount(salary.medical));
  const special_allowance = round2(toAmount(salary.special_allowance));

  const employee_pf = round2(toAmount(salary.employee_pf));
  const professional_tax = round2(toAmount(salary.professional_tax));
  const employee_esi = round2(toAmount(salary.employee_esi));
  const tds = round2(toAmount(salary.tds));
  const medical_insurance = round2(toAmount(salary.medical_insurance));

  const employer_pf = round2(toAmount(salary.employer_pf));
  const employer_esi = round2(toAmount(salary.employer_esi));
  const gratuity = round2(toAmount(salary.gratuity));

  const gross = round2(
    basic + da + hra + conveyance + medical + special_allowance
  );
  const totalDeductions = round2(
    employee_pf + professional_tax + employee_esi + tds + medical_insurance
  );
  const netSalary = round2(gross - totalDeductions);
  const additionalBenefits = round2(employer_pf + employer_esi + gratuity);
  const ctc = round2(gross + additionalBenefits);

  return {
    basic,
    da,
    hra,
    conveyance,
    medical,
    special_allowance,
    employee_pf,
    professional_tax,
    employee_esi,
    tds,
    medical_insurance,
    employer_pf,
    employer_esi,
    gratuity,
    gross,
    totalDeductions,
    netSalary,
    additionalBenefits,
    ctc,
  };
}

export function buildCalculatedSalaryPayload(salary = {}) {
  const payroll = calculatePayroll(salary);

  return {
    ...salary,
    basic: payroll.basic,
    da: payroll.da,
    hra: payroll.hra,
    conveyance: payroll.conveyance,
    medical: payroll.medical,
    special_allowance: payroll.special_allowance,
    employee_pf: payroll.employee_pf,
    professional_tax: payroll.professional_tax,
    employee_esi: payroll.employee_esi,
    tds: payroll.tds,
    medical_insurance: payroll.medical_insurance,
    employer_pf: payroll.employer_pf,
    employer_esi: payroll.employer_esi,
    gratuity: payroll.gratuity,
    gross_salary: payroll.gross,
    total_deductions: payroll.totalDeductions,
    net_salary: payroll.netSalary,
    additional_benefits: payroll.additionalBenefits,
    ctc: payroll.ctc,
  };
}
