# Spike Front Matter
[![npm version](https://badge.fury.io/js/spike-front-matter.svg)](https://badge.fury.io/js/spike-front-matter) [![Dependency Status](https://david-dm.org/RedHatter/spike-front-matter.svg)](https://david-dm.org/RedHatter/spike-front-matter)  [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

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

The Spike Front Matter plugin provides you with two properties on the plugin object: `page`, and `site`. The `page` property is an object containing the front matter for the currently compiling file. The `site` property on the other hand contains all the font matter objects nested within their respective folders. See *installation* for an example of how to use these properties.

### What is Front Matter
Front matter is [yaml](https://learnxinyminutes.com/docs/yaml/) data inserted at the top of any file between a set of `---`. See below.

```
---
title: A string
property: value
block: |
    This is a multi-line property.
    See? Second line.
---
extends layout

block content
  h1= page.title
  p= page.block
```
