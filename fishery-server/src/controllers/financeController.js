
import db from '../config/db.js'

// ==========================================
// DATE HELPERS
// ==========================================

const isValidDate = (date) => {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false
  }

  const parsed = new Date(`${date}T00:00:00Z`)

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  )
}

const validateDateRange = (startDate, endDate) => {
  if (startDate && !isValidDate(startDate)) return false
  if (endDate && !isValidDate(endDate)) return false
  if (startDate && endDate && startDate > endDate) return false

  return true
}

const getDateFilters = (req) => {
  const { start_date, end_date } = req.query

  if (!validateDateRange(start_date, end_date)) {
    return null
  }

  let saleCondition = 'WHERE 1 = 1'
  let expenseCondition = 'WHERE 1 = 1'

  const saleValues = []
  const expenseValues = []

  if (start_date) {
    saleCondition += ' AND sale_date >= ?'
    expenseCondition += ' AND expense_date >= ?'

    saleValues.push(start_date)
    expenseValues.push(start_date)
  }

  if (end_date) {
    saleCondition += ' AND sale_date < DATE_ADD(?, INTERVAL 1 DAY)'
    expenseCondition += ' AND expense_date < DATE_ADD(?, INTERVAL 1 DAY)'

    saleValues.push(end_date)
    expenseValues.push(end_date)
  }

  return {
    saleCondition,
    expenseCondition,
    saleValues,
    expenseValues,
    start_date,
    end_date,
  }
}

// ==========================================
// SOURCE DATE FILTER
// ==========================================

const getSourceDateFilter = (column, filters) => {
  let condition = 'WHERE 1 = 1'
  const values = []

  if (filters.start_date) {
    condition += ` AND ${column} >= ?`
    values.push(filters.start_date)
  }

  if (filters.end_date) {
    condition += ` AND ${column} < DATE_ADD(?, INTERVAL 1 DAY)`
    values.push(filters.end_date)
  }

  return { condition, values }
}

// ==========================================
// STAFF SALARY MONTH FILTER
// ==========================================

const getSalaryDateFilter = (filters, alias = '') => {
  const column = alias
    ? `${alias}.salary_month`
    : 'salary_month'

  let condition = 'WHERE 1 = 1'
  const values = []

  // Include the full salary month when the selected
  // date range overlaps that month.

  if (filters.start_date) {
    condition += ` AND LAST_DAY(${column}) >= ?`
    values.push(filters.start_date)
  }

  if (filters.end_date) {
    condition += ` AND ${column} <= LAST_DAY(?)`
    values.push(filters.end_date)
  }

  return { condition, values }
}

// ==========================================
// COMMON FINANCIAL RESULT HELPER
// ==========================================

const calculateFinancialResult = (income, expenses) => {
  const netResult = Number((income - expenses).toFixed(2))

  return {
    net_profit: netResult > 0 ? netResult : 0,
    net_loss: netResult < 0 ? Math.abs(netResult) : 0,
  }
}

// ==========================================
// LAKE INCOME HELPER
// ==========================================

const getLakeIncomeTotals = async (filters) => {
  const localFilters = getSourceDateFilter(
    'fishing_date',
    filters
  )

  const rodFilters = getSourceDateFilter(
    'fishing_date',
    filters
  )

  const [localRows] = await db.execute(
    `
      SELECT
        COALESCE(SUM(owner_share), 0) AS total_income,
        COUNT(id) AS total_transactions
      FROM lake_fishing_records
      ${localFilters.condition}
    `,
    localFilters.values
  )

  const [rodRows] = await db.execute(
    `
      SELECT
        COALESCE(SUM(amount), 0) AS total_income,
        COUNT(id) AS total_transactions
      FROM lake_rod_fishing
      ${rodFilters.condition}
    `,
    rodFilters.values
  )

  const localIncome = Number(localRows[0].total_income || 0)
  const rodIncome = Number(rodRows[0].total_income || 0)

  return {
    local_income: localIncome,
    rod_income: rodIncome,
    total_lake_income: Number(
      (localIncome + rodIncome).toFixed(2)
    ),
    local_transactions: Number(
      localRows[0].total_transactions || 0
    ),
    rod_transactions: Number(
      rodRows[0].total_transactions || 0
    ),
    total_transactions:
      Number(localRows[0].total_transactions || 0) +
      Number(rodRows[0].total_transactions || 0),
  }
}

