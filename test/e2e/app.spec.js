import { browser, expect } from "@wdio/globals";

/** UI5 rewrites control ids (e.g. ...View1--iconTabBar); match suffix or role. */
async function getIconTabBar() {
    const bySuffix = await browser.$('[id*="--iconTabBar"]');
    if (await bySuffix.isExisting()) {
        return bySuffix;
    }
    return browser.$(".sapMIconTabBar");
}

describe("Demotest UI5 app (E2E)", () => {
    it("loads index and shows IconTabBar", async () => {
        await browser.url("/index.html");
        const tabBar = await getIconTabBar();
        await tabBar.waitForDisplayed({ timeout: 90000 });
        await expect(tabBar).toBeDisplayed();
    });

    it("shows orders table on first tab", async () => {
        await browser.url("/index.html");
        await (await getIconTabBar()).waitForDisplayed({ timeout: 90000 });
        const table = await browser.$('[id*="--ordersTable"]');
        await table.waitForDisplayed({ timeout: 30000 });
        await expect(table).toBeDisplayed();
    });

    it("switching to Form tab shows customer input", async () => {
        await browser.url("/index.html");
        const oTabBar = await getIconTabBar();
        await oTabBar.waitForDisplayed({ timeout: 90000 });

        const aTabs = await oTabBar.$$(".sapMITBFilter");
        expect(aTabs.length).toBeGreaterThanOrEqual(2);
        await aTabs[1].waitForClickable({ timeout: 15000 });
        await aTabs[1].click();

        const customerInput = await browser.$('[id*="--customerInput"]');
        await customerInput.waitForDisplayed({ timeout: 15000 });
        await expect(customerInput).toBeDisplayed();
    });
});
