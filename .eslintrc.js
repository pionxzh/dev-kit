module.exports = {
  root: true,
  extends: './config/eslint',
  overrides: [
    {
      files: ['*.d.ts', '*.ts', '*.mts'],
      rules: {
        'no-undef': 'off'
      }
    }
  ]
}
