# Spike Front Matter

Jekyll like yaml based front matter for Spike.

## Installation

- cd into your projects root
- Run `npm i spike-front-matter -S`
- modify your `app.js` file to include the plugin, as such

  ```js
  const FrontMatter = require('spike-front-matter')
  let fm = new FrontMatter()

  module.exports = {
    posthtml: (ctx) => {
      return {
        defaults: [
          jade({ filename: ctx.resourcePath, page: fm.page, site: fm.site}),
        ]
      }
    },
    plugins: [
      fm
    ]
  }
  ```

## Usage

The Spike Front Matter plugin provides you with two properties on the plugin object: `page`, and `site`. The `page` property is an object containing the front matter for the currently compiling file. The `site` property on the other hand contains all the font matter objects nested within their respective folders.
