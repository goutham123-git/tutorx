// controllers/collabController.js
const db = require('../db');

// ── Get all teachers except self ──────────────────────────────────────────────
exports.getAllTeachers = async (req, res) => {
  try {
    const myUserId = req.user.id; // ← from JWT via authMiddleware

    const [rows] = await db.query(
      `SELECT
         t.id,
         t.name,
         t.subjects,
         t.bio,
         t.profile_pic,
         t.experience_years,
         t.is_verified,
         t.institution_name,
         t.user_id
       FROM teachers t
       WHERE t.user_id != ?
       ORDER BY t.name ASC`,
      [myUserId]
    );

    res.json({ teachers: rows });
  } catch (err) {
    console.error("getAllTeachers error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Send collaboration request ────────────────────────────────────────────────
exports.sendRequest = async (req, res) => {
  try {
    const senderUserId   = req.user.id;
    const { receiverId } = req.body; // this is the teacher's user_id

    if (!receiverId)
      return res.status(400).json({ message: "Receiver ID is required." });

    if (String(senderUserId) === String(receiverId))
      return res.status(400).json({ message: "You cannot collaborate with yourself." });

    // Check if request already exists in either direction
    const [existing] = await db.query(
      `SELECT id, status FROM collaborations
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)`,
      [senderUserId, receiverId, receiverId, senderUserId]
    );

    if (existing.length > 0) {
      const st = existing[0].status;
      if (st === "pending")
        return res.status(409).json({ message: "A request is already pending." });
      if (st === "accepted")
        return res.status(409).json({ message: "You are already collaborating." });
      // rejected → allow re-sending
      if (st === "rejected") {
        await db.query(
          `UPDATE collaborations
           SET status = 'pending', created_at = NOW()
           WHERE id = ?`,
          [existing[0].id]
        );
        return res.json({ message: "Collaboration request sent!" });
      }
    }

    await db.query(
      `INSERT INTO collaborations (sender_id, receiver_id, status, created_at)
       VALUES (?, ?, 'pending', NOW())`,
      [senderUserId, receiverId]
    );

    res.status(201).json({ message: "Collaboration request sent!" });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Respond to request (accept / reject) ─────────────────────────────────────
exports.respondToRequest = async (req, res) => {
  try {
    const myUserId            = req.user.id;
    const { requestId, action } = req.body;

    if (!["accept", "reject"].includes(action))
      return res.status(400).json({ message: "Action must be accept or reject." });

    const [rows] = await db.query(
      `SELECT id FROM collaborations
       WHERE id = ? AND receiver_id = ? AND status = 'pending'`,
      [requestId, myUserId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Request not found or already handled." });

    const newStatus  = action === "accept" ? "accepted" : "rejected";
    const acceptedAt = action === "accept" ? new Date() : null;

    await db.query(
      `UPDATE collaborations
       SET status = ?, accepted_at = ?
       WHERE id = ?`,
      [newStatus, acceptedAt, requestId]
    );

    res.json({
      message: action === "accept" ? "Collaboration accepted!" : "Request declined.",
    });
  } catch (err) {
    console.error("respondToRequest error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Get requests sent by this teacher ────────────────────────────────────────
exports.getSentRequests = async (req, res) => {
  try {
    const myUserId = req.user.id;

    const [rows] = await db.query(
      `SELECT
         c.id,
         c.receiver_id,
         c.status,
         c.created_at,
         t.name     AS receiver_name,
         t.subjects AS receiver_subjects,
         t.profile_pic AS receiver_pic
       FROM collaborations c
       JOIN teachers t ON t.user_id = c.receiver_id
       WHERE c.sender_id = ?
       ORDER BY c.created_at DESC`,
      [myUserId]
    );

    res.json({ requests: rows });
  } catch (err) {
    console.error("getSentRequests error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Get requests received by this teacher ─────────────────────────────────────
exports.getIncomingRequests = async (req, res) => {
  try {
    const myUserId = req.user.id;

    const [rows] = await db.query(
      `SELECT
         c.id,
         c.sender_id,
         c.status,
         c.created_at,
         t.name,
         t.subjects,
         t.profile_pic,
         t.bio,
         t.experience_years,
         t.is_verified
       FROM collaborations c
       JOIN teachers t ON t.user_id = c.sender_id
       WHERE c.receiver_id = ?
       ORDER BY c.created_at DESC`,
      [myUserId]
    );

    const shaped = rows.map(r => ({
      id:         r.id,
      sender_id:  r.sender_id,
      status:     r.status,
      created_at: r.created_at,
      sender: {
        name:             r.name,
        subjects:         r.subjects,
        profile_pic:      r.profile_pic,
        bio:              r.bio,
        experience_years: r.experience_years,
        is_verified:      r.is_verified,
      },
    }));

    res.json({ requests: shaped });
  } catch (err) {
    console.error("getIncomingRequests error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── Get all accepted collaborations ──────────────────────────────────────────
exports.getCollaborations = async (req, res) => {
  try {
    const myUserId = req.user.id;

    const [rows] = await db.query(
      `SELECT
         c.id,
         c.sender_id,
         c.receiver_id,
         c.status,
         c.created_at,
         c.accepted_at,

         ts.name        AS sender_name,
         ts.subjects    AS sender_subjects,
         ts.profile_pic AS sender_pic,
         ts.bio         AS sender_bio,
         ts.is_verified AS sender_verified,

         tr.name        AS receiver_name,
         tr.subjects    AS receiver_subjects,
         tr.profile_pic AS receiver_pic,
         tr.bio         AS receiver_bio,
         tr.is_verified AS receiver_verified

       FROM collaborations c
       JOIN teachers ts ON ts.user_id = c.sender_id
       JOIN teachers tr ON tr.user_id = c.receiver_id
       WHERE (c.sender_id = ? OR c.receiver_id = ?)
         AND c.status = 'accepted'
       ORDER BY c.accepted_at DESC`,
      [myUserId, myUserId]
    );

    const shaped = rows.map(r => ({
      id:          r.id,
      sender_id:   r.sender_id,
      receiver_id: r.receiver_id,
      created_at:  r.created_at,
      accepted_at: r.accepted_at,
      sender: {
        name:        r.sender_name,
        subjects:    r.sender_subjects,
        profile_pic: r.sender_pic,
        bio:         r.sender_bio,
        is_verified: r.sender_verified,
      },
      receiver: {
        name:        r.receiver_name,
        subjects:    r.receiver_subjects,
        profile_pic: r.receiver_pic,
        bio:         r.receiver_bio,
        is_verified: r.receiver_verified,
      },
    }));

    res.json({ collaborations: shaped });
  } catch (err) {
    console.error("getCollaborations error:", err);
    res.status(500).json({ message: "Server error." });
  }
};