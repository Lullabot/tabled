"use strict";
var Selectors;
(function (Selectors) {
    Selectors["stacked"] = "tabled--stacked";
    Selectors["table"] = "tabled__table";
    Selectors["columnLarge"] = "tabled__column--large";
    Selectors["columnSmall"] = "tabled__column--small";
    Selectors["wrapper"] = "tabled__wrapper";
    Selectors["container"] = "tabled";
    Selectors["fadeLeft"] = "tabled--fade-left";
    Selectors["fadeRight"] = "tabled--fade-right";
    Selectors["navigation"] = "tabled__navigation";
    Selectors["previous"] = "tabled__previous";
    Selectors["next"] = "tabled__next";
    Selectors["caption"] = "tabled__caption";
})(Selectors || (Selectors = {}));
class Tabled {
    constructor(options) {
        if (!options.index) {
            options.index = Math.floor(Math.random() * 10000);
        }
        if (this.checkConditions(options.table)) {
            options.table.classList.add(Selectors.table);
            this.wrap(options.table);
            const wrapper = this.getWrapper(options.table);
            wrapper.setAttribute("id", "tabled-n" + options.index);
            this.adjustColumnsWidth(options);
            this.addTableControls(options);
            this.applyFade(options.table);
            wrapper.addEventListener("scroll", () => {
                this.applyFade(options.table);
            });
            new ResizeObserver(() => {
                this.applyFade(options.table);
            }).observe(wrapper);
        }
        else if (options.table.classList.contains(Selectors.stacked)) {
            const headers = Array.from(options.table.querySelectorAll("thead th"));
            const rows = Array.from(options.table.querySelectorAll("tbody tr"));
            rows.forEach((row) => {
                const cells = Array.from(row.querySelectorAll("td, th"));
                cells.forEach((cell, index) => {
                    const header = headers[index];
                    if (header) {
                        cell.setAttribute("data-label", header.innerText + ": ");
                    }
                });
            });
        }
        else if (options.failClass) {
            options.table.classList.add(options.failClass);
        }
    }
    getWrapper(table) {
        return table.parentNode;
    }
    getContainer(table) {
        return table.parentNode
            ? table.parentNode.parentNode
            : null;
    }
    adjustColumnsWidth(options) {
        var _a, _b;
        const BR_RE = /<br\s*\/?>/gi;
        const HTML_RE = /<[^>]*>/g;
        const characterThresholdLarge = (_a = options.characterThresholdLarge) !== null && _a !== void 0 ? _a : 30;
        const characterThresholdSmall = (_b = options.characterThresholdSmall) !== null && _b !== void 0 ? _b : 10;
        for (let row of options.table.rows) {
            Array.from(row.cells).forEach((cell) => {
                const parts = cell.innerHTML.split(BR_RE).map(p => p.replace(HTML_RE, "").trim());
                const isLong = parts.some(p => p.length > characterThresholdLarge);
                const isShort = parts.every(p => p.length <= characterThresholdSmall);
                if (isLong) {
                    cell.classList.add(Selectors.columnLarge);
                }
                else if (isShort) {
                    cell.classList.add(Selectors.columnSmall);
                }
            });
        }
    }
    wrap(table) {
        const wrapper = document.createElement("div");
        wrapper.classList.add(Selectors.wrapper);
        wrapper.setAttribute("tabindex", "0");
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        const container = document.createElement("div");
        container.classList.add(Selectors.container);
        wrapper.parentNode.insertBefore(container, wrapper);
        container.appendChild(wrapper);
    }
    applyFade(table) {
        const wrapper = this.getWrapper(table), container = wrapper.parentNode, previousButton = container.getElementsByClassName(Selectors.previous)[0], nextButton = container.getElementsByClassName(Selectors.next)[0];
        if (wrapper.scrollLeft > 1) {
            container.classList.add(Selectors.fadeLeft);
            previousButton.removeAttribute("disabled");
        }
        else {
            container.classList.remove(Selectors.fadeLeft);
            previousButton.setAttribute("disabled", "disabled");
        }
        const width = wrapper.offsetWidth, scrollWidth = wrapper.scrollWidth;
        if (scrollWidth - wrapper.scrollLeft - width <= 1) {
            container.classList.remove(Selectors.fadeRight);
            nextButton.setAttribute("disabled", "disabled");
        }
        else {
            container.classList.add(Selectors.fadeRight);
            nextButton.removeAttribute("disabled");
        }
    }
    move(table, direction = "previous") {
        var _a, _b;
        const wrapper = this.getWrapper(table);
        const containerLeft = (_b = (_a = wrapper.parentNode) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().left) !== null && _b !== void 0 ? _b : 0;
        const columns = table.rows[0].cells.length > 1
            ? table.rows[0].cells
            : table.rows[1].cells;
        let currentLeft = 0;
        let scrollToPosition = 0;
        if (direction == "next") {
            for (let i = 0; i < columns.length; i++) {
                let columnLeft = columns[i].getClientRects()[0].left;
                currentLeft = columnLeft - containerLeft;
                if (currentLeft > 1) {
                    scrollToPosition = columns[i].offsetLeft;
                    break;
                }
            }
        }
        else if (direction == "previous") {
            for (let i = columns.length - 1; i > 0; i--) {
                let columnLeft = columns[i].getClientRects()[0].left;
                currentLeft = columnLeft - containerLeft;
                if (currentLeft < 0) {
                    scrollToPosition = columns[i].offsetLeft;
                    break;
                }
            }
        }
        wrapper.scrollTo({
            left: scrollToPosition,
            top: 0,
            behavior: "smooth",
        });
    }
    addTableControls(options) {
        const table = options.table;
        const navigationContainer = document.createElement("div");
        navigationContainer.classList.add(Selectors.navigation);
        ["previous", "next"].forEach((direction) => {
            let button = document.createElement("button");
            button.classList.add("tabled__" + direction);
            button.setAttribute("aria-label", direction + " table column");
            button.setAttribute("aria-controls", this.getWrapper(table).getAttribute("id"));
            button.setAttribute("disabled", "disabled");
            button.setAttribute("type", "button");
            button.addEventListener("click", () => {
                this.move(table, direction);
            });
            navigationContainer.appendChild(button);
        });
        const tableContainer = this.getContainer(table);
        if (tableContainer) {
            tableContainer.prepend(navigationContainer);
        }
        const caption = table.querySelector("caption");
        if (caption) {
            caption.classList.add("visually-hidden");
            if (!caption.classList.contains("hide-caption")) {
                const captionDiv = document.createElement("div");
                captionDiv.classList.add(Selectors.caption);
                if (options.captionSide === "bottom") {
                    captionDiv.classList.add("tabled__caption--bottom");
                }
                captionDiv.innerHTML = caption.innerText;
                captionDiv.setAttribute("aria-hidden", "true");
                const container = this.getContainer(table);
                if (container) {
                    options.captionSide === "bottom"
                        ? container.appendChild(captionDiv)
                        : container.prepend(captionDiv);
                }
            }
        }
    }
    checkConditions(table) {
        if (table.classList.contains(Selectors.stacked)) {
            return false;
        }
        if (table.querySelector("table")) {
            return false;
        }
        if (!table.querySelector("table > tbody")) {
            return false;
        }
        const result = document.evaluate("ancestor::table", table, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (result) {
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=tabled.js.map