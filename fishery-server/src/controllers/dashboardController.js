
import db from '../config/db.js'

// ==========================================
// ADMIN DASHBOARD OVERVIEW
// ==========================================

export const getDashboardOverview = async (req, res) => {
  try {
    // ==========================================
    // 1. POND OVERVIEW
    // ==========================================

    const [pondRows] = await db.execute(`
      SELECT
        COUNT(*) AS total_ponds,
        COALESCE(SUM(status = 'active'), 0) AS active_ponds,
        COALESCE(SUM(status = 'inactive'), 0) AS inactive_ponds,
        COALESCE(SUM(status = 'maintenance'), 0) AS maintenance_ponds
      FROM ponds
    `)

    // ==========================================
    // 2. CURRENT FISH STOCK
    // ==========================================

    const [fishStockRows] = await db.execute(`
      SELECT
        COALESCE(
          (SELECT SUM(total_weight_kg) FROM fish_stockings),
          0
        )
        -
        COALESCE(
          (SELECT SUM(total_weight_kg) FROM fish_mortalities),
          0
        )
        -
        COALESCE(
          (SELECT SUM(quantity_kg) FROM fish_sale_items),
          0
        ) AS current_fish_stock_kg
    `)

    // ==========================================
    // 3. FEED INVENTORY
    // ==========================================

    const [feedStockRows] = await db.execute(`
      SELECT
        COALESCE(SUM(available_stock_kg), 0)
          AS total_feed_inventory_kg
      FROM (
        SELECT
          ft.id,
          (
            COALESCE(p.total_purchased_kg, 0)
            -
            COALESCE(f.total_used_kg, 0)
          ) AS available_stock_kg
        FROM feed_types ft

        LEFT JOIN (
          SELECT
            feed_type_id,
            SUM(quantity_kg) AS total_purchased_kg
          FROM feed_purchases
          GROUP BY feed_type_id
        ) p ON p.feed_type_id = ft.id

        LEFT JOIN (
          SELECT
            feed_type_id,
            SUM(quantity_kg) AS total_used_kg
          FROM daily_feedings
          GROUP BY feed_type_id
        ) f ON f.feed_type_id = ft.id
      ) AS feed_inventory
    `)

    // ==========================================
    // 4. FINANCIAL OVERVIEW
    // ==========================================

    const [
      fishSalesRows,
      localFishingRows,
      rodFishingRows,
      manualExpenseRows,
      feedExpenseRows,
      stockingExpenseRows,
      salaryExpenseRows,
      outstandingRows,
    ] = await Promise.all([
      // Fish Sales Income
      db.execute(`
        SELECT
          COALESCE(SUM(total_amount), 0) AS total_income
        FROM fish_sales
      `),

      // Local Fishing: Owner's Share
      db.execute(`
        SELECT
          COALESCE(SUM(owner_share), 0) AS total_income
        FROM lake_fishing_records
      `),

      // Rod Fishing: Full Amount
      db.execute(`
        SELECT
          COALESCE(SUM(amount), 0) AS total_income
        FROM lake_rod_fishing
      `),

      // Manual Expenses
      db.execute(`
        SELECT
          COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
      `),

      // Feed Purchases
      db.execute(`
        SELECT
          COALESCE(SUM(total_cost), 0) AS total_expenses
        FROM feed_purchases
      `),

      // Fish Stocking Purchases
      db.execute(`
        SELECT
          COALESCE(SUM(total_cost), 0) AS total_expenses
        FROM fish_stockings
      `),

      // Staff Salary Expenses
      db.execute(`
        SELECT
          COALESCE(SUM(salary_amount), 0) AS total_expenses
        FROM staff_salary_records
      `),

      // Outstanding Dealer Dues
      db.execute(`
        SELECT
          COALESCE(SUM(due_amount), 0) AS outstanding_due
        FROM fish_sales
      `),
    ])

    const fishSalesIncome = Number(
      fishSalesRows[0][0].total_income || 0
    )

    const localFishingIncome = Number(
      localFishingRows[0][0].total_income || 0
    )

    const rodFishingIncome = Number(
      rodFishingRows[0][0].total_income || 0
    )

    const totalIncome = Number(
      (
        fishSalesIncome +
        localFishingIncome +
        rodFishingIncome
      ).toFixed(2)
    )

    const manualExpenses = Number(
      manualExpenseRows[0][0].total_expenses || 0
    )

    const feedExpenses = Number(
      feedExpenseRows[0][0].total_expenses || 0
    )

    const stockingExpenses = Number(
      stockingExpenseRows[0][0].total_expenses || 0
    )

    const salaryExpenses = Number(
      salaryExpenseRows[0][0].total_expenses || 0
    )

    const totalExpenses = Number(
      (
        manualExpenses +
        feedExpenses +
        stockingExpenses +
        salaryExpenses
      ).toFixed(2)
    )

    const netResult = Number(
      (totalIncome - totalExpenses).toFixed(2)
    )

    const outstandingDue = Number(
      outstandingRows[0][0].outstanding_due || 0
    )

    // ==========================================
    // 5. TODAY'S ACTIVITY
    // ==========================================

    const [
      todaySalesRows,
      todayStockingRows,
      todayMortalityRows,
      todayFeedingRows,
    ] = await Promise.all([
      // Today's Fish Sales
      db.execute(`
        SELECT
          COUNT(*) AS total_transactions,
          COALESCE(SUM(total_amount), 0) AS total_amount
        FROM fish_sales
        WHERE sale_date >= CURDATE()
          AND sale_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `),

      // Today's Fish Stocking
      db.execute(`
        SELECT
          COUNT(*) AS total_records,
          COALESCE(SUM(total_weight_kg), 0) AS total_weight_kg
        FROM fish_stockings
        WHERE stocking_date >= CURDATE()
          AND stocking_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `),

      // Today's Fish Mortality
      db.execute(`
        SELECT
          COUNT(*) AS total_records,
          COALESCE(SUM(total_weight_kg), 0) AS total_weight_kg
        FROM fish_mortalities
        WHERE mortality_date >= CURDATE()
          AND mortality_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `),

      // Today's Daily Feeding
      db.execute(`
        SELECT
          COUNT(*) AS total_records,
          COALESCE(SUM(quantity_kg), 0) AS total_quantity_kg
        FROM daily_feedings
        WHERE feeding_date >= CURDATE()
          AND feeding_date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      `),
    ])

    // ==========================================
    // 6. RECENT ACTIVITIES
    // ==========================================

    const [recentActivities] = await db.execute(`
      SELECT
        activity_id,
        activity_type,
        activity_date,
        description,
        amount
      FROM (
        -- Fish Sales
        SELECT
          fs.id AS activity_id,
          'Fish Sale' AS activity_type,
          fs.sale_date AS activity_date,
          fs.invoice_number AS description,
          fs.total_amount AS amount
        FROM fish_sales fs

        UNION ALL

        -- Fish Stocking
        SELECT
          fst.id AS activity_id,
          'Fish Stocking' AS activity_type,
          fst.stocking_date AS activity_date,
          CONCAT(
            COALESCE(p.pond_name, 'Unknown Pond'),
            ' - ',
            COALESCE(sp.species_name, 'Unknown Species')
          ) AS description,
          fst.total_cost AS amount
        FROM fish_stockings fst
        LEFT JOIN ponds p
          ON fst.pond_id = p.id
        LEFT JOIN fish_species sp
          ON fst.species_id = sp.id

        UNION ALL

        -- Fish Mortality
        SELECT
          fm.id AS activity_id,
          'Fish Mortality' AS activity_type,
          fm.mortality_date AS activity_date,
          CONCAT(
            COALESCE(p.pond_name, 'Unknown Pond'),
            ' - ',
            COALESCE(sp.species_name, 'Unknown Species')
          ) AS description,
          fm.total_weight_kg AS amount
        FROM fish_mortalities fm
        INNER JOIN fish_stockings fst
          ON fm.stocking_id = fst.id
        LEFT JOIN ponds p
          ON fst.pond_id = p.id
        LEFT JOIN fish_species sp
          ON fst.species_id = sp.id

        UNION ALL

        -- Daily Feeding
        SELECT
          df.id AS activity_id,
          'Daily Feeding' AS activity_type,
          df.feeding_date AS activity_date,
          CONCAT(
            COALESCE(p.pond_name, 'Unknown Pond'),
            ' - ',
            COALESCE(ft.feed_name, 'Unknown Feed')
          ) AS description,
          df.quantity_kg AS amount
        FROM daily_feedings df
        LEFT JOIN ponds p
          ON df.pond_id = p.id
        LEFT JOIN feed_types ft
          ON df.feed_type_id = ft.id

        UNION ALL

        -- Manual Expenses
        SELECT
          e.id AS activity_id,
          'Expense' AS activity_type,
          e.expense_date AS activity_date,
          COALESCE(
            NULLIF(e.description, ''),
            ec.category_name,
            'Expense'
          ) AS description,
          e.amount AS amount
        FROM expenses e
        LEFT JOIN expense_categories ec
          ON e.category_id = ec.id

        UNION ALL

        -- Staff Salary
        SELECT
          ssr.id AS activity_id,
          'Staff Salary' AS activity_type,
          STR_TO_DATE(
            CONCAT(ssr.salary_month, '-01'),
            '%Y-%m-%d'
          ) AS activity_date,
          CONCAT(
            COALESCE(s.name, 'Unknown Staff'),
            ' - Monthly Salary'
          ) AS description,
          ssr.salary_amount AS amount
        FROM staff_salary_records ssr
        LEFT JOIN staff s
          ON ssr.staff_id = s.id

      ) AS activities

      ORDER BY
        activity_date DESC,
        activity_id DESC,
        activity_type ASC

      LIMIT 10
    `)

    // ==========================================
    // 7. RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: 'Dashboard overview retrieved successfully.',

      data: {
        farm_overview: {
          total_ponds: Number(pondRows[0].total_ponds || 0),
          active_ponds: Number(pondRows[0].active_ponds || 0),
          inactive_ponds: Number(pondRows[0].inactive_ponds || 0),
          maintenance_ponds: Number(
            pondRows[0].maintenance_ponds || 0
          ),

          current_fish_stock_kg: Number(
            fishStockRows[0].current_fish_stock_kg || 0
          ),

          total_feed_inventory_kg: Number(
            feedStockRows[0].total_feed_inventory_kg || 0
          ),
        },

        financial_overview: {
          total_income: totalIncome,

          fish_sales_income: fishSalesIncome,
          local_fishing_income: localFishingIncome,
          rod_fishing_income: rodFishingIncome,

          total_expenses: totalExpenses,

          manual_expenses: manualExpenses,
          feed_expenses: feedExpenses,
          stocking_expenses: stockingExpenses,
          staff_salary_expenses: salaryExpenses,

          net_profit: netResult > 0 ? netResult : 0,
          net_loss: netResult < 0 ? Math.abs(netResult) : 0,

          outstanding_due: outstandingDue,
        },

        today_activity: {
          fish_sales: {
            total_transactions: Number(
              todaySalesRows[0][0].total_transactions || 0
            ),
            total_amount: Number(
              todaySalesRows[0][0].total_amount || 0
            ),
          },

          fish_stocking: {
            total_records: Number(
              todayStockingRows[0][0].total_records || 0
            ),
            total_weight_kg: Number(
              todayStockingRows[0][0].total_weight_kg || 0
            ),
          },

          fish_mortality: {
            total_records: Number(
              todayMortalityRows[0][0].total_records || 0
            ),
            total_weight_kg: Number(
              todayMortalityRows[0][0].total_weight_kg || 0
            ),
          },

          daily_feeding: {
            total_records: Number(
              todayFeedingRows[0][0].total_records || 0
            ),
            total_quantity_kg: Number(
              todayFeedingRows[0][0].total_quantity_kg || 0
            ),
          },
        },

        recent_activities: recentActivities.map((item) => ({
          id: Number(item.activity_id),
          activity_type: item.activity_type,
          activity_date: item.activity_date,
          description: item.description,
          amount: item.amount === null
            ? null
            : Number(item.amount),
        })),
      },
    })
  } catch (error) {
    console.error('Dashboard Overview Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard overview.',
    })
  }
}
