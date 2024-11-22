
/**
 * Represents the options for configuring a Tabled instance.
 */
interface TabledOptions {
  /**
   * The HTML table element to be augmented.
   */
  table: HTMLTableElement;

  /**
   * The CSS class to be added to the table if it fails to initialize.
   */
  failClass?: string;

  /**
   * The index of the table. If not provided, a random index will be generated.
   */
  index?: number;

  /**
   * The side where the table caption should be placed. Possible values are "top" and "bottom".
   */
  captionSide?: "top" | "bottom";

  /**
   * The character threshold for determining if a cell should have a large width.
   * Cells with text length greater than this threshold will have the "tabled__column--large" class added.
   * Default value is 50.
   */
  characterThresholdLarge?: number;

  /**
   * The character threshold for determining if a cell should have a small width.
   * Cells with text length less than or equal to this threshold will have the "tabled__column--small" class added.
   * Default value is 8.
   */
  characterThresholdSmall?: number;
}


enum Selectors {
  stacked = "tabled--stacked",
  table = "tabled__table",
  columnLarge = "tabled__column--large",
  columnSmall = "tabled__column--small",
  wrapper = "tabled__wrapper",
  container = "tabled",
  fadeLeft = "tabled--fade-left",
  fadeRight = "tabled--fade-right",
  navigation = "tabled__navigation",
  previous = "tabled__previous",
  next = "tabled__next",
  caption = "tabled__caption",
}

/**
 * Represents a Tabled instance that augments a table with additional functionality.
 */
class Tabled {
  /**
   * The HTML table element.
   * Augment the table if it meets the necessary requirements.
   * @param {TabledOptions} options
   */
  constructor(options: TabledOptions) {
    // If there is not an index, generate a random one.
    if (!options.index) {
      options.index = Math.floor(Math.random() * 10000);
    }

    // Check if the table met the necessary conditions.
    if (this.checkConditions(options.table)) {
      // Set up attributes
      options.table.classList.add(Selectors.table);

      // Add the wrapper
      this.wrap(options.table);
      const wrapper: HTMLDivElement = this.getWrapper(options.table);
      wrapper.setAttribute("id", "tabled-n" + options.index);

      // Identify and adjust columns that could need a large width
      this.adjustColumnsWidth(options);

      // Add navigation controls.
      this.addTableControls(options);

      // Identify and set the initial state for the tables
      this.applyFade(options.table);

      // On table scrolling, add or remove the left / right fading
      wrapper.addEventListener("scroll", () => {
        this.applyFade(options.table);
      });

      // Initialize a resize observer for changing the table status
      new ResizeObserver(() => {
        this.applyFade(options.table);
      }).observe(wrapper);

      // Checks if the table should be rendered as stacked.
    } else if (options.table.classList.contains(Selectors.stacked)) {
      // Traverse the table and apply the column headers as data-label attributes
      const headers = Array.from(options.table.querySelectorAll("thead th"));
      const rows = Array.from(options.table.querySelectorAll("tbody tr"));

      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        cells.forEach((cell, index) => {
          const header = headers[index] as HTMLElement;
          if (header) {
            cell.setAttribute("data-label", header.innerText + ": ");
          }
        });
      });

