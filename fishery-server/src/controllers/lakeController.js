
import db from '../config/db.js'

// ==========================================
// FISHERMEN
// ==========================================

// Add Fisherman
export const createFisherman = async (req, res) => {
  try {
    const { fisherman_name, phone, address, notes } = req.body

    if (!fisherman_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Fisherman name is required.',
      })
    }

    const [result] = await db.execute(
      `INSERT INTO lake_fishermen
       (fisherman_name, phone, address, notes)
       VALUES (?, ?, ?, ?)`,
      [
        fisherman_name.trim(),
        phone || null,
        address || null,
        notes || null,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Fisherman added successfully.',
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error('Create Fisherman Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add fisherman.',
    })
  }
}

// Get All Fishermen
export const getFishermen = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT *
       FROM lake_fishermen
       ORDER BY id DESC`
    )

    return res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Get Fishermen Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve fishermen.',
    })
  }
}


// ==========================================
// LOCAL FISHING RECORDS
// ==========================================

// Add Fishing Record
export const createFishingRecord = async (req, res) => {
  try {
    const {
      fisherman_id,
      fish_species_id,
      fishing_date,
      session,
      quantity_kg,
      price_per_kg,
      notes,
    } = req.body

    if (
      !fisherman_id ||
      !fish_species_id ||
      !fishing_date ||
      !['morning', 'afternoon'].includes(session) ||
      !Number.isFinite(Number(quantity_kg)) ||
      !Number.isFinite(Number(price_per_kg)) ||
      Number(quantity_kg) <= 0 ||
      Number(price_per_kg) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid fishing record information.',
      })
    }

    const totalValue =
      Number(quantity_kg) * Number(price_per_kg)

    const ownerShare = totalValue / 2
    const fishermanShare = totalValue / 2

    const [result] = await db.execute(
      `INSERT INTO lake_fishing_records
       (
         fisherman_id,
         fish_species_id,
         fishing_date,
         session,
         quantity_kg,
         price_per_kg,
         total_value,
         owner_share,
         fisherman_share,
         notes
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fisherman_id,
        fish_species_id,
        fishing_date,
        session,
        quantity_kg,
        price_per_kg,
        totalValue,
        ownerShare,
        fishermanShare,
        notes || null,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Fishing record added successfully.',
      data: {
        id: result.insertId,
        total_value: totalValue,
        owner_share: ownerShare,
        fisherman_share: fishermanShare,
      },
    })
  } catch (error) {
    console.error('Create Fishing Record Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add fishing record.',
    })
  }
}



 // Update Fishing Record
export const updateFishingRecord = async (req, res) => {
  try {
    const { id } = req.params

    const {
      fisherman_id,
      fish_species_id,
      fishing_date,
      session,
      quantity_kg,
      price_per_kg,
      notes,
    } = req.body

    if (
      !Number.isInteger(Number(id)) ||
      Number(id) <= 0 ||
      !fisherman_id ||
      !fish_species_id ||
      !fishing_date ||
      !['morning', 'afternoon'].includes(session) ||
      !Number.isFinite(Number(quantity_kg)) ||
      !Number.isFinite(Number(price_per_kg)) ||
      Number(quantity_kg) <= 0 ||
      Number(price_per_kg) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid fishing record information.',
      })
    }

    const [existing] = await db.execute(
      'SELECT id FROM lake_fishing_records WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Fishing record not found.',
      })
    }

    const totalValue =
      Number(quantity_kg) * Number(price_per_kg)

    const ownerShare = totalValue / 2
    const fishermanShare = totalValue / 2

    await db.execute(
      `UPDATE lake_fishing_records
       SET
         fisherman_id = ?,
         fish_species_id = ?,
         fishing_date = ?,
         session = ?,
         quantity_kg = ?,
         price_per_kg = ?,
         total_value = ?,
         owner_share = ?,
         fisherman_share = ?,
         notes = ?
       WHERE id = ?`,
      [
        fisherman_id,
        fish_species_id,
        fishing_date,
        session,
        quantity_kg,
        price_per_kg,
        totalValue,
        ownerShare,
        fishermanShare,
        notes || null,
        id,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Fishing record updated successfully.',
      data: {
        id: Number(id),
        total_value: totalValue,
        owner_share: ownerShare,
        fisherman_share: fishermanShare,
      },
    })
  } catch (error) {
    console.error('Update Fishing Record Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update fishing record.',
    })
  }
}



// Get Fishing Records
export const getFishingRecords = async (req, res) => {
  try {
    const { date, session, fisherman_id } = req.query

    let condition = 'WHERE 1 = 1'
    const values = []

    if (date) {
      condition += ' AND lfr.fishing_date = ?'
      values.push(date)
    }

    if (session) {
      if (!['morning', 'afternoon'].includes(session)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid fishing session.',
        })
      }

      condition += ' AND lfr.session = ?'
      values.push(session)
    }

    if (fisherman_id) {
      condition += ' AND lfr.fisherman_id = ?'
      values.push(fisherman_id)
    }

    const [rows] = await db.execute(
      `SELECT
         lfr.*,
         lf.fisherman_name,
         fs.species_name
       FROM lake_fishing_records lfr
       INNER JOIN lake_fishermen lf
         ON lfr.fisherman_id = lf.id
       INNER JOIN fish_species fs
         ON lfr.fish_species_id = fs.id
       ${condition}
       ORDER BY lfr.fishing_date DESC, lfr.id DESC`,
      values
    )

    return res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Get Fishing Records Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve fishing records.',
    })
  }
}


