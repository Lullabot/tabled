interface TabledOptions {
    table: HTMLTableElement;
    failClass?: string;
    index?: number;
    captionSide?: "top" | "bottom";
    characterThresholdLarge?: number;
    characterThresholdSmall?: number;
}
declare enum Selectors {
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
    caption = "tabled__caption"
}
declare class Tabled {
    constructor(options: TabledOptions);
    private getWrapper;
    private getContainer;
    private adjustColumnsWidth;
    private wrap;
    private applyFade;
    private move;
    private addTableControls;
    private checkConditions;
}