// ==========================================
// FINANCE OVERVIEW
// ==========================================

export const getFinanceOverview = async (req, res) => {
  try {
    const filters = getDateFilters(req)

    if (!filters) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range.',
      })
    }

    // Fish Sales Income
    const [incomeRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(total_amount), 0) AS total_income
        FROM fish_sales
        ${filters.saleCondition}
      `,
      filters.saleValues
    )

    // Lake Income
    const lakeIncome = await getLakeIncomeTotals(filters)

    // Manual Expenses
    const [manualExpenseRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        ${filters.expenseCondition}
      `,
      filters.expenseValues
    )

    // Feed Purchases
    const feedFilters = getSourceDateFilter(
      'purchase_date',
      filters
    )

    const [feedExpenseRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(total_cost), 0) AS total_expenses
        FROM feed_purchases
        ${feedFilters.condition}
      `,
      feedFilters.values
    )

    // Fish Stocking Purchases
    const stockingFilters = getSourceDateFilter(
      'stocking_date',
      filters
    )

    const [stockingExpenseRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(total_cost), 0) AS total_expenses
        FROM fish_stockings
        ${stockingFilters.condition}
      `,
      stockingFilters.values
    )

    // Staff Salary Expenses
    const salaryFilters = getSalaryDateFilter(
      filters,
      'ssr'
    )

    const [salaryExpenseRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(ssr.salary_amount), 0) AS total_expenses
        FROM staff_salary_records ssr
        ${salaryFilters.condition}
      `,
      salaryFilters.values
    )

    // Sales and Outstanding Due
    const [salesRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(total_amount), 0) AS total_sales,
          COALESCE(SUM(due_amount), 0) AS outstanding_due
        FROM fish_sales
        ${filters.saleCondition}
      `,
      filters.saleValues
    )

    const fishSalesIncome = Number(
      incomeRows[0].total_income || 0
    )

    const totalIncome = Number(
      (
        fishSalesIncome +
        lakeIncome.total_lake_income
      ).toFixed(2)
    )

    const manualExpenses = Number(
      manualExpenseRows[0].total_expenses || 0
    )

    const feedExpenses = Number(
      feedExpenseRows[0].total_expenses || 0
    )

    const stockingExpenses = Number(
      stockingExpenseRows[0].total_expenses || 0
    )

    const staffSalaryExpenses = Number(
      salaryExpenseRows[0].total_expenses || 0
    )

    const totalExpenses = Number(
      (
        manualExpenses +
        feedExpenses +
        stockingExpenses +
        staffSalaryExpenses
      ).toFixed(2)
    )

    const financialResult = calculateFinancialResult(
      totalIncome,
      totalExpenses
    )

    return res.status(200).json({
      success: true,
      message: 'Finance overview retrieved successfully.',
      data: {
        total_income: totalIncome,
        fish_sales_income: fishSalesIncome,
        lake_income: lakeIncome.total_lake_income,
        local_fishing_income: lakeIncome.local_income,
        rod_fishing_income: lakeIncome.rod_income,

        total_expenses: totalExpenses,

        expense_breakdown: {
          manual_expenses: manualExpenses,
          feed_purchases: feedExpenses,
          fish_stocking_purchases: stockingExpenses,
          staff_salary_expenses: staffSalaryExpenses,
        },

        staff_salary_expenses: staffSalaryExpenses,

        ...financialResult,

        total_sales: Number(
          salesRows[0].total_sales || 0
        ),

        outstanding_due: Number(
          salesRows[0].outstanding_due || 0
        ),
      },
    })
  } catch (error) {
    console.error('Finance Overview Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve finance overview.',
    })
  }
}

// ==========================================
// INCOME SUMMARY
// ==========================================

