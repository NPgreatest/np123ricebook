const JasmineReporters = require('jasmine-reporters');
const path = require('path');

const junitReporter = new JasmineReporters.JUnitXmlReporter({
  savePath: path.resolve(__dirname, '../../'), // Output directory for the report
  consolidateAll: true, // Save all test results in a single file
  filePrefix: 'junit-report', // Prefix for the report file
  modifyReportFileName: (generatedFileName, suite) => {
    return `${generatedFileName}-${suite}`;
  },
});
console.log('Adding JUnitXmlReporter to Jasmine environment');
jasmine.getEnv().addReporter(junitReporter);

