### Description of Changes
Summarize the changes and the problem solved.

### Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New algorithmic feature (e.g. new graph algorithm or forensic rule)
- [ ] Performance optimization or refactor
- [ ] Documentation update
- [ ] Test suite enhancement

### Verification & Testing
Describe the tests executed to verify changes:
- [ ] C++ unit test suite (`make -C engine test`) passes with zero failures.
- [ ] Backend API regression tests (`node test_e2e.js`) pass.
- [ ] Dataset catalog integration tests (`node test_all_datasets.js`) pass.
- [ ] Custom lab regression tests (`node test_custom_lab.js`) pass.
- [ ] Frontend builds without TypeScript or Vite errors (`cd frontend && npm run build`).

### Checklist
- [ ] My code adheres to the project's coding standards.
- [ ] All monetary operations strictly use integer paise (`AmountPaise` / `int64_t`).
- [ ] No secrets, keys, or sensitive data are committed.
- [ ] Documentation has been updated accordingly.
