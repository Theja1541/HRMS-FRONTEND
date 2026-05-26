import * as yup from "yup";

export const transactionSchema = yup.object().shape({
  date: yup.string().required("Date is required"),
  details: yup.string().required("Details are required"),
  category: yup.number().required("Category is required"),
  payment_mode: yup.string().required("Payment mode is required"),
  
  debit_amount: yup.number().transform((value) => (isNaN(value) ? 0 : value)).min(0),
  credit_amount: yup.number().transform((value) => (isNaN(value) ? 0 : value)).min(0),

  from_vendor: yup.number().nullable(),
  to_vendor: yup.number().nullable(),
  
  gst_applicable: yup.boolean(),
  gst_rate: yup.number().when('gst_applicable', {
    is: true,
    then: () => yup.number().required("GST Rate is required").min(0, "GST Rate cannot be negative"),
    otherwise: () => yup.number().nullable(),
  }),
  gst_amount: yup.number().when('gst_applicable', {
    is: true,
    then: () => yup.number().required("GST Amount is required").min(0.01, "GST must be greater than 0"),
    otherwise: () => yup.number().nullable(),
  }),
  hsn_code: yup.string().nullable(),

  bank_name: yup.string().when('payment_mode', {
    is: 'BANK',
    then: () => yup.string().required("Bank Name is required"),
    otherwise: () => yup.string().nullable(),
  }),
  account_number: yup.string().when('payment_mode', {
    is: 'BANK',
    then: () => yup.string().required("Account Number is required"),
    otherwise: () => yup.string().nullable(),
  }),
  upi_id: yup.string().when('payment_mode', {
    is: 'UPI',
    then: () => yup.string().required("UPI ID is required"),
    otherwise: () => yup.string().nullable(),
  }),
  cheque_number: yup.string().when('payment_mode', {
    is: 'CHEQUE',
    then: () => yup.string().required("Cheque Number is required"),
    otherwise: () => yup.string().nullable(),
  }),
}).test(
  'debit-or-credit',
  'Either debit or credit amount must be provided, but not both',
  function (value) {
    const debit = parseFloat(value.debit_amount) || 0;
    const credit = parseFloat(value.credit_amount) || 0;
    
    if (debit === 0 && credit === 0) {
      return this.createError({
        path: 'debit_amount',
        message: 'Either debit or credit amount must be provided',
      });
    }
    
    if (debit > 0 && credit > 0) {
      return this.createError({
        path: 'credit_amount',
        message: 'Cannot have both debit and credit amounts',
      });
    }
    
    return true;
  }
);