// ==========================================
// ROD FISHING
// ==========================================

// Add Rod Fishing Entry
export const createRodFishingEntry = async (req, res) => {
  try {
    const {
      fishing_date,
      visitor_name,
      amount,
      payment_method,
      reference_number,
      notes,
    } = req.body

    if (
      !fishing_date ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid date and amount are required.',
      })
    }

    const [result] = await db.execute(
      `INSERT INTO lake_rod_fishing
       (
         fishing_date,
         visitor_name,
         amount,
         payment_method,
         reference_number,
         notes
       )
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        fishing_date,
        visitor_name || null,
        amount,
        payment_method || 'cash',
        reference_number || null,
        notes || null,
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Rod fishing entry added successfully.',
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error('Create Rod Fishing Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add rod fishing entry.',
    })
  }
}


 // Update Rod Fishing Entry
export const updateRodFishingEntry = async (req, res) => {
  try {
    const { id } = req.params

    const {
      fishing_date,
      visitor_name,
      amount,
      payment_method,
      reference_number,
      notes,
    } = req.body

    const validPaymentMethods = [
      'cash',
      'bkash',
      'nagad',
      'bank',
      'other',
    ]

    if (
      !Number.isInteger(Number(id)) ||
      Number(id) <= 0 ||
      !fishing_date ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !validPaymentMethods.includes(payment_method)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid rod fishing information.',
      })
    }

    const [existing] = await db.execute(
      'SELECT id FROM lake_rod_fishing WHERE id = ?',
      [id]
    )

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rod fishing entry not found.',
      })
    }

    await db.execute(
      `UPDATE lake_rod_fishing
       SET
         fishing_date = ?,
         visitor_name = ?,
         amount = ?,
         payment_method = ?,
         reference_number = ?,
         notes = ?
       WHERE id = ?`,
      [
        fishing_date,
        visitor_name || null,
        amount,
        payment_method,
        reference_number || null,
        notes || null,
        id,
      ]
    )

    return res.status(200).json({
      success: true,
      message: 'Rod fishing entry updated successfully.',
      data: { id: Number(id) },
    })
  } catch (error) {
    console.error('Update Rod Fishing Error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to update rod fishing entry.',
    })
  }
}


// Get Rod Fishing Entries
export const getRodFishingEntries = async (req, res) => {
  try {
    const { date } = req.query

    let condition = ''
    const values = []

    if (date) {
      condition = 'WHERE fishing_date = ?'
      values.push(date)
    }

    const [rows] = await db.execute(
      `SELECT *
       FROM lake_rod_fishing
       ${condition}
       ORDER BY fishing_date DESC, id DESC`,
      values
    )

    return res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error('Get Rod Fishing Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rod fishing entries.',
    })
  }
}


// ==========================================
// DAILY LAKE SUMMARY
// ==========================================

export const getLakeDailySummary = async (req, res) => {
  try {
    const { date } = req.query

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'A valid date is required.',
      })
    }

    const [fishingRows] = await db.execute(
      `SELECT
         session,
         COALESCE(SUM(total_value), 0) AS total_fish_value,
         COALESCE(SUM(owner_share), 0) AS owner_share,
         COALESCE(SUM(fisherman_share), 0) AS fisherman_share
       FROM lake_fishing_records
       WHERE fishing_date = ?
       GROUP BY session`,
      [date]
    )

    const [rodRows] = await db.execute(
      `SELECT
         COUNT(*) AS total_visitors,
         COALESCE(SUM(amount), 0) AS total_rod_income
       FROM lake_rod_fishing
       WHERE fishing_date = ?`,
      [date]
    )

    const fishingSummary = {
      morning: {
        total_fish_value: 0,
        owner_share: 0,
        fisherman_share: 0,
      },
      afternoon: {
        total_fish_value: 0,
        owner_share: 0,
        fisherman_share: 0,
      },
    }

    fishingRows.forEach((row) => {
      fishingSummary[row.session] = {
        total_fish_value: Number(row.total_fish_value),
        owner_share: Number(row.owner_share),
        fisherman_share: Number(row.fisherman_share),
      }
    })

    const rodIncome = Number(rodRows[0].total_rod_income || 0)

    const localFishermenIncome =
      fishingSummary.morning.owner_share +
      fishingSummary.afternoon.owner_share

    return res.status(200).json({
      success: true,
      data: {
        date,
        fishing: fishingSummary,
        local_fishermen_owner_income: localFishermenIncome,
        rod_fishing: {
          total_visitors: Number(rodRows[0].total_visitors),
          total_income: rodIncome,
        },
        total_lake_income: localFishermenIncome + rodIncome,
      },
    })
  } catch (error) {
    console.error('Lake Daily Summary Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve lake summary.',
    })
  }
}
