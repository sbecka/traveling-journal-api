module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: "https://traveling-journal-app.now.sh",
    DB_URL: process.env.DB_URL || "postgresql://dunder_mifflin@localhost/traveling-journals",
    JWT_SECRET: process.env.JWT_SECRET || 'change-secret'
};