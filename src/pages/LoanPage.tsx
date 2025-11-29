// src/pages/LoanPage.tsx
import { useMemo, useState } from "react";
import "../../src/cssFile/LoanPage.css";

type ScheduleRow = {
  installmentNo: number;
  date: string;
  days: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

type LoanType = "medium_long" | "short" | "seasonal";

// شرائح الفائدة للقروض المتوسطة / طويلة الأجل
const INTEREST_BRACKETS_MED_LONG = [
  { min: 1, max: 10000, rate: 6.5 },
  { min: 10001, max: 15000, rate: 7 },
  { min: 15001, max: 20000, rate: 7.5 },
  { min: 20001, max: 30000, rate: 8 },
  { min: 30001, max: 50000, rate: 8.5 },
  { min: 50001, max: Number.MAX_SAFE_INTEGER, rate: 9 },
];

// شرائح الفائدة للقروض القصيرة الأجل / الموسمية
const INTEREST_BRACKETS_SHORT_SEASONAL = [
  { min: 1, max: 5000, rate: 6.5 },
  { min: 5001, max: 10000, rate: 7 },
  { min: 10001, max: 15000, rate: 7.5 },
  { min: 15001, max: 20000, rate: 8 },
  { min: 20001, max: 30000, rate: 8.5 },
  { min: 30001, max: Number.MAX_SAFE_INTEGER, rate: 9 },
];

function getRateForAmount(amount: number, loanType: LoanType): number | null {
  if (!amount) return null;

  const brackets =
    loanType === "medium_long"
      ? INTEREST_BRACKETS_MED_LONG
      : INTEREST_BRACKETS_SHORT_SEASONAL;

  const b = brackets.find((x) => amount >= x.min && amount <= x.max);
  return b ? b.rate : null;
}

export default function LoanPage() {
  const [amount, setAmount] = useState<string>("");
  const [years, setYears] = useState<string>("5");
  const [paymentsPerYear, setPaymentsPerYear] = useState<string>("12"); // شهري
  const [firstPaymentDate, setFirstPaymentDate] = useState<string>("");
  const [loanType, setLoanType] = useState<LoanType>("medium_long");
  const [calculated, setCalculated] = useState<boolean>(false);

  const numericAmount = Number(amount) || 0;
  const numericYears = Number(years) || 0;
  const numericPaymentsPerYear = Number(paymentsPerYear) || 0;

  const interestRate = useMemo(
    () => getRateForAmount(numericAmount, loanType),
    [numericAmount, loanType]
  );

  const schedule = useMemo<ScheduleRow[]>(() => {
    if (
      !numericAmount ||
      !interestRate ||
      !numericYears ||
      !firstPaymentDate
    ) {
      return [];
    }

    const rows: ScheduleRow[] = [];
    const annualRate = interestRate / 100;
    const firstDate = new Date(firstPaymentDate);

    if (loanType === "medium_long") {
      // أقساط متساوية (Amortized loan)
      if (!numericPaymentsPerYear) return [];
      const totalPeriods = numericYears * numericPaymentsPerYear;
      const periodRate = annualRate / numericPaymentsPerYear;

      const payment =
        periodRate === 0
          ? numericAmount / totalPeriods
          : (numericAmount * periodRate) /
            (1 - Math.pow(1 + periodRate, -totalPeriods));

      let balance = numericAmount;
      let prevDate = new Date(firstDate);

      for (let i = 1; i <= totalPeriods; i++) {
        const currentDate = new Date(firstDate);
        currentDate.setMonth(
          currentDate.getMonth() + (i - 1) * (12 / numericPaymentsPerYear)
        );

        const diffTime = currentDate.getTime() - prevDate.getTime();
        const days = Math.max(
          0,
          Math.round(diffTime / (1000 * 60 * 60 * 24))
        );
        prevDate = currentDate;

        const interest = balance * periodRate;
        const principal = payment - interest;
        balance = balance - principal;

        rows.push({
          installmentNo: i,
          date: currentDate.toLocaleDateString("ar-JO"),
          days,
          payment,
          principal,
          interest,
          balance: balance < 1 ? 0 : balance,
        });
      }
    } else if (loanType === "short") {
      // قرض قصير الأجل: فائدة بسيطة + دفعة وحدة في نهاية المدة
      const maturityDate = new Date(firstDate);
      maturityDate.setFullYear(maturityDate.getFullYear() + numericYears);

      const diffTime = maturityDate.getTime() - firstDate.getTime();
      const days = Math.max(
        0,
        Math.round(diffTime / (1000 * 60 * 60 * 24))
      );

      const interest = numericAmount * annualRate * numericYears;
      const payment = numericAmount + interest;

      rows.push({
        installmentNo: 1,
        date: maturityDate.toLocaleDateString("ar-JO"),
        days,
        payment,
        principal: numericAmount,
        interest,
        balance: 0,
      });
    } else if (loanType === "seasonal") {
      // قرض موسمي: دفعات فائدة فقط، والأخيرة أصل + فائدة
      if (!numericPaymentsPerYear) return [];
      const totalPeriods = numericYears * numericPaymentsPerYear;
      const periodRate = annualRate / numericPaymentsPerYear;

      let balance = numericAmount;
      let prevDate = new Date(firstDate);

      for (let i = 1; i <= totalPeriods; i++) {
        const currentDate = new Date(firstDate);
        currentDate.setMonth(
          currentDate.getMonth() + (i - 1) * (12 / numericPaymentsPerYear)
        );

        const diffTime = currentDate.getTime() - prevDate.getTime();
        const days = Math.max(
          0,
          Math.round(diffTime / (1000 * 60 * 60 * 24))
        );
        prevDate = currentDate;

        const interest = balance * periodRate;
        const isLast = i === totalPeriods;
        const principal = isLast ? balance : 0;
        const payment = interest + principal;
        balance = isLast ? 0 : balance;

        rows.push({
          installmentNo: i,
          date: currentDate.toLocaleDateString("ar-JO"),
          days,
          payment,
          principal,
          interest,
          balance,
        });
      }
    }

    return rows;
  }, [
    numericAmount,
    interestRate,
    numericYears,
    numericPaymentsPerYear,
    firstPaymentDate,
    loanType,
  ]);

  const totalPeriods = schedule.length;
  const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0);
  const totalPaid = schedule.reduce((sum, r) => sum + r.payment, 0);
  const firstInstallment = schedule[0]?.payment ?? 0;

  const handleCalculate = () => {
    setCalculated(true);
  };

  const handleReset = () => {
    setAmount("");
    setYears("5");
    setPaymentsPerYear("12");
    setFirstPaymentDate("");
    setLoanType("medium_long");
    setCalculated(false);
  };

  const hasEnoughData =
    numericAmount > 0 &&
    numericYears > 0 &&
    (!!numericPaymentsPerYear || loanType === "short") &&
    !!firstPaymentDate &&
    !!interestRate;

  return (
    <div className="page page--centered">
      <div className="card card--wide">
        <div className="card__header">
          <h1 className="page-title">حاسبة القرض</h1>
          <p className="page-subtitle">
            اختر نوع القرض وأدخل بياناته ليتم احتساب الأقساط وجدول الدفعات.
          </p>
        </div>

        {/* بيانات القرض */}
        <div className="loan-grid">
          <div className="form-field">
            <label className="form-label">قيمة القرض (دينار)</label>
            <input
              type="number"
              min={0}
              className="text-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثال: 20000"
            />
          </div>

          <div className="form-field">
            <label className="form-label">مدة القرض (بالسنوات)</label>
            <input
              type="number"
              min={1}
              className="text-input"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="مثال: 5"
            />
          </div>

          <div className="form-field">
            <label className="form-label">نوع القرض</label>
            <select
              className="text-input"
              value={loanType}
              onChange={(e) => setLoanType(e.target.value as LoanType)}
            >
              <option value="medium_long">قرض متوسط / طويل الأجل</option>
              <option value="short">قرض قصير الأجل</option>
              <option value="seasonal">قرض موسمي</option>
            </select>
            <small className="hint-text">
              يختلف شكل السداد حسب نوع القرض (أقساط، دفعة واحدة، موسمي).
            </small>
          </div>

          <div className="form-field">
            <label className="form-label">دورية الدفع</label>
            <select
              className="text-input"
              value={paymentsPerYear}
              onChange={(e) => setPaymentsPerYear(e.target.value)}
              disabled={loanType === "short"}
            >
              <option value="12">شهري</option>
              <option value="4">ربع سنوي</option>
              <option value="2">نصف سنوي</option>
              <option value="1">سنوي</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">تاريخ أول دفعة</label>
            <input
              type="date"
              className="text-input"
              value={firstPaymentDate}
              onChange={(e) => setFirstPaymentDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">سعر الفائدة السنوي (%)</label>
            <input
              className="text-input text-input--readonly"
              value={
                interestRate != null
                  ? interestRate.toFixed(2)
                  : amount
                  ? "خارج نطاق الشرائح"
                  : ""
              }
              readOnly
            />
            <small className="hint-text">
              يتم اختيار الفائدة تلقائياً حسب شريحة قيمة القرض ونوعه.
            </small>
          </div>

          <div className="form-field">
            <label className="form-label">عدد الدفعات الكلي</label>
            <input
              className="text-input text-input--readonly"
              value={totalPeriods || ""}
              readOnly
            />
          </div>
        </div>

        {/* أزرار الحساب */}
        <div className="loan-actions">
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            disabled={!hasEnoughData}
          >
            حساب
          </button>
          <button className="btn" onClick={handleReset}>
            مسح
          </button>
        </div>

        {/* ملخص القيم المحسوبة */}
        {calculated && schedule.length > 0 && (
          <div className="loan-summary">
            <div className="loan-summary__item">
              <span className="loan-summary__label">أول دفعة</span>
              <span className="loan-summary__value">
                {firstInstallment.toFixed(2)} دينار
              </span>
            </div>
            <div className="loan-summary__item">
              <span className="loan-summary__label">إجمالي الفائدة</span>
              <span className="loan-summary__value">
                {totalInterest.toFixed(2)} دينار
              </span>
            </div>
            <div className="loan-summary__item">
              <span className="loan-summary__label">إجمالي المبلغ المدفوع</span>
              <span className="loan-summary__value">
                {totalPaid.toFixed(2)} دينار
              </span>
            </div>
          </div>
        )}

        {/* جدول الدفعات */}
        {calculated && schedule.length > 0 && (
          <div className="table-wrapper loan-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>رقم الدفعة</th>
                  <th>تاريخ الدفع</th>
                  <th>عدد الأيام</th>
                  <th>قيمة الدفعة</th>
                  <th>جزء الأصل</th>
                  <th>جزء الفائدة</th>
                  <th>الرصيد المتبقي</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.installmentNo}>
                    <td>{row.installmentNo}</td>
                    <td>{row.date}</td>
                    <td>{row.days}</td>
                    <td>{row.payment.toFixed(2)}</td>
                    <td>{row.principal.toFixed(2)}</td>
                    <td>{row.interest.toFixed(2)}</td>
                    <td>{row.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {calculated && schedule.length === 0 && (
          <p className="questions-empty" style={{ marginTop: 16 }}>
            تأكد من إدخال جميع حقول القرض بشكل صحيح ليتم احتساب الجدول.
          </p>
        )}
      </div>
    </div>
  );
}
