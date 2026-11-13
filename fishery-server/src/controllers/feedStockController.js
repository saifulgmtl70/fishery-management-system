import db from '../config/db.js'

export const getFeedStock = async (req, res) => {
  try {
    const [stocks] = await db.query(`
      SELECT ft.id AS feed_type_id, ft.feed_name, ft.brand,

        COALESCE(p.total_purchased_kg, 0) AS total_purchased_kg,

        COALESCE(f.total_used_kg, 0) AS total_used_kg,

        (
          COALESCE(p.total_purchased_kg, 0) -
          COALESCE(f.total_used_kg, 0)
        ) AS available_stock_kg

      FROM feed_types ft

      LEFT JOIN (
        SELECT feed_type_id,
        SUM(quantity_kg) AS total_purchased_kg
        FROM feed_purchases
        GROUP BY feed_type_id
      ) p ON p.feed_type_id = ft.id

      LEFT JOIN (
        SELECT feed_type_id,
        SUM(quantity_kg) AS total_used_kg
        FROM daily_feedings
        GROUP BY feed_type_id
      ) f ON f.feed_type_id = ft.id

      ORDER BY ft.feed_name ASC
    `)

    res.status(200).json({
      success: true,
      total: stocks.length,
      stocks,
    })
  } 
  catch (error) {
    console.error('Get Feed Stock Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feed stock.',
    })
  }
}