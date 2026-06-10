import js from '@eslint/js'

export default [
  // ─── Konfigurasi untuk file kode produksi ────────────────────────────────
  {
    files: ['src/**/*.js'],
    ignores: ['src/**/*.test.js'],

    // Beritahu ESLint bahwa ini berjalan di Node.js
    // (agar process, console, dll dikenali sebagai global yang valid)
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      }
    },

    ...js.configs.recommended,

    rules: {
      // Variabel yang dideklarasikan tapi tidak dipakai → peringatan
      'no-unused-vars': 'warn',

      // Tidak boleh ada console.log di kode produksi → peringatan
      'no-console': 'warn',

      // Tidak boleh ada kode yang tidak bisa dijalankan → error
      'no-unreachable': 'error',

      // Wajib pakai === bukan == → error
      'eqeqeq': 'error',
    }
  },

  // ─── Konfigurasi untuk file test ─────────────────────────────────────────
  // File test boleh pakai console, dan perlu kenal global Jest
  {
    files: ['src/**/*.test.js'],

    languageOptions: {
      globals: {
        // Global Node.js
        process: 'readonly',
        console: 'readonly',
        // Global Jest (describe, it, expect, jest, beforeAll, afterEach, dll)
        describe:   'readonly',
        it:         'readonly',
        test:       'readonly',
        expect:     'readonly',
        jest:       'readonly',
        beforeAll:  'readonly',
        afterAll:   'readonly',
        beforeEach: 'readonly',
        afterEach:  'readonly',
      }
    },

    rules: {
      'no-unused-vars': 'warn',
      'eqeqeq': 'error',
      // Di file test, console.log dibolehkan (untuk debugging)
      'no-console': 'off',
    }
  }
]
