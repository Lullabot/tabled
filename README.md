
# Tabled
A plugin designed to enhance the usability and responsiveness of HTML tables on an accessible way.

Tabled is an HTML table plugin made to make your tables more user-friendly and adaptable on different viewport widths.

This plugin was created in order to have a lightweight solution that tries to offer a good experience while browsing data tables in the most user friendly way possible, following a similar approach than spreadsheet applications that will allow you to scroll through data without loosing the relationship between a data cell and the next.

This plugin was developed in collaboration with [@sganzer](https://github.com/sganzer), who assisted in designing the visual interface.


https://github.com/Javi-er/tabled/assets/141685/c7aae77d-8e53-4e65-92da-03c99ddfcb8f

https://github.com/Javi-er/tabled/assets/141685/1b60f8de-a8a9-47ec-a115-c2ffb467537b


## Live demo
https://html-preview.github.io/?url=https://github.com/Javi-er/tabled/blob/main/docs/examples.html

## Features
There are two render modes available, the default **"data table"** style which will add a scrollbar to the table and controls for navigating it. It uses button elements and native browser scrolling, it can be controlled with the keyboard and it's correctly described on accessibility API like a screen reader.

This mode will check that some requirements are met, specifically:
- That the table doesn't have another `table` element inside of it or it's contained inside another table.
- That the table has a `tbody` element.

This plugin it's meant to work with valid tables that are well formed, if a table has broken or invalid markup the results can be unstable, for these cases it's recommended to force the stacked mode instead.

On this mode, special classes will be added to cells with less or more than a predefined number of characters (which can be configured) in order to make columns narrower or wider depending on it's content.

The **Stacked rows** mode will not make any modifications at larger viewport widths, but it will stack the rows one on top of another under a predefined breakpoint (1024px). This mode is recommended for tables with invalid or overly complex markup.

Both modes are tested and meant to work with most common tables layout and it can not work for cases where the tables are overly complex or with specific needs.

If the table has a caption (which should always have for improving accessibility), this plugin will clone the caption text and place it on a div with a special class, this div is hidden from accessibility API's using the `aria-hidden` attribute while the table `<caption>` element is visually hidden but available to accessibility API's.

## Installation
Just add the Tabled JavaScript and CSS files to your project and initialize the plugin.

## Usage

- Add your table's HTML markup.
- Include Tabled's JavaScript and CSS files.
- Initialize the plugin with your preferred options.

## Options

The `Tabled` class will accept the following options:

- `table` (required): The HTML table element to be augmented.
- `failClass` (optional): The CSS class to be added to the table if it doesn't met the requirements.
- `index` (optional): The index of the table. If not provided, a random index will be generated. This is used for generating an unique ID for the table.
- `captionSide` (optional):  The side where the table caption should be placed. Possible values are "top" and "bottom". "top" by default.
- `characterThresholdLarge` (optional): The character threshold for determining if a cell should have a large width. Cells with text length greater than this threshold will have the "tabled__column--large" class added. Default value is 50.
- `characterThresholdSmall` (optional): The character threshold for determining if a cell should have a small width. Cells with text length less than or equal to this threshold will have the "tabled__column--small" class added. Default value is 8.

Also there are several CSS variables that can be overridden from your theme CSS, these include colors, spacing and column widths. The reference for these can be found at [tabled_core.scss](src/styles/tabled_core.scss).

## Styling

The styling for the tables is divided in two SASS files, `tabled_core.scss` which compiles to `styles.css` and `tabled_theme.scss` which compiles to `theme.css`.

You can include just `styles.css` to get the basic layout without the table styling and use `theme.css` as starting point for theming your own instance.

## Contributing and Feedback
We welcome contributions from the community to make Tabled even better. Whether it's reporting a bug, suggesting a feature, or contributing code, your help is appreciated.
Questions or feedback about Tabled? Feel free to reach out to us via the issue tracker.

## License
Tabled is licensed under the GPL (GNU General Public License), which means it's open-source and free to use, modify, and distribute for both personal and commercial projects.

## Examples

**Calling tabled from a Drupal JS file**

This will render every table using Tabled, exept by those specifically defined as "stacked" and also excluding layout builder tables.

```
((Drupal, once) => {
  /**
   * Initialize the behavior.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attach context and settings for the plugin.
   */
  Drupal.behaviors.tabled = {
    tableCount: 0,
    attach: function (context) {
      let index = Drupal.behaviors.tabled.tableCount;
      const tables = once('tabled',
      'table:not([data-drupal-selector="edit-settings-selection-table"])'
      , context);
      const options = { failClass: 'table--stacked' };
      tables.forEach((table) => {
      	new Tabled(table, index++, options);
      });
      Drupal.behaviors.tabled.tableCount = index;
    },
  };
})(Drupal, once);
```
