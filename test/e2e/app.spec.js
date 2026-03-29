import { browser, expect } from "@wdio/globals";

/**
 * Wait until the main view is usable: orders table is visible (UI5 + first tab content loaded).
 * Using the table avoids flaky waits for all tab headers when the CDN is slow.
 */
async function waitForAppShell(timeout = 180000) {
    await browser.waitUntil(
        async () =>
            (await browser.execute(() => {
                const table = document.querySelector('[id*="--ordersTable"]');
                if (!table) {
                    return false;
                }
                const r = table.getBoundingClientRect();
                const st = getComputedStyle(table);
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
            timeoutMsg:
                "Orders table never appeared — UI5 may not load (network / https://ui5.sap.com blocked or very slow)."
        }
    );

    const table = await browser.$('[id*="--ordersTable"]');
    await table.waitForDisplayed({ timeout: 60000 });
}

/** Wait for enough tab headers to switch (Form = index 1). */
async function waitForTabHeaders(atLeast, timeout = 90000) {
    await browser.waitUntil(
        async () =>
            (await browser.execute((min) => {
                    const bar = (() => {
                        const table = document.querySelector('[id*="--ordersTable"]');
                        let b = table?.closest(".sapMIconTabBar");
                        if (!b && table) {
                            b = table.closest('[class*="IconTabBar"]');
                        }
                        if (!b) {
                            b = document.querySelector(".sapMIconTabBar");
                        }
                        if (!b) {
                            const byId = document.querySelector('[id*="--iconTabBar"]');
                            b = byId?.closest(".sapMIconTabBar");
                            if (!b && byId) {
                                b = byId.closest('[class*="IconTabBar"]');
                            }
                            if (!b) {
                                b = byId;
                            }
                        }
                        return b;
                    })();
                    if (!bar) {
                        return false;
                    }
                    const br = bar.getBoundingClientRect();
                    const bst = getComputedStyle(bar);
                    const barOk =
                        br.width > 0 &&
                        br.height > 0 &&
                        bst.visibility !== "hidden" &&
                        bst.display !== "none";
                    if (!barOk) {
                        return false;
                    }
                    let tabs = bar.querySelectorAll(".sapMITBFilter");
                    if (tabs.length < min) {
                        tabs = bar.querySelectorAll('[role="tab"]');
                    }
                    return tabs.length >= min;
                },
                atLeast
            )) === true,
        {
            timeout,
            interval: 400,
            timeoutMsg: `Expected at least ${atLeast} IconTab headers (.sapMITBFilter or role=tab).`
        }
    );
}

/**
 * Select IconTabBar tab by view key (see View1.view.xml IconTabFilter key="…").
 * Raw DOM .click() on headers often does not run UI5 selection, so the Form content never mounts.
 */
async function selectIconTabByKey(key) {
    await browser.execute((tabKey) => {
        const domBar = document.querySelector('[id*="--iconTabBar"]');
        if (!domBar?.id) {
            throw new Error("IconTabBar DOM not found");
        }
        const ctrl = sap.ui.core.Element.getElementById(domBar.id);
        if (!ctrl) {
            throw new Error("IconTabBar control not resolved");
        }
        if (typeof ctrl.setSelectedKey === "function") {
            ctrl.setSelectedKey(tabKey);
            return;
        }
        const items = ctrl.getItems?.();
        const item = items?.find?.((it) => it.getKey?.() === tabKey);
        if (item && typeof ctrl.setSelectedItem === "function") {
            ctrl.setSelectedItem(item);
            return;
        }
        throw new Error("Cannot select tab by key: " + tabKey);
    }, key);
}

/** Wait until customer field is actually visible (outer div or inner input). */
async function waitForCustomerFieldVisible(timeout = 90000) {
    await browser.waitUntil(
        async () =>
            (await browser.execute(() => {
                const root = document.querySelector('[id*="--customerInput"]');
                if (!root) {
                    return false;
                }
                const field = root.matches("input") ? root : root.querySelector("input");
                if (!field) {
                    return false;
                }
                const r = field.getBoundingClientRect();
                const st = getComputedStyle(field);
                return (
                    r.width > 0 &&
                    r.height > 0 &&
                    st.visibility !== "hidden" &&
                    st.display !== "none"
                );
            })) === true,
        {
            timeout,
            interval: 400,
            timeoutMsg: "Customer input not visible after selecting Form tab"
        }
    );
}

describe("Demotest UI5 app (E2E)", () => {
    beforeEach(async () => {
        await browser.url("/index.html");
        await waitForAppShell();
    });

    it("loads index and shows IconTabBar", async () => {
        // Prefer view id (stable); `.sapMIconTabBar` alone is flaky with some Chrome/WebdriverIO builds.
        const bar = await browser.$('[id*="--iconTabBar"]');
        await bar.waitForExist({ timeout: 60000 });
        await expect(bar).toBeDisplayed();
    });

    it("shows orders table on first tab", async () => {
        const table = await browser.$('[id*="--ordersTable"]');
        await expect(table).toBeDisplayed();
    });

    it("switching to Form tab shows customer input", async () => {
        await waitForTabHeaders(2);

        await selectIconTabByKey("controls");

        await waitForCustomerFieldVisible();

        const customerInput = await browser.$('[id*="--customerInput"]');
        await expect(customerInput).toBeDisplayed();
    });
});