      // Otherwise, add a class to the table to indicate that it failed to initialize.
    } else if (options.failClass) {
      options.table.classList.add(options.failClass);
    }
  }

  /**
   *  Returns the wrapper of the table.
   *
   * @param {HTMLTableElement} table
   * @returns HTMLDivElement
   */
  private getWrapper(table: HTMLTableElement): HTMLDivElement {
    return table.parentNode as HTMLDivElement;
  }

  /**
   *  Returns the container of the table.
   *
   * @param {HTMLTableElement} table
   * @returns HTMLDivElement
   */
  private getContainer(table: HTMLTableElement): HTMLDivElement | null {
    return table.parentNode
      ? (table.parentNode.parentNode as HTMLDivElement)
      : null;
  }

  /**
   * Adjust column widths for cells that can have plenty of content by looking
   * at the cell height.
   *
   * @param {TabledOptions} options
   */
  private adjustColumnsWidth(options: TabledOptions) {

    const characterThresholdLarge = options.characterThresholdLarge ?? 50;
    const characterThresholdSmall = options.characterThresholdSmall ?? 8;

    for (let row of options.table.rows) {
      Array.from(row.cells).forEach((cell) => {
        // Check if there are cells that are taller than the threshold
        if (cell.innerText.length > characterThresholdLarge) {
          cell.classList.add(Selectors.columnLarge);
        } else if (cell.innerText.length <= characterThresholdSmall) {
          cell.classList.add(Selectors.columnSmall);
        }
      });
    }
  }

  /**
   * Wraps an element with another.
   *
   * @param {HTMLTableElement} table
   */
  private wrap(table: HTMLTableElement) {
    // Wrap the table in the scrollable div
    const wrapper: HTMLDivElement = document.createElement("div");
    wrapper.classList.add(Selectors.wrapper);
    wrapper.setAttribute("tabindex", "0");
    table.parentNode!.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    // Wrap in another div for containing navigation and fading.
    const container: HTMLDivElement = document.createElement("div");
    container.classList.add(Selectors.container);
    wrapper.parentNode!.insertBefore(container, wrapper);
    container.appendChild(wrapper);
  }

  /**
   * Applies a fading effect on the edges according to the scrollbar position.
   *
   * @param {HTMLTableElement} table
   */
  private applyFade(table: HTMLTableElement) {
    const wrapper: HTMLDivElement = this.getWrapper(table),
      container = wrapper.parentNode as HTMLDivElement,
      previousButton = container.getElementsByClassName(
        Selectors.previous
      )[0] as HTMLButtonElement,
      nextButton = container.getElementsByClassName(
        Selectors.next
      )[0] as HTMLButtonElement;

    // Left fading
    if (wrapper.scrollLeft > 1) {
      container.classList.add(Selectors.fadeLeft);
      previousButton.removeAttribute("disabled");
    } else {
      container.classList.remove(Selectors.fadeLeft);
      previousButton.setAttribute("disabled", "disabled");
    }

    // Right fading
    const width: number = wrapper.offsetWidth,
      scrollWidth: number = wrapper.scrollWidth;

    // If there is less than a pixel of difference between the table
    if (scrollWidth - wrapper.scrollLeft - width < 1) {
      container.classList.remove(Selectors.fadeRight);
      nextButton.setAttribute("disabled", "disabled");
    } else {
      container.classList.add(Selectors.fadeRight);
      nextButton.removeAttribute("disabled");
    }
  }

  /**
   * Scroll the table in the specified direction.
   *
   * @param {HTMLTableElement} table
   * @param {string} direction ["previous", "next"]
   */
  private move(table: HTMLTableElement, direction: string = "previous") {
    const wrapper: HTMLDivElement = this.getWrapper(table);

    // Get the container's left position
    const containerLeft: number =
      (wrapper.parentNode as HTMLElement)?.getBoundingClientRect().left ?? 0;
    // The first row defines the columns, but in the case that the first row
    // has only one column, use the second row instead.
    const columns =
      table.rows[0].cells.length > 1
        ? table.rows[0].cells
        : table.rows[1].cells;
    let currentLeft: number = 0;
    let scrollToPosition: number = 0;

    // Loop through all the columns in the table and find the next or prev
    // column based on the position of each columns in the container.
    if (direction == "next") {
      for (let i = 0; i < columns.length; i++) {
        let columnLeft = columns[i].getClientRects()[0].left;
        currentLeft = columnLeft - containerLeft;
        if (currentLeft > 1) {
          scrollToPosition = columns[i].offsetLeft;
          break;
        }
      }
    } else if (direction == "previous") {
      for (let i = columns.length - 1; i > 0; i--) {
        // Get the left position of each column
        let columnLeft: number = columns[i].getClientRects()[0].left;
        currentLeft = columnLeft - containerLeft;

        if (currentLeft < 0) {
          scrollToPosition = columns[i].offsetLeft;
          break;
        }
      }
    }

    // Scroll to the identified position
    wrapper.scrollTo({
      left: scrollToPosition,
      top: 0,
      behavior: "smooth",
    });
  }

  /**
   * Creates and attaches the table navigation.
   *
   * @param {TabledOptions} options
   */
  private addTableControls(options: TabledOptions) {
    const table: HTMLTableElement = options.table;
    const navigationContainer: HTMLDivElement = document.createElement("div");
    navigationContainer.classList.add(Selectors.navigation);

    // Set up the navigation.
    ["previous", "next"].forEach((direction) => {
      let button: HTMLButtonElement = document.createElement("button");
      button.classList.add("tabled__" + direction);
      button.setAttribute("aria-label", direction + " table column");
      button.setAttribute(
        "aria-controls",
        this.getWrapper(table).getAttribute("id")!
      );
      button.setAttribute("disabled", "disabled");
      button.setAttribute("type", "button");
      button.addEventListener("click", () => {
        this.move(table, direction);
      });

      navigationContainer.appendChild(button);
    });

    const tableContainer: HTMLDivElement | null = this.getContainer(table);
    if (tableContainer) {
      tableContainer.prepend(navigationContainer);
    }

    // Tweak the caption.
    const caption: HTMLTableCaptionElement | null =
      table.querySelector("caption");

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

  /**
   * Validates if a table meets the necessary conditions for this plugin.
   *
   * @param {HTMLTableElement} table
   * @returns boolean
   */
  private checkConditions(table: HTMLTableElement) {
    // Check if the table should be rendered as stacked
    if (table.classList.contains(Selectors.stacked)) {
      return false;
    }

    // Don't initialize under the following conditions.
    // If a table has another table inside.
    if (table.querySelector("table")) {
      return false;
    }

    // If the table doesn't have a tbody element as a direct descendant.
    if (!table.querySelector("table > tbody")) {
      return false;
    }

    // If a table is contained in another table.
    const result = document.evaluate(
      "ancestor::table",
      table,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    if (result) {
      return false;
    }

    // If all pass
    return true;
  }
}
