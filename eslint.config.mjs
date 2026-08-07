import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Báo lỗi khi sử dụng biến chưa được định nghĩa
      "no-undef": "error",
      // Báo lỗi khi import nhưng không sử dụng
      "no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      // React specific rules
      "react/jsx-no-undef": "error", // Báo lỗi khi sử dụng component chưa import
      "react/react-in-jsx-scope": "off", // Không cần import React trong Next.js
    }
  }
]);

export default eslintConfig;