export const getIncomeSummary = async (req, res) => {
  try {
    const filters = getDateFilters(req)

    if (!filters) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range.',
      })
    }

    // Fish Sales Filter
    let saleCondition = 'WHERE 1 = 1'
    const saleValues = []

    if (filters.start_date) {
      saleCondition += ' AND fs.sale_date >= ?'
      saleValues.push(filters.start_date)
    }

    if (filters.end_date) {
      saleCondition +=
        ' AND fs.sale_date < DATE_ADD(?, INTERVAL 1 DAY)'
      saleValues.push(filters.end_date)
    }

    // Fish Sales Summary
    const [summary] = await db.execute(
      `
        SELECT
          COALESCE(SUM(fs.total_amount), 0) AS total_income,
          COUNT(fs.id) AS total_transactions
        FROM fish_sales fs
        ${saleCondition}
      `,
      saleValues
    )

    // Fish Sales History
    const [sales] = await db.execute(
      `
        SELECT
          fs.id,
          fs.invoice_number,
          fs.sale_date,
          d.dealer_name,
          fs.total_amount,
          fs.paid_amount,
          fs.due_amount,
          fs.payment_status,
          fs.notes
        FROM fish_sales fs
        INNER JOIN dealers d
          ON fs.dealer_id = d.id
        ${saleCondition}
        ORDER BY fs.sale_date DESC, fs.id DESC
      `,
      saleValues
    )

    // Local Fishing Income
    const localFilters = getSourceDateFilter(
      'lfr.fishing_date',
      filters
    )

    const [localFishing] = await db.execute(
      `
        SELECT
          lfr.id,
          lfr.fishing_date,
          lfr.session,
          lfr.quantity_kg,
          lfr.price_per_kg,
          lfr.total_value,
          lfr.owner_share,
          lfr.fisherman_share,
          lfr.notes,
          lf.fisherman_name,
          fs.species_name
        FROM lake_fishing_records lfr
        INNER JOIN lake_fishermen lf
          ON lfr.fisherman_id = lf.id
        INNER JOIN fish_species fs
          ON lfr.fish_species_id = fs.id
        ${localFilters.condition}
        ORDER BY lfr.fishing_date DESC, lfr.id DESC
      `,
      localFilters.values
    )

    // Rod Fishing Income
    const rodFilters = getSourceDateFilter(
      'lr.fishing_date',
      filters
    )

    const [rodFishing] = await db.execute(
      `
        SELECT
          lr.id,
          lr.fishing_date,
          lr.visitor_name,
          lr.amount,
          lr.payment_method,
          lr.reference_number,
          lr.notes
        FROM lake_rod_fishing lr
        ${rodFilters.condition}
        ORDER BY lr.fishing_date DESC, lr.id DESC
      `,
      rodFilters.values
    )

    // Combine Income Records
    const salesRecords = sales.map((record) => ({
      ...record,
      source_type: 'Fish Sales',
      income_amount: Number(record.total_amount || 0),
    }))

    const localRecords = localFishing.map((record) => ({
      ...record,
      source_type: 'Local Fishing',
      income_amount: Number(record.owner_share || 0),
    }))

    const rodRecords = rodFishing.map((record) => ({
      ...record,
      source_type: 'Rod Fishing',
      income_amount: Number(record.amount || 0),
    }))

    const records = [
      ...salesRecords,
      ...localRecords,
      ...rodRecords,
    ].sort((a, b) => {
      const dateA = String(
        a.sale_date || a.fishing_date || ''
      )

      const dateB = String(
        b.sale_date || b.fishing_date || ''
      )

      if (dateA !== dateB) {
        return dateB.localeCompare(dateA)
      }

      return Number(b.id || 0) - Number(a.id || 0)
    })

    const fishSalesIncome = Number(
      summary[0].total_income || 0
    )

    const lakeIncome = await getLakeIncomeTotals(filters)

    const totalIncome = Number(
      (
        fishSalesIncome +
        lakeIncome.total_lake_income
      ).toFixed(2)
    )

    const totalTransactions =
      Number(summary[0].total_transactions || 0) +
      lakeIncome.total_transactions

    return res.status(200).json({
      success: true,
      message: 'Income records retrieved successfully.',
      data: {
        total_income: totalIncome,
        total_transactions: totalTransactions,

        fish_sales_income: fishSalesIncome,
        fish_sales_transactions: Number(
          summary[0].total_transactions || 0
        ),

        lake_income: lakeIncome.total_lake_income,
        local_fishing_income: lakeIncome.local_income,
        rod_fishing_income: lakeIncome.rod_income,

        lake_transactions: lakeIncome.total_transactions,
        local_fishing_transactions:
          lakeIncome.local_transactions,
        rod_fishing_transactions:
          lakeIncome.rod_transactions,

        records,
      },
    })
  } catch (error) {
    console.error('Income Summary Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve income records.',
    })
  }
}

