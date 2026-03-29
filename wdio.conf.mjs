import fs from "node:fs/promises";
import path from "node:path";
import mergeResults from "@wdio/json-reporter/mergeResults";

export const config = {
    runner: "local",
    specs: ["./test/e2e/**/*.spec.js"],
    baseUrl: process.env.E2E_BASE_URL || "http://127.0.0.1:8080",

    maxInstances: 1,

    capabilities: [{
        browserName: "chrome",
        "goog:chromeOptions": {
            args: [
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--window-size=1920,1080"
            ]
        }
    }],

    logLevel: "warn",

    framework: "mocha",
    reporters: [
        "spec",
        ["junit", {
            outputDir: "./reports/junit",
            setLogFile: (cid) => `./reports/junit/e2e-results-${cid || "0"}.xml`
        }],
        ["json", {
            outputDir: "./reports/json",
            outputFileFormat: (opts) => `wdio-e2e-${opts.cid}.json`
        }]
    ],

    mochaOpts: {
        ui: "bdd",
        timeout: 120000
    },

    /**
     * Produce reports/e2e-summary.txt and merged reports/json/e2e-results.json for CI artifacts.
     */
    onComplete: async () => {
        const jsonDir = path.join(process.cwd(), "reports", "json");
        const summaryPath = path.join(process.cwd(), "reports", "e2e-summary.txt");
        try {
            await mergeResults(jsonDir, "wdio-e2e-.*\\.json", "e2e-results.json");
            const mergedPath = path.join(jsonDir, "e2e-results.json");
            const data = JSON.parse(await fs.readFile(mergedPath, "utf8"));
            const st = data.state || {};
            const lines = [
                "WebdriverIO E2E summary",
                "========================",
                `Passed:  ${st.passed ?? 0}`,
                `Failed:  ${st.failed ?? 0}`,
                `Skipped: ${st.skipped ?? 0}`,
                "",
                "Files (under reports/ after this run):",
                "  - e2e-summary.txt      (this summary)",
                "  - junit/e2e-results-*.xml",
                "  - json/e2e-results.json (merged details)"
            ];
            await fs.writeFile(summaryPath, lines.join("\n"), "utf8");
        } catch {
            await fs.writeFile(
                summaryPath,
                "WebdriverIO E2E summary\n========================\nCould not merge JSON results (see workflow log and raw reports/json/).",
                "utf8"
            );
        }
    }
};
