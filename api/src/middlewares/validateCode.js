module.exports = (req, res, next) => {
  const { source_code, language } = req.body;

  if (source_code !== undefined && source_code.length > 5000) {
    return res.status(400).json({ error: "Source code too large" });
  }

  const allowedLangs = ["python"];
  if (language && !allowedLangs.includes(language)) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  next();
};