// ==========================================
// PROFIT AND LOSS
// ==========================================

export const getProfitLoss = async (req, res) => {
  try {
    const filters = getDateFilters(req)

    if (!filters) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range.',
      })
    }

    // Fish Sales Income
    const [incomeRows] = await db.execute(
      `
        SELECT
          COALESCE(SUM(total_amount), 0) AS total_income
        FROM fish_sales
        ${filters.saleCondition}
      `,
      filters.saleValues
    )

    // Lake Income
    const lakeIncome = await getLakeIncomeTotals(filters)

    // Expense Date Filters
    const manualFilters = getSourceDateFilter(
      'e.expense_date',
      filters
    )

    const feedFilters = getSourceDateFilter(
      'fp.purchase_date',
      filters
    )

    const stockingFilters = getSourceDateFilter(
      'fs.stocking_date',
      filters
    )

    const salaryFilters = getSalaryDateFilter(
      filters,
      'ssr'
    )

    // Combined Expense Sources
    const [expenseRows] = await db.execute(
      `
        SELECT
          category_name,
          SUM(total_amount) AS total_amount
        FROM (
          SELECT
            COALESCE(ec.category_name, 'Uncategorized') AS category_name,
            SUM(e.amount) AS total_amount
          FROM expenses e
          LEFT JOIN expense_categories ec
            ON e.category_id = ec.id
          ${manualFilters.condition}
          GROUP BY ec.id, ec.category_name

          UNION ALL

          SELECT
            'Feed Purchase' AS category_name,
            SUM(fp.total_cost) AS total_amount
          FROM feed_purchases fp
          ${feedFilters.condition}
          HAVING SUM(fp.total_cost) IS NOT NULL

          UNION ALL

          SELECT
            'Fish Stocking Purchase' AS category_name,
            SUM(fs.total_cost) AS total_amount
          FROM fish_stockings fs
          ${stockingFilters.condition}
          HAVING SUM(fs.total_cost) IS NOT NULL

          UNION ALL

          SELECT
            'Staff Salary' AS category_name,
            SUM(ssr.salary_amount) AS total_amount
          FROM staff_salary_records ssr
          ${salaryFilters.condition}
          HAVING SUM(ssr.salary_amount) IS NOT NULL
        ) AS combined_expenses
        GROUP BY category_name
        ORDER BY total_amount DESC
      `,
      [
        ...manualFilters.values,
        ...feedFilters.values,
        ...stockingFilters.values,
        ...salaryFilters.values,
      ]
    )

    const fishSalesIncome = Number(
      incomeRows[0].total_income || 0
    )

    const totalIncome = Number(
      (
        fishSalesIncome +
        lakeIncome.total_lake_income
      ).toFixed(2)
    )

    const totalExpenses = Number(
      expenseRows.reduce(
        (total, item) =>
          total + Number(item.total_amount || 0),
        0
      ).toFixed(2)
    )

    // Staff Salary Expense
    const staffSalaryExpenses = Number(
      expenseRows.find(
        (item) => item.category_name === 'Staff Salary'
      )?.total_amount || 0
    )

    const financialResult = calculateFinancialResult(
      totalIncome,
      totalExpenses
    )

    return res.status(200).json({
      success: true,
      message: 'Profit and loss report retrieved successfully.',
      data: {
        total_income: totalIncome,
        fish_sales_income: fishSalesIncome,
        lake_income: lakeIncome.total_lake_income,
        local_fishing_income: lakeIncome.local_income,
        rod_fishing_income: lakeIncome.rod_income,

        total_expenses: totalExpenses,
        staff_salary_expenses: staffSalaryExpenses,

        ...financialResult,

        expense_breakdown: expenseRows,
      },
    })
  } catch (error) {
    console.error('Profit Loss Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profit and loss report.',
    })
  }
}

