import { browser, expect } from "@wdio/globals";

/** Wait until UI5 bootstrapped and IconTabBar is visible (works better than element-only waits on Linux/CI). */
async function waitForIconTabBarVisible(timeout = 120000) {
    await browser.waitUntil(
        async () => {
            const ok = await browser.execute(() => {
                const el =
                    document.querySelector('[id*="--iconTabBar"].sapMIconTabBar') ||
                    document.querySelector(".sapMIconTabBar") ||
                    document.querySelector('[id*="--iconTabBar"]');
                if (!el) {
                    return false;
                }
                const r = el.getBoundingClientRect();
                const st = window.getComputedStyle(el);
                return (
                    r.width > 0 &&
                    r.height > 0 &&
                    st.visibility !== "hidden" &&
                    st.display !== "none"
                );
            });
            return ok === true;
        },
        {
            timeout,
            interval: 500,
            timeoutMsg: "IconTabBar did not become visible (UI5 bootstrap or CDN)"
        }
    );
}

/** Clicks the n-th IconTabFilter header (0-based) via DOM — more reliable than Webdriver click on UI5. */
async function clickIconTabFilterIndex(index) {
    await browser.execute(
        (i) => {
            const root =
                document.querySelector('[id*="--iconTabBar"].sapMIconTabBar') ||
                document.querySelector(".sapMIconTabBar");
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
        await waitForIconTabBarVisible();
    });

    it("loads index and shows IconTabBar", async () => {
        const tabBar = await browser.$(".sapMIconTabBar");
        await expect(tabBar).toBeDisplayed();
    });

    it("shows orders table on first tab", async () => {
        const table = await browser.$('[id*="--ordersTable"]');
        await table.waitForDisplayed({ timeout: 60000 });
        await expect(table).toBeDisplayed();
    });

    it("switching to Form tab shows customer input", async () => {
        const root = await browser.$(".sapMIconTabBar");
        const tabs = await root.$$(".sapMITBFilter");
        expect(tabs.length).toBeGreaterThanOrEqual(2);

        await clickIconTabFilterIndex(1);

        const customerInput = await browser.$('[id*="--customerInput"]');
        await customerInput.waitForDisplayed({ timeout: 60000 });
        await expect(customerInput).toBeDisplayed();
    });
});
