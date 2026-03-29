sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, JSONModel, MessageToast, MessageBox) => {
    "use strict";

    const buildInitialData = () => ({
        orders: [
            {
                orderId: "4500000123",
                customer: "Acme Corporation",
                status: "Open",
                statusState: "Warning",
                amount: 12840.5,
                currency: "USD"
            },
            {
                orderId: "4500000456",
                customer: "Northwind Traders",
                status: "Shipped",
                statusState: "Success",
                amount: 932.1,
                currency: "EUR"
            },
            {
                orderId: "4500000789",
                customer: "Contoso Ltd",
                status: "Blocked",
                statusState: "Error",
                amount: 21500,
                currency: "USD"
            },
            {
                orderId: "4500000991",
                customer: "Fabrikam Industries",
                status: "Open",
                statusState: "Information",
                amount: 3400.75,
                currency: "GBP"
            }
        ],
        ordersAll: [],
        form: {
            customer: "",
            notes: "",
            priority: "M",
            urgent: false,
            dueDate: null
        },
        feedItems: [
            {
                key: "n1",
                title: "Demo: IconTabBar",
                description: "Orders, form controls, and overview in one page.",
                icon: "sap-icon://hint"
            },
            {
                key: "n2",
                title: "Table with toolbar",
                description: "Sortable-style layout with search filter on live change.",
                icon: "sap-icon://table-chart"
            },
            {
                key: "n3",
                title: "GitHub Pages",
                description: "Static hosting works when UI5 core is loaded from CDN.",
                icon: "sap-icon://it-host"
            }
        ]
    });

    return Controller.extend("demotest.controller.View1", {
        onInit() {
            const oData = buildInitialData();
            oData.ordersAll = oData.orders.slice();
            const oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "view");
        },

        onTabSelect(oEvent) {
            const sKey = oEvent.getParameter("key");
            const oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            MessageToast.show(oRB.getText("msgTabSelected", [sKey]), { duration: 1500 });
        },

        onOrderSelect(oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const oCtx = oItem.getBindingContext("view");
            if (!oCtx) {
                return;
            }
            const oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            MessageToast.show(oRB.getText("msgOrderSelected", [oCtx.getProperty("orderId")]));
        },

        onSearchOrders(oEvent) {
            const sQuery = (oEvent.getParameter("newValue") || "").trim().toLowerCase();
            const oModel = this.getView().getModel("view");
            const aAll = oModel.getProperty("/ordersAll");
            if (!sQuery) {
                oModel.setProperty("/orders", aAll.slice());
                return;
            }
            const aFiltered = aAll.filter((r) =>
                [r.orderId, r.customer, r.status].some((v) =>
                    String(v).toLowerCase().includes(sQuery))
            );
            oModel.setProperty("/orders", aFiltered);
        },

        onSubmit() {
            const oView = this.getView();
            const oModel = oView.getModel("view");
            const oForm = oModel.getProperty("/form");
            const oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            if (!oForm.customer || !String(oForm.customer).trim()) {
                MessageBox.error(oRB.getText("errCustomerRequired"));
                return;
            }

            MessageToast.show(oRB.getText(
                "msgSubmit",
                [oForm.customer.trim(), oForm.priority]
            ));
        },

        onReset() {
            const oModel = this.getView().getModel("view");
            oModel.setProperty("/form", {
                customer: "",
                notes: "",
                priority: "M",
                urgent: false,
                dueDate: null
            });
            const oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            MessageToast.show(oRB.getText("msgReset"));
        },

        onRefreshFeed() {
            const oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            MessageToast.show(oRB.getText("msgRefreshFeed"));
        },

        onFeedItemPress(oEvent) {
            const oItem = oEvent.getSource();
            const oCtx = oItem.getBindingContext("view");
            if (!oCtx) {
                return;
            }
            const oRB = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            MessageToast.show(oRB.getText("msgFeedItem", [oCtx.getProperty("title")]));
        }
    });
});