// ==========================================
// FINANCIAL REPORTS
// ==========================================

export const getFinancialReports = async (req, res) => {
  try {
    const filters = getDateFilters(req)

    if (!filters) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range.',
      })
    }

    // ==========================================
    // INCOME BY DATE - SOURCE WISE
    // ==========================================

    const saleFilters = getSourceDateFilter(
      'sale_date',
      filters
    )

    const localFilters = getSourceDateFilter(
      'fishing_date',
      filters
    )

    const rodFilters = getSourceDateFilter(
      'fishing_date',
      filters
    )

    const [incomeRows] = await db.execute(
      `
        SELECT
          report_date,
          SUM(fish_sales_income) AS fish_sales_income,
          SUM(local_fishing_income) AS local_fishing_income,
          SUM(rod_fishing_income) AS rod_fishing_income,
          SUM(
            fish_sales_income +
            local_fishing_income +
            rod_fishing_income
          ) AS total_income
        FROM (
          SELECT
            DATE(sale_date) AS report_date,
            SUM(total_amount) AS fish_sales_income,
            0 AS local_fishing_income,
            0 AS rod_fishing_income
          FROM fish_sales
          ${saleFilters.condition}
          GROUP BY DATE(sale_date)

          UNION ALL

          SELECT
            DATE(fishing_date) AS report_date,
            0 AS fish_sales_income,
            SUM(owner_share) AS local_fishing_income,
            0 AS rod_fishing_income
          FROM lake_fishing_records
          ${localFilters.condition}
          GROUP BY DATE(fishing_date)

          UNION ALL

          SELECT
            DATE(fishing_date) AS report_date,
            0 AS fish_sales_income,
            0 AS local_fishing_income,
            SUM(amount) AS rod_fishing_income
          FROM lake_rod_fishing
          ${rodFilters.condition}
          GROUP BY DATE(fishing_date)
        ) AS combined_income
        GROUP BY report_date
        ORDER BY report_date ASC
      `,
      [
        ...saleFilters.values,
        ...localFilters.values,
        ...rodFilters.values,
      ]
    )

    // ==========================================
    // EXPENSES BY DATE
    // ==========================================

    const manualFilters = getSourceDateFilter(
      'expense_date',
      filters
    )

    const feedFilters = getSourceDateFilter(
      'purchase_date',
      filters
    )

    const stockingFilters = getSourceDateFilter(
      'stocking_date',
      filters
    )

    const salaryFilters = getSalaryDateFilter(
      filters,
      'ssr'
    )

    const [expenseRows] = await db.execute(
      `
        SELECT
          report_date,
          SUM(total_expenses) AS total_expenses
        FROM (
          SELECT
            DATE(expense_date) AS report_date,
            SUM(amount) AS total_expenses
          FROM expenses
          ${manualFilters.condition}
          GROUP BY DATE(expense_date)

          UNION ALL

          SELECT
            DATE(purchase_date) AS report_date,
            SUM(total_cost) AS total_expenses
          FROM feed_purchases
          ${feedFilters.condition}
          GROUP BY DATE(purchase_date)

          UNION ALL

          SELECT
            DATE(stocking_date) AS report_date,
            SUM(total_cost) AS total_expenses
          FROM fish_stockings
          ${stockingFilters.condition}
          GROUP BY DATE(stocking_date)

          UNION ALL

          SELECT
            DATE(ssr.salary_month) AS report_date,
            SUM(ssr.salary_amount) AS total_expenses
          FROM staff_salary_records ssr
          ${salaryFilters.condition}
          GROUP BY DATE(ssr.salary_month)
        ) AS combined_expenses
        GROUP BY report_date
        ORDER BY report_date ASC
      `,
      [
        ...manualFilters.values,
        ...feedFilters.values,
        ...stockingFilters.values,
        ...salaryFilters.values,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Financial reports retrieved successfully.',
      data: {
        income_by_date: incomeRows,
        expenses_by_date: expenseRows,
      },
    })
  } catch (error) {
    console.error('Financial Reports Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial reports.',
    })
  }
}
