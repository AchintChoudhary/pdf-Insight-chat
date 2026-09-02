const attempts = new Map();
const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;

module.exports = (req, res, next) => {
  const key = `${req.ip}:${String(req.body?.email || "").trim().toLowerCase()}`;
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= maxAttempts) {
    return res.status(429).json({ success: false, message: "Too many password reset requests. Please try again later." });
  }
  recent.push(now);
  attempts.set(key, recent);
  return next();
};