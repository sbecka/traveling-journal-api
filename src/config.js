module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: "https://traveling-journal-app.now.sh",
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://dunder_mifflin@localhost/traveling-journals",
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/traveling-journals-test',
    JWT_SECRET: process.env.JWT_SECRET || 'change-secret'
};