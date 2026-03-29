import { browser, expect } from "@wdio/globals";

/**
 * Wait until the IconTabBar root (.sapMIconTabBar) is in the DOM, visible, and has tab headers.
 * We require `.sapMIconTabBar` here (not only [id*="--iconTabBar"]) so WebdriverIO sees the same node later.
 */
async function waitForIconTabBarReady(timeout = 120000) {
    await browser.waitUntil(
        async () =>
            (await browser.execute(() => {
                const bar = document.querySelector(".sapMIconTabBar");
                if (!bar) {
                    return false;
                }
                const tabs = bar.querySelectorAll(".sapMITBFilter");
                if (tabs.length < 2) {
                    return false;
                }
                const r = bar.getBoundingClientRect();
                const st = getComputedStyle(bar);
                return (
                    r.width > 0 &&
                    r.height > 0 &&
                    st.visibility !== "hidden" &&
                    st.display !== "none"
                );
            })) === true,
        {
            timeout,
            interval: 500,
            timeoutMsg: "IconTabBar (.sapMIconTabBar) not ready with 2+ tabs (UI5 bootstrap / CDN)"
        }
    );

    const bar = await browser.$(".sapMIconTabBar");
    await bar.waitForExist({ timeout: 60000 });
    await bar.waitForDisplayed({ timeout: 60000 });
}

/** Clicks the n-th IconTabFilter header (0-based) via DOM — more reliable than Webdriver click on UI5. */
async function clickIconTabFilterIndex(index) {
    await browser.execute(
        (i) => {
            const root = document.querySelector(".sapMIconTabBar");
            if (!root) {
                throw new Error("IconTabBar root not found");
            }
            const tabs = root.querySelectorAll(".sapMITBFilter");
            if (tabs.length <= i) {
                throw new Error(`Expected at least ${i + 1} tabs, found ${tabs.length}`);
            }
            const tab = tabs[i];
            tab.scrollIntoView({ block: "nearest", inline: "center" });
            tab.click();
        },
        index
    );
}

describe("Demotest UI5 app (E2E)", () => {
    beforeEach(async () => {
        await browser.url("/index.html");
        await waitForIconTabBarReady();
    });

    it("loads index and shows IconTabBar", async () => {
        const bar = await browser.$(".sapMIconTabBar");
        await expect(bar).toBeDisplayed();
    });

    it("shows orders table on first tab", async () => {
        const table = await browser.$('[id*="--ordersTable"]');
        await table.waitForDisplayed({ timeout: 60000 });
        await expect(table).toBeDisplayed();
    });

    it("switching to Form tab shows customer input", async () => {
        const tabCount = await browser.execute(
            () => document.querySelectorAll(".sapMIconTabBar .sapMITBFilter").length
        );
        expect(tabCount).toBeGreaterThanOrEqual(2);

        await clickIconTabFilterIndex(1);

        const customerInput = await browser.$('[id*="--customerInput"]');
        await customerInput.waitForDisplayed({ timeout: 60000 });
        await expect(customerInput).toBeDisplayed();
    });
});
